import { describe, expect, it } from "vitest";
import {
  MOBILE_NUMBER_PREFIX,
  digitsFromPastedText,
  digitsFromTypedText,
  toDisplayValue,
  toStoredMobileNumber,
} from "@/lib/early-access/mobile-number";

describe("digitsFromTypedText", () => {
  it("keeps digits only", () => {
    expect(digitsFromTypedText("98a7-6 5")).toBe("98765");
  });

  it("stops at 10 digits", () => {
    expect(digitsFromTypedText("987654321012")).toBe("9876543210");
  });
});

describe("digitsFromPastedText", () => {
  it.each([
    ["+91 98765-43210", "9876543210"],
    ["+919876543210", "9876543210"],
    ["91 98765 43210", "9876543210"],
    ["09876543210", "9876543210"],
    ["98765 43210", "9876543210"],
    ["0091 98765 43210", "9876543210"],
  ])("normalises %s to %s", (pasted, expected) => {
    expect(digitsFromPastedText(pasted)).toBe(expected);
  });

  it("keeps the last 10 digits of a longer number", () => {
    expect(digitsFromPastedText("1234 98765 43210")).toBe("9876543210");
  });

  it("keeps a short number as it is", () => {
    expect(digitsFromPastedText("98765")).toBe("98765");
  });

  it("strips the +91 prefix from a short number", () => {
    expect(digitsFromPastedText("+91 98765")).toBe("98765");
  });
});

describe("toDisplayValue", () => {
  it("shows the prefix followed by the digits as one string", () => {
    expect(MOBILE_NUMBER_PREFIX).toBe("+91 ");
    expect(toDisplayValue("9876543210")).toBe("+91 9876543210");
    expect(toDisplayValue("")).toBe("+91 ");
  });
});

describe("toStoredMobileNumber", () => {
  it("stores +91 followed by the 10 digits", () => {
    expect(toStoredMobileNumber("9876543210")).toBe("+919876543210");
  });

  it("stores an empty number as null", () => {
    expect(toStoredMobileNumber("")).toBeNull();
  });
});
