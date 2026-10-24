import { describe, expect, it } from "vitest";
import { submissionResultFromInsert } from "@/lib/early-access/submission-result";

describe("submissionResultFromInsert", () => {
  it("reports a new registration with the stored email", () => {
    expect(submissionResultFromInsert(null, "hello@pakoda.com")).toEqual({ status: "created", email: "hello@pakoda.com" });
  });

  it("reports a unique-violation as already registered", () => {
    expect(submissionResultFromInsert({ code: "23505", message: "duplicate key" }, "hello@pakoda.com")).toEqual({
      status: "already_registered",
      email: "hello@pakoda.com",
    });
  });

  it("reports any other database error as a generic error without details", () => {
    expect(submissionResultFromInsert({ code: "23514", message: "check constraint" }, "hello@pakoda.com")).toEqual({ status: "error" });
  });
});
