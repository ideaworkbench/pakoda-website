import { expect, test } from "@playwright/test";
import { closeButton, dialog, fieldNames, openFromHeader, textField } from "./support/early-access";

test.use({ viewport: { width: 1470, height: 900 } });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("1. Join the list opens the modal over the dimmed page", async ({ page }) => {
  await page.getByRole("button", { name: "Join the list" }).click();

  await expect(dialog(page)).toBeVisible();
  await expect(page.getByTestId("modal-overlay")).toHaveCSS("background-color", "rgba(10, 13, 18, 0.5)");
});

test("2. Get early access opens the same modal", async ({ page }) => {
  await page.getByRole("button", { name: "Get early access" }).click();

  await expect(dialog(page)).toBeVisible();
  await expect(textField(page, fieldNames.fullName)).toBeVisible();
});

test("3. the modal closes only via x-close; backdrop click and Escape do not close it", async ({ page }) => {
  await openFromHeader(page);

  await page.mouse.click(20, 450);
  await expect(dialog(page)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();

  await closeButton(page).click();
  await expect(dialog(page)).toBeHidden();
});

test("3. focus returns to the CTA that opened the modal", async ({ page }) => {
  const heroCta = page.getByRole("button", { name: "Get early access" });
  await heroCta.click();
  await closeButton(page).click();

  await expect(heroCta).toBeFocused();
});

test("3. page scroll is locked while the modal is open", async ({ page }) => {
  await openFromHeader(page);

  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
});

test("4. closing mid-entry and reopening keeps the entered values", async ({ page }) => {
  await openFromHeader(page);
  await textField(page, fieldNames.fullName).fill("Asha Rao");
  await textField(page, fieldNames.email).fill("asha@");

  await closeButton(page).click();
  await expect(dialog(page)).toBeHidden();
  await page.getByRole("button", { name: "Get early access" }).click();

  await expect(textField(page, fieldNames.fullName)).toHaveValue("Asha Rao");
  await expect(textField(page, fieldNames.email)).toHaveValue("asha@");
});

test("the form card keeps its top edge when an error grows it, so x-close works on the first click", async ({ page }) => {
  await openFromHeader(page);
  const card = page.getByTestId("early-access-card");
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));
  expect((await card.boundingBox())?.y).toBe(191);

  await textField(page, fieldNames.email).fill("asha@");
  await textField(page, fieldNames.mobileNumber).click();
  await expect(dialog(page).getByText("Enter a valid email address.")).toBeVisible();
  expect((await card.boundingBox())?.y).toBe(191);

  await textField(page, fieldNames.email).click();
  await closeButton(page).click();
  await expect(dialog(page)).toBeHidden();
});
