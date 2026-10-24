import { describe, expect, it } from "vitest";
import { isReadyToSubmit } from "@/lib/early-access/submit-readiness";

const completeValues = {
  fullName: "Asha Rao",
  businessName: "Rao Stores",
  businessType: "grocery",
  mobileNumber: "",
  email: "hello@pakoda.com",
  orderChannels: [],
  consentGiven: true,
  website: "",
};

describe("isReadyToSubmit", () => {
  it("is ready when every required condition holds", () => {
    expect(isReadyToSubmit(completeValues)).toBe(true);
  });

  it("is ready with a complete 10-digit mobile number", () => {
    expect(isReadyToSubmit({ ...completeValues, mobileNumber: "9876543210" })).toBe(true);
  });

  it.each([
    ["name is empty", { fullName: "" }],
    ["name is only spaces", { fullName: "   " }],
    ["business name is empty", { businessName: "" }],
    ["business type is not selected", { businessType: "" }],
    ["email is empty", { email: "" }],
    ["email is invalid", { email: "hello@pakoda" }],
    ["mobile number is partly filled", { mobileNumber: "98765" }],
    ["consent is not ticked", { consentGiven: false }],
  ])("is not ready when %s", (_condition, change) => {
    expect(isReadyToSubmit({ ...completeValues, ...change })).toBe(false);
  });

  it("does not depend on order channels", () => {
    expect(isReadyToSubmit({ ...completeValues, orderChannels: ["walk_in", "other"] })).toBe(true);
  });
});
