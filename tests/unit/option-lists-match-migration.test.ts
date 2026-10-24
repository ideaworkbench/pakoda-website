import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { businessTypeOptions, orderChannelOptions } from "@/lib/early-access/schema";

const migrationsDirectory = path.resolve(import.meta.dirname, "../../supabase/migrations");
const migrationFile = readdirSync(migrationsDirectory).find((name) => name.endsWith("_create_early_access_registrations.sql"));
const migrationSql = readFileSync(path.join(migrationsDirectory, migrationFile ?? ""), "utf8");

function quotedValuesIn(sqlFragment: string) {
  return [...sqlFragment.matchAll(/'([a-z_]+)'/g)].map((match) => match[1]);
}

describe("option lists match the migration's check constraints", () => {
  it("business types", () => {
    const constraint = migrationSql.match(/business_type\s+in\s*\(([^)]*)\)/)?.[1] ?? "";
    expect(quotedValuesIn(constraint)).toEqual(businessTypeOptions.map((option) => option.value));
  });

  it("order channels", () => {
    const constraint = migrationSql.match(/order_channels\s*<@\s*array\[([^\]]*)\]/)?.[1] ?? "";
    expect(quotedValuesIn(constraint)).toEqual(orderChannelOptions.map((option) => option.value));
  });
});
