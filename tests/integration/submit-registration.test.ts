import { afterEach, describe, expect, it } from "vitest";
import { submitRegistration } from "@/lib/early-access/submit-registration";
import { deleteRegistrationsWithEmail, registrationsWithEmail } from "../support/local-supabase";

const testEmail = "integration-test@pakoda.com";

const validInput = {
  fullName: "Asha Rao",
  businessName: "Rao Stores",
  businessType: "grocery",
  mobileNumber: "9876543210",
  email: testEmail,
  orderChannels: ["delivery_apps", "walk_in", "delivery_apps"],
  consentGiven: true,
  website: "",
};

afterEach(async () => {
  await deleteRegistrationsWithEmail(testEmail);
});

describe("submitRegistration against local Supabase", () => {
  it("stores one normalised row for a new email", async () => {
    const result = await submitRegistration({ ...validInput, email: "  Integration-Test@Pakoda.com " });

    expect(result).toEqual({ status: "created", email: testEmail });
    const rows = await registrationsWithEmail(testEmail);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      full_name: "Asha Rao",
      business_name: "Rao Stores",
      business_type: "grocery",
      mobile_number: "+919876543210",
      email: testEmail,
      order_channels: ["walk_in", "delivery_apps"],
      consent_given: true,
    });
    expect(rows[0].consent_given_at).toEqual(expect.any(String));
  });

  it("stores an empty mobile number as null", async () => {
    await submitRegistration({ ...validInput, mobileNumber: "" });

    const rows = await registrationsWithEmail(testEmail);
    expect(rows[0].mobile_number).toBeNull();
  });

  it("reports the same email in any letter case as already registered and keeps one row", async () => {
    await submitRegistration(validInput);
    const secondResult = await submitRegistration({ ...validInput, email: testEmail.toUpperCase() });

    expect(secondResult).toEqual({ status: "already_registered", email: testEmail });
    expect(await registrationsWithEmail(testEmail)).toHaveLength(1);
  });

  it("pretends success for a filled honeypot and stores nothing", async () => {
    const result = await submitRegistration({ ...validInput, website: "https://spam.example" });

    expect(result).toEqual({ status: "created" });
    expect(await registrationsWithEmail(testEmail)).toHaveLength(0);
  });

  it("returns field errors for invalid input and stores nothing", async () => {
    const result = await submitRegistration({ ...validInput, fullName: " ", mobileNumber: "98765" });

    expect(result).toEqual({
      status: "invalid",
      fieldErrors: {
        fullName: ["Your name is mandatory."],
        mobileNumber: ["Enter a 10-digit mobile number."],
      },
    });
    expect(await registrationsWithEmail(testEmail)).toHaveLength(0);
  });

  it("rejects a submission without consent", async () => {
    const result = await submitRegistration({ ...validInput, consentGiven: false });

    expect(result.status).toBe("invalid");
    expect(await registrationsWithEmail(testEmail)).toHaveLength(0);
  });
});
