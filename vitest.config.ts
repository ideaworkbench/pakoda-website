import { existsSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Integration tests talk to local Supabase with the same variables the app uses.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // The real package throws outside React Server Components; tests run server modules directly.
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Integration tests share one local database table.
    fileParallelism: false,
  },
});
