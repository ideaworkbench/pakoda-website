import { describe, expect, it } from "vitest";
import { businessTypeOptions, errorMessages, orderChannelOptions, registrationSchema } from "@/lib/early-access/schema";

const validInput = {
  fullName: "Asha Rao",
  businessName: "Rao Stores",
  businessType: "grocery",
  mobileNumber: "",
  email: "hello@pakoda.com",
  orderChannels: [],
  consentGiven: true,
  website: "",
};

function fieldErrorsFor(input: Record<string, unknown>) {
  const result = registrationSchema.safeParse(input);
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path.join("."), issue.message]));
}

describe("option lists", () => {
  it("lists business types in Figma order with their stored codes", () => {
    expect(businessTypeOptions).toEqual([
      { value: "grocery", label: "Grocery" },
      { value: "supermarket", label: "Supermarket" },
      { value: "restaurant", label: "Restaurant" },
      { value: "others", label: "Others" },
    ]);
  });

  it("lists order channels in Figma order with their stored codes", () => {
    expect(orderChannelOptions).toEqual([
      { value: "phone_calls", label: "Phone calls" },
      { value: "walk_in", label: "Walk-in" },
      { value: "chat_apps", label: "Chat apps" },
      { value: "delivery_apps", label: "Delivery apps" },
      { value: "other", label: "Other" },
    ]);
  });
});

describe("registrationSchema", () => {
  it("accepts a complete registration", () => {
    expect(registrationSchema.safeParse(validInput).success).toBe(true);
  });

  it("trims names and lower-cases and trims the email", () => {
    const parsed = registrationSchema.parse({
      ...validInput,
      fullName: "  Asha Rao  ",
      businessName: " Rao Stores ",
      email: "  Hello@Pakoda.COM ",
    });
    expect(parsed.fullName).toBe("Asha Rao");
    expect(parsed.businessName).toBe("Rao Stores");
    expect(parsed.email).toBe("hello@pakoda.com");
  });

  it("uses the Figma copy for each required field", () => {
    expect(errorMessages).toEqual({
      fullNameRequired: "Your name is mandatory.",
      businessNameRequired: "Business name is mandatory.",
      businessTypeRequired: "Business type is mandatory.",
      emailRequired: "Email address is mandatory.",
      emailInvalid: "Enter a valid email address.",
      mobileNumberIncomplete: "Enter a 10-digit mobile number.",
    });
  });

  it("rejects blank or whitespace-only names", () => {
    expect(fieldErrorsFor({ ...validInput, fullName: "   " }).fullName).toBe("Your name is mandatory.");
    expect(fieldErrorsFor({ ...validInput, businessName: "" }).businessName).toBe("Business name is mandatory.");
  });

  it("enforces the name length limits from the database", () => {
    expect(registrationSchema.safeParse({ ...validInput, fullName: "a".repeat(100) }).success).toBe(true);
    expect(registrationSchema.safeParse({ ...validInput, fullName: "a".repeat(101) }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...validInput, businessName: "a".repeat(150) }).success).toBe(true);
    expect(registrationSchema.safeParse({ ...validInput, businessName: "a".repeat(151) }).success).toBe(false);
  });

  it("requires a business type from the list", () => {
    expect(fieldErrorsFor({ ...validInput, businessType: "" }).businessType).toBe("Business type is mandatory.");
    expect(registrationSchema.safeParse({ ...validInput, businessType: "bakery" }).success).toBe(false);
  });

  it("distinguishes a missing email from an invalid one", () => {
    expect(fieldErrorsFor({ ...validInput, email: "  " }).email).toBe("Email address is mandatory.");
    expect(fieldErrorsFor({ ...validInput, email: "hello@" }).email).toBe("Enter a valid email address.");
  });

  it("rejects emails longer than 254 characters", () => {
    const longEmail = `${"a".repeat(64)}@${"b".repeat(185)}.com`;
    expect(longEmail.length).toBe(254);
    expect(registrationSchema.safeParse({ ...validInput, email: longEmail }).success).toBe(true);
    expect(registrationSchema.safeParse({ ...validInput, email: `a${longEmail}` }).success).toBe(false);
  });

  it("accepts an empty mobile number or exactly 10 digits", () => {
    expect(registrationSchema.safeParse({ ...validInput, mobileNumber: "" }).success).toBe(true);
    expect(registrationSchema.safeParse({ ...validInput, mobileNumber: "9876543210" }).success).toBe(true);
  });

  it("rejects a partly filled mobile number", () => {
    expect(fieldErrorsFor({ ...validInput, mobileNumber: "98765" }).mobileNumber).toBe("Enter a 10-digit mobile number.");
    expect(registrationSchema.safeParse({ ...validInput, mobileNumber: "98765432101" }).success).toBe(false);
  });

  it("accepts any combination of known order channels, including none", () => {
    expect(registrationSchema.safeParse({ ...validInput, orderChannels: ["walk_in", "delivery_apps"] }).success).toBe(true);
    expect(registrationSchema.safeParse({ ...validInput, orderChannels: ["fax"] }).success).toBe(false);
  });

  it("requires consent", () => {
    expect(registrationSchema.safeParse({ ...validInput, consentGiven: false }).success).toBe(false);
  });
});
