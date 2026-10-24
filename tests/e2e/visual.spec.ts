import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { type Page, expect, test } from "@playwright/test";
import {
  MAXIMUM_FILTERED_MISMATCH_PERCENT,
  compareWithFigma,
  screenshotDirectory,
  visualScreens,
} from "../../scripts/compare-with-figma";
import { deleteRegistrationsWithEmail } from "../support/local-supabase";
import {
  dialog,
  fieldNames,
  fillRequiredFields,
  holdServerActions,
  openFromHeader,
  selectTrigger,
  submitButton,
  textField,
} from "./support/early-access";

// The email Figma shows on the result views.
const figmaEmail = "hello@pakoda.com";

// The order-channels menu hangs below the card; Figma exports it at this height.
const orderChannelsExportHeight = 617;

type Capture = (page: Page) => Promise<Buffer>;

// The modal zooms in on open. Wait for finite animations to end (the sending spinner never does)
// so the card is measured and captured at its final size.
async function waitForAnimationsToFinish(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    ),
  );
}

async function cardScreenshot(page: Page, height?: number) {
  // Leave hover styles out of the capture; Figma draws no hovered element.
  await page.mouse.move(0, 0);
  await waitForAnimationsToFinish(page);
  const card = await page.getByTestId("early-access-card").boundingBox();
  if (!card) throw new Error("The early-access card is not on screen");
  return page.screenshot({ clip: { x: card.x, y: card.y, width: card.width, height: height ?? card.height }, animations: "disabled" });
}

async function viewportScreenshot(page: Page) {
  await page.mouse.move(0, 0);
  await waitForAnimationsToFinish(page);
  return page.screenshot({ animations: "disabled" });
}

// Inside the modal, element.blur() is undone by the focus trap. Clicking the card's empty header
// area moves focus to the dialog, as it would for a person.
async function leaveField(page: Page) {
  await page.getByTestId("early-access-card").click({ position: { x: 200, y: 47 } });
}

async function submitAs(page: Page, email: string) {
  await openFromHeader(page);
  await fillRequiredFields(page, email);
  await submitButton(page).click();
}

const captures: Record<string, { viewport: { width: number; height: number }; capture: Capture }> = {
  "landing-1470": { viewport: { width: 1470, height: 900 }, capture: viewportScreenshot },
  "landing-1728": { viewport: { width: 1728, height: 1117 }, capture: viewportScreenshot },
  "landing-overlay-form": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await openFromHeader(page);
      return viewportScreenshot(page);
    },
  },
  "form-default": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await openFromHeader(page);
      return cardScreenshot(page);
    },
  },
  "form-mobile-number": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await openFromHeader(page);
      await textField(page, fieldNames.mobileNumber).click();
      await page.keyboard.type("9876543210");
      await leaveField(page);
      return cardScreenshot(page);
    },
  },
  "form-business-type-open": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await openFromHeader(page);
      await selectTrigger(page, fieldNames.businessType).click();
      return cardScreenshot(page);
    },
  },
  "form-order-channels-open": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await openFromHeader(page);
      await selectTrigger(page, fieldNames.orderChannels).click();
      await page.getByRole("option", { name: "Walk-in" }).click();
      await page.getByRole("option", { name: "Delivery apps" }).click();
      return cardScreenshot(page, orderChannelsExportHeight);
    },
  },
  "form-field-error": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await openFromHeader(page);
      await textField(page, fieldNames.email).focus();
      await leaveField(page);
      return cardScreenshot(page);
    },
  },
  "form-loading": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await holdServerActions(page);
      await submitAs(page, figmaEmail);
      await expect(dialog(page).getByRole("button", { name: "Sending..." })).toBeVisible();
      return cardScreenshot(page);
    },
  },
  "result-on-the-list": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await deleteRegistrationsWithEmail(figmaEmail);
      await submitAs(page, figmaEmail);
      await expect(dialog(page).getByText("You’re on the list!")).toBeVisible();
      return cardScreenshot(page);
    },
  },
  "result-already-on-the-list": {
    viewport: { width: 1470, height: 900 },
    capture: async (page) => {
      await deleteRegistrationsWithEmail(figmaEmail);
      await submitAs(page, figmaEmail);
      await dialog(page).getByRole("button", { name: "Done" }).click();
      await submitAs(page, figmaEmail);
      await expect(dialog(page).getByText("You’re already on the list!")).toBeVisible();
      return cardScreenshot(page);
    },
  },
};

test.afterAll(async () => {
  await deleteRegistrationsWithEmail(figmaEmail);
});

for (const screen of visualScreens) {
  test.describe(`22. ${screen.name} (Figma ${screen.figmaNode})`, () => {
    test.use({ viewport: captures[screen.name].viewport });

    test("matches Figma and the committed baseline", async ({ page }) => {
      await page.goto("/");
      const screenshot = await captures[screen.name].capture(page);

      mkdirSync(screenshotDirectory, { recursive: true });
      writeFileSync(path.join(screenshotDirectory, `${screen.name}.png`), screenshot);

      const result = compareWithFigma(screen, screenshot);
      expect(result.filteredMismatchPercent, `filtered mismatch for ${screen.name}`).toBeLessThanOrEqual(MAXIMUM_FILTERED_MISMATCH_PERCENT);
      expect(screenshot).toMatchSnapshot(`${screen.name}.png`);
    });
  });
}
