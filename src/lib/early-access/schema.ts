import { z } from "zod";

// Option order is the order Figma shows. Stored values must match the migration's check
// constraints; tests/unit/option-lists-match-migration.test.ts guards that.
export const businessTypeOptions = [
    { value: "grocery", label: "Grocery" },
    { value: "supermarket", label: "Supermarket" },
    { value: "restaurant", label: "Restaurant" },
    { value: "others", label: "Others" },
] as const;

export const orderChannelOptions = [
    { value: "phone_calls", label: "Phone calls" },
    { value: "walk_in", label: "Walk-in" },
    { value: "chat_apps", label: "Chat apps" },
    { value: "delivery_apps", label: "Delivery apps" },
    { value: "other", label: "Other" },
] as const;

export const errorMessages = {
    fullNameRequired: "Your name is mandatory.",
    businessNameRequired: "Business name is mandatory.",
    businessTypeRequired: "Business type is mandatory.",
    emailRequired: "Email address is mandatory.",
    emailInvalid: "Enter a valid email address.",
    mobileNumberIncomplete: "Enter a 10-digit mobile number.",
} as const;

// Limits mirror the database check constraints.
export const fieldMaxLengths = {
    fullName: 100,
    businessName: 150,
    email: 254,
} as const;

const businessTypeValues: readonly string[] = businessTypeOptions.map((option) => option.value);
const orderChannelValues: readonly string[] = orderChannelOptions.map((option) => option.value);

function requiredText(maxLength: number, requiredMessage: string) {
    return z.string().trim().min(1, requiredMessage).max(maxLength);
}

/**
 * The one schema for the form (through zodResolver) and the server action. Its input type
 * matches the form's values exactly (an unselected business type is ""), so the same
 * object flows from the form to the server unchanged.
 */
export const registrationSchema = z.object({
    fullName: requiredText(fieldMaxLengths.fullName, errorMessages.fullNameRequired),
    businessName: requiredText(fieldMaxLengths.businessName, errorMessages.businessNameRequired),
    businessType: z.string().refine((value) => businessTypeValues.includes(value), errorMessages.businessTypeRequired),
    // Digits only; the +91 prefix is display and storage formatting (see mobile-number.ts).
    mobileNumber: z.string().regex(/^(\d{10})?$/, errorMessages.mobileNumberIncomplete),
    email: z
        .string()
        .trim()
        .toLowerCase()
        .min(1, errorMessages.emailRequired)
        .pipe(z.email(errorMessages.emailInvalid).max(fieldMaxLengths.email, errorMessages.emailInvalid)),
    orderChannels: z.array(z.string().refine((value) => orderChannelValues.includes(value))),
    consentGiven: z.boolean().refine((value) => value),
    // Honeypot: hidden from people, so only bots fill it. The server action checks it.
    website: z.string(),
});

export type RegistrationFormValues = z.input<typeof registrationSchema>;
export type Registration = z.output<typeof registrationSchema>;

export const emptyRegistrationForm: RegistrationFormValues = {
    fullName: "",
    businessName: "",
    businessType: "",
    mobileNumber: "",
    email: "",
    orderChannels: [],
    consentGiven: false,
    website: "",
};
