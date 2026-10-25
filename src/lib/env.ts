import "server-only";
import { z } from "zod";

const serverEnvironmentSchema = z.object({
    SUPABASE_URL: z.url(),
    // Only the new secret keys; legacy service_role JWTs are not accepted (brief 5).
    SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

/**
 * Reads and validates the server-only variables when first needed rather than at import, so a
 * build without them still succeeds and a misconfigured deployment fails on its first request.
 * The error names the variables but never prints their values.
 */
export function getServerEnvironment(): ServerEnvironment {
    const result = serverEnvironmentSchema.safeParse(process.env);
    if (!result.success) {
        const invalidVariables = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
        throw new Error(`Missing or invalid server environment variables: ${invalidVariables}. See .env.example.`);
    }
    return result.data;
}
