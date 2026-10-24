import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Tests check rows in local Supabase with the same variables the app uses.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const port = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  // Tests share one local database table and one running server.
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: "list",
  snapshotPathTemplate: "tests/visual/baselines/{arg}{ext}",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  expect: {
    toMatchSnapshot: { threshold: 0.1 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], deviceScaleFactor: 1 },
    },
  ],
  webServer: {
    // A production build, so screenshots match what Vercel serves.
    command: `npm run build && npm run start -- --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
