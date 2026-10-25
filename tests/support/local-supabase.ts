import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const tableName = "early_access_registrations";

function requiredVariable(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Create .env.local with the local Supabase values (see README).`);
  return value;
}

export function adminClient() {
  return createClient(requiredVariable("SUPABASE_URL"), requiredVariable("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false },
  });
}

// The publishable key is only needed to prove RLS blocks it, so it is read from the
// running local stack instead of being added to the app's environment.
export function publishableClient() {
  const status = JSON.parse(execFileSync("supabase", ["status", "--output", "json"], { encoding: "utf8" }));
  return createClient(requiredVariable("SUPABASE_URL"), status.PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
}

export async function registrationsWithEmail(email: string) {
  const { data, error } = await adminClient().from(tableName).select("*").ilike("email", email);
  if (error) throw new Error(`Reading registrations failed: ${error.message}`);
  return data;
}

export async function deleteRegistrationsWithEmail(email: string) {
  const { error } = await adminClient().from(tableName).delete().ilike("email", email);
  if (error) throw new Error(`Deleting registrations failed: ${error.message}`);
}

// Runs SQL as the postgres superuser in the local Supabase database container, which the CLI
// names after config.toml's project_id. Used only to cause real database errors in tests.
function runLocalSql(sql: string) {
  const projectId = readFileSync("supabase/config.toml", "utf8").match(/^project_id = "([^"]+)"/m)?.[1];
  execFileSync("docker", ["exec", `supabase_db_${projectId}`, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-c", sql], {
    stdio: "ignore",
  });
}

export function blockServerInserts() {
  runLocalSql("revoke insert on table public.early_access_registrations from service_role;");
}

export function allowServerInserts() {
  runLocalSql("grant insert on table public.early_access_registrations to service_role;");
}
