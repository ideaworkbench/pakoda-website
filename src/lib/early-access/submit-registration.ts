"use server";

import "server-only";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { toStoredMobileNumber } from "./mobile-number";
import { type RegistrationFormValues, registrationSchema } from "./schema";
import { type SubmissionResult, submissionResultFromInsert } from "./submission-result";

/**
 * Stores an early-access registration (brief 9.1). Duplicates are caught by the unique index on
 * lower(email) at insert time, never by checking first, so two simultaneous submissions of the
 * same email cannot both get in.
 */
export async function submitRegistration(input: RegistrationFormValues): Promise<SubmissionResult> {
    const parsed = registrationSchema.safeParse(input);
    if (!parsed.success) {
        return { status: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }
    const registration = parsed.data;

    // Only bots fill the hidden honeypot. Pretending success gives them nothing to learn from.
    if (registration.website !== "") {
        return { status: "created" };
    }

    // The schema already requires consent; checked again here because storing a registration
    // without it must be impossible even if the schema changes.
    if (registration.consentGiven !== true) {
        return { status: "invalid", fieldErrors: { consentGiven: ["Consent is required."] } };
    }

    const { error } = await createServerSupabaseClient()
        .from("early_access_registrations")
        .insert({
            full_name: registration.fullName,
            business_name: registration.businessName,
            business_type: registration.businessType,
            mobile_number: toStoredMobileNumber(registration.mobileNumber),
            email: registration.email,
            order_channels: [...new Set(registration.orderChannels)],
            consent_given: true,
            consent_given_at: new Date().toISOString(),
        });

    const result = submissionResultFromInsert(error, registration.email);
    if (result.status === "error" && error) {
        // Code and message only: the error's details can echo the submitted row.
        console.error("Early access registration insert failed", { code: error.code, message: error.message });
    }
    return result;
}
