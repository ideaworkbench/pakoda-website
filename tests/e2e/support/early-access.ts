import { type Page, expect } from "@playwright/test";

export const fieldNames = {
  fullName: "Your name",
  businessName: "Business name",
  businessType: "Business type",
  mobileNumber: "Mobile number",
  email: "Email address",
  orderChannels: "How do you take orders today?",
} as const;

export function dialog(page: Page) {
  return page.getByRole("dialog");
}

export function textField(page: Page, name: string) {
  return dialog(page).getByRole("textbox", { name, exact: true });
}

// A select trigger's accessible name is its current value followed by the field's hidden label.
export function selectTrigger(page: Page, name: string) {
  return dialog(page).getByRole("button", { name: new RegExp(`${escapeForRegExp(name)}$`) });
}

export function consentCheckbox(page: Page) {
  return dialog(page).getByRole("checkbox", { name: /I agree to be contacted about Pakoda/ });
}

export function submitButton(page: Page) {
  return dialog(page).getByRole("button", { name: "Request early access" });
}

export function closeButton(page: Page) {
  return dialog(page).getByRole("button", { name: "Close" });
}

// The checkbox input is visually hidden, as in React Aria, so tests click its label like a person would.
export async function setConsent(page: Page, shouldBeChecked: boolean) {
  if ((await consentCheckbox(page).isChecked()) !== shouldBeChecked) {
    await dialog(page).getByText("I agree to be contacted about Pakoda").click();
  }
  await expect(consentCheckbox(page)).toBeChecked({ checked: shouldBeChecked });
}

export async function openFromHeader(page: Page) {
  await page.getByRole("button", { name: "Join the list" }).click();
  await expect(dialog(page)).toBeVisible();
}

export async function chooseOption(page: Page, selectName: string, optionName: string) {
  await selectTrigger(page, selectName).click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
}

export async function fillRequiredFields(page: Page, email: string) {
  await textField(page, fieldNames.fullName).fill("Asha Rao");
  await textField(page, fieldNames.businessName).fill("Rao Stores");
  await chooseOption(page, fieldNames.businessType, "Grocery");
  await textField(page, fieldNames.email).fill(email);
  await setConsent(page, true);
}

// Server actions are POSTs to the page carrying a Next-Action header. Holding them
// keeps the form in its sending state for as long as a test needs.
export async function holdServerActions(page: Page) {
  let releaseHeldRequests: () => void = () => {};
  const released = new Promise<void>((resolve) => {
    releaseHeldRequests = resolve;
  });
  await page.route("**/*", async (route) => {
    if (route.request().method() === "POST" && route.request().headers()["next-action"]) {
      await released;
    }
    await route.continue();
  });
  return releaseHeldRequests;
}

function escapeForRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
