import { expect, test } from "@playwright/test";
import { allowServerInserts, blockServerInserts, deleteRegistrationsWithEmail, registrationsWithEmail } from "../support/local-supabase";
import {
  closeButton,
  consentCheckbox,
  dialog,
  fieldNames,
  fillRequiredFields,
  openFromHeader,
  selectTrigger,
  submitButton,
  textField,
} from "./support/early-access";

const testEmail = "e2e-error-test@pakoda.com";
const errorTitle = "Something went wrong";
const errorMessage = "We couldn’t save your request. Please try again in a moment.";

test.use({ viewport: { width: 1470, height: 900 } });

test.beforeEach(async ({ page }) => {
  await deleteRegistrationsWithEmail(testEmail);
  await page.goto("/");
  await openFromHeader(page);
});

test.afterEach(async () => {
  allowServerInserts();
  await deleteRegistrationsWithEmail(testEmail);
});

async function fillEveryField(page: import("@playwright/test").Page) {
  await fillRequiredFields(page, testEmail);
  await textField(page, fieldNames.mobileNumber).click();
  await page.keyboard.type("9876543210");
  await selectTrigger(page, fieldNames.orderChannels).click();
  await page.getByRole("option", { name: "Walk-in" }).click();
  await page.getByRole("option", { name: "Delivery apps" }).click();
  await page.keyboard.press("Escape");
}

// Server actions are POSTs to the page carrying a Next-Action header.
function isServerAction(request: import("@playwright/test").Request) {
  return request.method() === "POST" && Boolean(request.headers()["next-action"]);
}

test("1. a server error shows the error view with the exact Figma copy, and focus moves to its title", async ({ page }) => {
  blockServerInserts();
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();

  const title = dialog(page).getByText(errorTitle, { exact: true });
  await expect(title).toBeVisible();
  await expect(dialog(page).getByText(errorMessage, { exact: true })).toBeVisible();
  await expect(dialog(page).getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(title).toBeFocused();
  expect(await registrationsWithEmail(testEmail)).toHaveLength(0);
});

test("2. a request that never reaches the server shows the same error view", async ({ page }) => {
  await page.route("**/*", (route) => (isServerAction(route.request()) ? route.abort("internetdisconnected") : route.continue()));
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();

  await expect(dialog(page).getByText(errorTitle, { exact: true })).toBeVisible();
  await expect(dialog(page).getByText(errorMessage, { exact: true })).toBeVisible();
});

test("3. Try again returns to the form exactly as left, with the button enabled and focused", async ({ page }) => {
  blockServerInserts();
  await fillEveryField(page);
  await submitButton(page).click();
  await dialog(page).getByRole("button", { name: "Try again" }).click();

  await expect(textField(page, fieldNames.fullName)).toHaveValue("Asha Rao");
  await expect(textField(page, fieldNames.businessName)).toHaveValue("Rao Stores");
  await expect(selectTrigger(page, fieldNames.businessType)).toContainText("Grocery");
  await expect(textField(page, fieldNames.mobileNumber)).toHaveValue("+91 9876543210");
  await expect(textField(page, fieldNames.email)).toHaveValue(testEmail);
  await expect(selectTrigger(page, fieldNames.orderChannels)).toContainText("Walk-in, Delivery apps");
  await expect(consentCheckbox(page)).toBeChecked();
  await expect(submitButton(page)).toBeEnabled();
  await expect(submitButton(page)).toBeFocused();
  await expect(dialog(page).getByText(/mandatory|Enter a/)).toHaveCount(0);
});

test("4. x-close on the error view closes the modal and keeps every value", async ({ page }) => {
  blockServerInserts();
  await fillEveryField(page);
  await submitButton(page).click();
  await expect(dialog(page).getByText(errorTitle, { exact: true })).toBeVisible();

  await closeButton(page).click();
  await expect(dialog(page)).toBeHidden();
  await page.getByRole("button", { name: "Get early access" }).click();

  await expect(textField(page, fieldNames.fullName)).toHaveValue("Asha Rao");
  await expect(textField(page, fieldNames.mobileNumber)).toHaveValue("+91 9876543210");
  await expect(selectTrigger(page, fieldNames.orderChannels)).toContainText("Walk-in, Delivery apps");
  await expect(consentCheckbox(page)).toBeChecked();
  await expect(submitButton(page)).toBeEnabled();
});

test("5. submitting again after Try again succeeds once the server is healthy, with one row", async ({ page }) => {
  blockServerInserts();
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();
  await dialog(page).getByRole("button", { name: "Try again" }).click();

  allowServerInserts();
  await submitButton(page).click();

  await expect(dialog(page).getByText("You’re on the list!")).toBeVisible();
  expect(await registrationsWithEmail(testEmail)).toHaveLength(1);
});

test("6. field errors from the server show inline under the fields, not in the error view", async ({ page }) => {
  // The form never sends an invalid number, so the request is altered on its way to the server.
  await page.route("**/*", (route) => {
    const request = route.request();
    if (!isServerAction(request)) return route.continue();
    return route.continue({ postData: (request.postData() ?? "").replace('"mobileNumber":"9876543210"', '"mobileNumber":"98765"') });
  });
  await fillRequiredFields(page, testEmail);
  await textField(page, fieldNames.mobileNumber).click();
  await page.keyboard.type("9876543210");
  await submitButton(page).click();

  await expect(dialog(page).getByText("Enter a 10-digit mobile number.")).toBeVisible();
  await expect(dialog(page).getByText(errorTitle)).toHaveCount(0);
  await expect(submitButton(page)).toBeVisible();
  expect(await registrationsWithEmail(testEmail)).toHaveLength(0);
});

test("7. an already registered email shows the already-registered view, never the error view", async ({ page }) => {
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();
  await dialog(page).getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Get early access" }).click();
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();

  await expect(dialog(page).getByText("You’re already on the list!")).toBeVisible();
  await expect(dialog(page).getByText(errorTitle)).toHaveCount(0);
});

test("8. the error view shows no technical details", async ({ page }) => {
  blockServerInserts();
  await fillRequiredFields(page, testEmail);
  await submitButton(page).click();
  await expect(dialog(page).getByText(errorTitle, { exact: true })).toBeVisible();

  const card = page.getByTestId("early-access-card");
  await expect(card).toHaveText(`${errorTitle}${errorMessage}Try again`, { useInnerText: false });
  await expect(card).not.toContainText(/42501|permission|denied|error code|status/i);
});
