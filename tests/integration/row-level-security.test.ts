import { afterAll, describe, expect, it } from "vitest";
import { adminClient, deleteRegistrationsWithEmail, publishableClient } from "../support/local-supabase";

const testEmail = "rls-test@pakoda.com";

const row = {
  full_name: "Asha Rao",
  business_name: "Rao Stores",
  business_type: "grocery",
  email: testEmail,
  consent_given: true,
  consent_given_at: new Date().toISOString(),
};

afterAll(async () => {
  await deleteRegistrationsWithEmail(testEmail);
});

describe("row level security on early_access_registrations", () => {
  it("does not let the publishable key insert", async () => {
    const { error } = await publishableClient().from("early_access_registrations").insert(row);

    expect(error?.code).toBe("42501");
  });

  it("does not let the publishable key read existing rows", async () => {
    const { error: insertError } = await adminClient().from("early_access_registrations").insert(row);
    expect(insertError).toBeNull();

    // RLS hides rows (empty result); a missing table grant refuses outright. Both keep data private.
    const { data } = await publishableClient().from("early_access_registrations").select("*");

    expect(data ?? []).toEqual([]);
  });
});
