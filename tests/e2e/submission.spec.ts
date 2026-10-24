import { expect, test } from "@playwright/test";
import { deleteRegistrationsWithEmail, registrationsWithEmail } from "../support/local-supabase";
import {
  closeButton,
  consentCheckbox,
  dialog,
  fieldNames,
  fillRequiredFields,
  holdServerActions,
  openFromHeader,
  selectTrigger,
  submitButton,
  textField,
} from "./support/early-access";

const testEmail = "e2e-test@pakoda.com";

test.use({ viewport: { width: 1470, height: 900 } });

test.beforeEach(async ({ page }) => {
  await deleteRegistrationsWithEmail(testEmail);
  await page.goto("/");
  await openFromHeader(page);
});

test.afterAll(async () => {
  await deleteRegistrationsWithEmail(testEmail);
});

test("14. while sending, the form is locked and cannot be submitted twice", async ({ page }) => {
  const releaseServerActions = await holdServerActions(page);
  await fillRequiredFields(page, testEmail);

  await submitButton(page).click();

  const sendingButton = dialog(page).getByRole("button", { name: "Sending..." });
  await expect(sendingButton).toBeDisabled();
  await expect(textField(page, fieldNames.fullName)).toHaveAttribute("readonly", "");
  await expect(consentCheckbox(page)).toBeDisabled();
  await expect(closeButton(page)).toBeDisabled();
  await sendingButton.click({ force: true });

  releaseServerActions();
  await expect(dialog(page).getByText("You’re on the list!")).toBeVisible();
  expect(await registrationsWithEmail(testEmail)).toHaveLength(1);
});

test("15. a new email creates one row and the success view shows the entered email", async ({ page }) => {
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();

  await expect(dialog(page).getByText("You’re on the list!")).toBeVisible();
  await expect(dialog(page).getByText(`We’ll contact you on ${testEmail} when your spot is ready.`)).toBeVisible();
  expect(await registrationsWithEmail(testEmail)).toHaveLength(1);
});

test("12 and 13. the mobile number and order channels are stored", async ({ page }) => {
  await fillRequiredFields(page, testEmail);
  await textField(page, fieldNames.mobileNumber).click();
  await page.keyboard.type("9876543210");
  await selectTrigger(page, fieldNames.orderChannels).click();
  await page.getByRole("option", { name: "Delivery apps" }).click();
  await page.getByRole("option", { name: "Walk-in" }).click();
  await page.keyboard.press("Escape");

  await submitButton(page).click();
  await expect(dialog(page).getByText("You’re on the list!")).toBeVisible();

  const [row] = await registrationsWithEmail(testEmail);
  expect(row.mobile_number).toBe("+919876543210");
  expect(row.order_channels).toEqual(["walk_in", "delivery_apps"]);
});

test("16. the same email in any case shows the already-registered view with only the email bold", async ({ page }) => {
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();
  await dialog(page).getByRole("button", { name: "Done" }).click();

  await page.getByRole("button", { name: "Get early access" }).click();
  await fillRequiredFields(page, testEmail.toUpperCase());
  await submitButton(page).click();

  await expect(dialog(page).getByText("You’re already on the list!")).toBeVisible();
  const boldText = dialog(page).locator("strong");
  await expect(boldText).toHaveCount(1);
  await expect(boldText).toHaveText(testEmail);
  expect(await registrationsWithEmail(testEmail)).toHaveLength(1);
});

test("5. x-close on a result view closes the modal and reopening shows an empty default form", async ({ page }) => {
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();
  await expect(dialog(page).getByText("You’re on the list!")).toBeVisible();

  await closeButton(page).click();
  await expect(dialog(page)).toBeHidden();
  await page.getByRole("button", { name: "Join the list" }).click();

  await expect(textField(page, fieldNames.fullName)).toHaveValue("");
  await expect(textField(page, fieldNames.email)).toHaveValue("");
  await expect(consentCheckbox(page)).not.toBeChecked();
  await expect(submitButton(page)).toBeDisabled();
});
