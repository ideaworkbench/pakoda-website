import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnvironment } from "@/lib/env";

/**
 * A Supabase client with the secret key, which bypasses row level security. It must only ever
 * run on the server: the table has RLS on with no policies, so this is the only way in.
 */
export function createServerSupabaseClient() {
    const { SUPABASE_URL, SUPABASE_SECRET_KEY } = getServerEnvironment();
    return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
}
