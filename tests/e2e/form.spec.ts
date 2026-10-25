import { expect, test } from "@playwright/test";
import {
  chooseOption,
  consentCheckbox,
  dialog,
  fieldNames,
  fillRequiredFields,
  openFromHeader,
  setConsent,
  selectTrigger,
  submitButton,
  textField,
} from "./support/early-access";

test.use({ viewport: { width: 1470, height: 900 } });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await openFromHeader(page);
});

test("6. the submit button stays disabled until every required condition holds", async ({ page }) => {
  await expect(consentCheckbox(page)).not.toBeChecked();
  await expect(submitButton(page)).toBeDisabled();

  await textField(page, fieldNames.fullName).fill("Asha Rao");
  await expect(submitButton(page)).toBeDisabled();
  await textField(page, fieldNames.businessName).fill("Rao Stores");
  await expect(submitButton(page)).toBeDisabled();
  await chooseOption(page, fieldNames.businessType, "Grocery");
  await expect(submitButton(page)).toBeDisabled();
  await textField(page, fieldNames.email).fill("hello@pakoda.com");
  await expect(submitButton(page)).toBeDisabled();
  await setConsent(page, true);
  await expect(submitButton(page)).toBeEnabled();
});

test("6. the submit button is disabled again when any condition is undone", async ({ page }) => {
  await fillRequiredFields(page, "hello@pakoda.com");
  await expect(submitButton(page)).toBeEnabled();

  await setConsent(page, false);
  await expect(submitButton(page)).toBeDisabled();
  await setConsent(page, true);

  await textField(page, fieldNames.fullName).fill("");
  await expect(submitButton(page)).toBeDisabled();
  await textField(page, fieldNames.fullName).fill("Asha Rao");

  await textField(page, fieldNames.email).fill("hello@");
  await expect(submitButton(page)).toBeDisabled();
});

test("7. a partly filled mobile number keeps the button disabled and shows its message on blur", async ({ page }) => {
  await fillRequiredFields(page, "hello@pakoda.com");
  const mobileNumber = textField(page, fieldNames.mobileNumber);

  await mobileNumber.click();
  await page.keyboard.type("98765");
  await expect(submitButton(page)).toBeDisabled();

  await mobileNumber.blur();
  await expect(dialog(page).getByText("Enter a 10-digit mobile number.")).toBeVisible();
});

test("8. leaving a required field empty shows its message; untouched fields show none", async ({ page }) => {
  await textField(page, fieldNames.fullName).focus();
  await textField(page, fieldNames.fullName).blur();

  await expect(dialog(page).getByText("Your name is mandatory.")).toBeVisible();
  await expect(dialog(page).getByText("Business name is mandatory.")).toHaveCount(0);
  await expect(dialog(page).getByText("Email address is mandatory.")).toHaveCount(0);

  await textField(page, fieldNames.fullName).fill("Asha");
  await expect(dialog(page).getByText("Your name is mandatory.")).toHaveCount(0);
});

test("8. leaving the email empty shows the error style from Figma", async ({ page }) => {
  const email = textField(page, fieldNames.email);
  await email.focus();
  await email.blur();

  await expect(dialog(page).getByText("Email address is mandatory.")).toHaveCSS("color", "rgb(217, 45, 32)");
  // Figma's 1px border is drawn inside the field, so the build uses an inset ring (box-shadow).
  await expect(email.locator("..")).toHaveCSS("box-shadow", /rgb\(253, 162, 155\)/);
  await expect(dialog(page).getByTestId("field-alert-icon")).toBeVisible();
});

test("9. an invalid email shows its message on blur", async ({ page }) => {
  const email = textField(page, fieldNames.email);
  await email.fill("hello@pakoda");
  await email.blur();

  await expect(dialog(page).getByText("Enter a valid email address.")).toBeVisible();
});

test("10. the business type error has a red border and message, the chevron and no alert icon", async ({ page }) => {
  const trigger = selectTrigger(page, fieldNames.businessType);
  await trigger.focus();
  await trigger.blur();

  await expect(dialog(page).getByText("Business type is mandatory.")).toBeVisible();
  await expect(trigger).toHaveCSS("box-shadow", /rgb\(253, 162, 155\)/);
  await expect(trigger.getByTestId("select-chevron")).toBeVisible();
  await expect(trigger.getByTestId("field-alert-icon")).toHaveCount(0);
});

test("11. the mobile field shows a fixed +91 prefix, accepts 10 digits and returns to the placeholder", async ({ page }) => {
  const mobileNumber = textField(page, fieldNames.mobileNumber);
  await expect(mobileNumber).toHaveAttribute("placeholder", "Mobile number");
  await expect(mobileNumber).toHaveAttribute("inputmode", "numeric");
  await expect(mobileNumber).toHaveAttribute("autocomplete", "tel-national");

  await mobileNumber.click();
  await expect(mobileNumber).toHaveValue("+91 ");

  await page.keyboard.press("Backspace");
  await page.keyboard.press("Home");
  await page.keyboard.press("Delete");
  await expect(mobileNumber).toHaveValue("+91 ");

  await page.keyboard.type("98a76-54321099");
  await expect(mobileNumber).toHaveValue("+91 9876543210");

  await mobileNumber.fill("");
  await mobileNumber.click();
  await mobileNumber.blur();
  await expect(mobileNumber).toHaveValue("");
});

test("12. pasting a formatted number keeps only the 10 digits", async ({ page }) => {
  const mobileNumber = textField(page, fieldNames.mobileNumber);
  await mobileNumber.click();

  await mobileNumber.evaluate((input) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "+91 98765-43210");
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true }));
  });

  await expect(mobileNumber).toHaveValue("+91 9876543210");
});

test("13. several order channels show comma-separated in fixed order, open and closed", async ({ page }) => {
  const trigger = selectTrigger(page, fieldNames.orderChannels);
  await trigger.click();
  await page.getByRole("option", { name: "Delivery apps" }).click();
  await page.getByRole("option", { name: "Walk-in" }).click();

  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(trigger).toContainText("Walk-in, Delivery apps");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(dialog(page)).toBeVisible();
  await expect(trigger).toContainText("Walk-in, Delivery apps");
});

test("13. the order channels list works with the keyboard", async ({ page }) => {
  const trigger = selectTrigger(page, fieldNames.orderChannels);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(trigger).not.toContainText(fieldNames.orderChannels);
});

test("13. a selected item keeps its selected background, and keyboard focus on it shows the focus ring", async ({ page }) => {
  const trigger = selectTrigger(page, fieldNames.orderChannels);
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");

  const selectedAndFocused = page.getByRole("option", { selected: true }).locator("div").first();
  await expect(selectedAndFocused).toHaveCSS("background-color", "rgb(245, 245, 245)");
  await expect(selectedAndFocused).toHaveCSS("box-shadow", /rgb\(26, 61, 170\)/);
});
