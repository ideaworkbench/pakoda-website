import { describe, expect, it } from "vitest";
import { getServerEnvironment } from "@/lib/env";

const secretKey = "sb_secret_test-value-never-printed";

function environmentWithUrl(url: string | undefined) {
  return { SUPABASE_URL: url, SUPABASE_SECRET_KEY: secretKey };
}

function errorMessageFor(environment: Record<string, string | undefined>) {
  try {
    getServerEnvironment(environment);
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error("Expected the environment to be rejected");
}

describe("getServerEnvironment", () => {
  it.each([
    ["the hosted project URL", "https://ijmlwiwlaazpqbfgvdhp.supabase.co"],
    ["local Supabase", "http://127.0.0.1:54321"],
    ["an https URL with a port", "https://example.com:8443"],
  ])("accepts %s", (_, url) => {
    expect(getServerEnvironment(environmentWithUrl(url))).toEqual({ SUPABASE_URL: url, SUPABASE_SECRET_KEY: secretKey });
  });

  it.each([
    ["the REST path (PGRST125 in production)", "https://ijmlwiwlaazpqbfgvdhp.supabase.co/rest/v1"],
    ["the REST path with a trailing slash", "https://ijmlwiwlaazpqbfgvdhp.supabase.co/rest/v1/"],
    ["a trailing slash", "https://ijmlwiwlaazpqbfgvdhp.supabase.co/"],
    ["a query", "https://ijmlwiwlaazpqbfgvdhp.supabase.co?apikey=x"],
    ["a fragment", "https://ijmlwiwlaazpqbfgvdhp.supabase.co#top"],
    ["credentials", "https://user:pass@ijmlwiwlaazpqbfgvdhp.supabase.co"],
    ["plain http on a hosted project", "http://ijmlwiwlaazpqbfgvdhp.supabase.co"],
    ["plain http on localhost", "http://localhost:54321"],
    ["local Supabase with a trailing slash", "http://127.0.0.1:54321/"],
    ["another scheme", "ftp://ijmlwiwlaazpqbfgvdhp.supabase.co"],
    ["no scheme", "ijmlwiwlaazpqbfgvdhp.supabase.co"],
    ["surrounding spaces", " https://ijmlwiwlaazpqbfgvdhp.supabase.co "],
    ["an empty value", ""],
  ])("rejects %s, naming the variable but not its value", (_, url) => {
    const message = errorMessageFor(environmentWithUrl(url));
    expect(message).toBe(
      "Invalid server environment: SUPABASE_URL must be the project URL only, like https://<project-ref>.supabase.co, with no path, query or trailing slash. See .env.example.",
    );
    expect(message).not.toContain("ijmlwiwlaazpqbfgvdhp");
    expect(message).not.toContain(secretKey);
  });

  it("reports a missing SUPABASE_URL", () => {
    expect(errorMessageFor(environmentWithUrl(undefined))).toBe("Invalid server environment: SUPABASE_URL is missing. See .env.example.");
  });

  it("names both variables when both are wrong, without printing either value", () => {
    const badUrl = "https://ijmlwiwlaazpqbfgvdhp.supabase.co/rest/v1";
    const badKey = "eyJhbGciOiJIUzI1NiJ9.legacy-service-role";
    const message = errorMessageFor({ SUPABASE_URL: badUrl, SUPABASE_SECRET_KEY: badKey });
    expect(message).toMatch(/SUPABASE_URL must be the project URL only.*; SUPABASE_SECRET_KEY must be a secret key starting sb_secret_\./);
    expect(message).not.toContain("ijmlwiwlaazpqbfgvdhp");
    expect(message).not.toContain(badKey);
  });
});
