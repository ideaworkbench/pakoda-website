import "server-only";
import { z } from "zod";

// Local Supabase (supabase start) is the only place plain http is accepted.
const localSupabaseHost = "127.0.0.1";

/**
 * The bare project URL, e.g. https://<project-ref>.supabase.co. supabase-js adds /rest/v1 itself,
 * so a URL copied with a path makes every request fail (PostgREST PGRST125). Comparing with the
 * parsed origin rejects any path, query, fragment, credentials and the trailing slash.
 */
function isSupabaseProjectUrl(value: string) {
    if (!URL.canParse(value)) return false;
    const url = new URL(value);
    const isAllowedScheme = url.protocol === "https:" || (url.protocol === "http:" && url.hostname === localSupabaseHost);
    return isAllowedScheme && url.origin === value;
}

const serverEnvironmentSchema = z.object({
    SUPABASE_URL: z
        .string()
        .refine(isSupabaseProjectUrl, "must be the project URL only, like https://<project-ref>.supabase.co, with no path, query or trailing slash"),
    // Only the new secret keys; legacy service_role JWTs are not accepted (brief 5).
    SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_", "must be a secret key starting sb_secret_"),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

/**
 * Reads and validates the server-only variables when first needed rather than at import, so a
 * build without them still succeeds and a misconfigured deployment fails on its first request.
 * The error names the variables and what is expected but never prints their values.
 */
export function getServerEnvironment(environment: Record<string, string | undefined> = process.env): ServerEnvironment {
    const result = serverEnvironmentSchema.safeParse(environment);
    if (!result.success) {
        const problems = result.error.issues
            .map((issue) => (issue.code === "invalid_type" ? `${issue.path.join(".")} is missing` : `${issue.path.join(".")} ${issue.message}`))
            .join("; ");
        throw new Error(`Invalid server environment: ${problems}. See .env.example.`);
    }
    return result.data;
}
