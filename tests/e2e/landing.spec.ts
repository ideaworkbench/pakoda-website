import { expect, test } from "@playwright/test";
import { dialog } from "./support/early-access";

test.describe("at 1280px wide", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("19. the 1470 composition is scaled by 1280/1470 and the CTAs stay clickable", async ({ page }) => {
    await page.goto("/");
    const scale = 1280 / 1470;

    const stage = await page.getByTestId("landing-stage").boundingBox();
    expect(stage?.width).toBeCloseTo(1470 * scale, 0);
    expect(stage?.height).toBeCloseTo(900 * scale, 0);
    expect(stage?.x).toBeCloseTo(0, 0);

    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalScroll).toBe(false);

    await page.getByRole("button", { name: "Get early access" }).click();
    await expect(dialog(page)).toBeVisible();
  });
});

test.describe("at 1728px wide", () => {
  test.use({ viewport: { width: 1728, height: 1117 } });

  test("20. the content block is 1470 wide and centred, the photo is unstretched, and the lines show", async ({ page }) => {
    await page.goto("/");

    const stage = await page.getByTestId("landing-stage").boundingBox();
    expect(stage).toEqual({ x: 129, y: 0, width: 1470, height: 900 });

    const photo = await page.getByTestId("hero-image").boundingBox();
    expect(photo).toEqual({ x: 129, y: 103, width: 1470, height: 535 });

    await expect(page.getByTestId("wide-viewport-lines")).toBeVisible();
  });
});

test.describe("at exactly 1470px wide", () => {
  test.use({ viewport: { width: 1470, height: 900 } });

  test("the composition renders at design size without the wide-viewport lines", async ({ page }) => {
    await page.goto("/");

    const stage = await page.getByTestId("landing-stage").boundingBox();
    expect(stage).toEqual({ x: 0, y: 0, width: 1470, height: 900 });
    await expect(page.getByTestId("wide-viewport-lines")).toBeHidden();
  });
});

test("21. the title and meta description match the brief", async ({ page }) => {
  await page.goto("/");
  const description = "Take orders by chat, not phone calls. Pakoda gives your business its own ordering bot and dashboard. Join early access.";

  await expect(page).toHaveTitle("Pakoda");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Pakoda");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description);
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "Pakoda");
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", description);
});
