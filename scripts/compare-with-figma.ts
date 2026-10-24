// Compares Playwright screenshots with the Figma exports in tests/visual/figma.
// Run directly (`npm run visual:report`) to write tests/visual/report.md from the
// screenshots the visual spec saved; the spec imports the same comparison.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

export interface MaskRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  reason: string;
}

export interface VisualScreen {
  name: string;
  figmaNode: string;
  masks: MaskRectangle[];
}

export interface ComparisonResult {
  rawMismatchPercent: number;
  filteredMismatchPercent: number;
  comparedPixels: number;
  ignoredTransparentPixels: number;
  diffImage: Buffer;
}

export const MAXIMUM_FILTERED_MISMATCH_PERCENT = 0.5;

// Paths are relative to the repository root, where npm scripts and Playwright both run.
// (`import.meta` is unavailable because Playwright loads this file as CommonJS.)
const visualDirectory = path.resolve("tests/visual");
export const figmaDirectory = path.join(visualDirectory, "figma");
export const screenshotDirectory = path.join(visualDirectory, "screenshots");
const diffDirectory = path.join(visualDirectory, "diffs");
const reportPath = path.join(visualDirectory, "report.md");

// Figma draws these frames with a ticked checkbox and enabled button while the
// fields are empty (or an unticked checkbox while sending), which the real form
// cannot show. Brief Section 10.6 allows exactly these masks and no others.
const checkboxBox: MaskRectangle = { x: 32, y: 392, width: 16, height: 16, reason: "checkbox state impossible with these field values" };
const submitButton: MaskRectangle = { x: 32, y: 450, width: 336, height: 36, reason: "button state impossible with these field values" };

export const visualScreens: VisualScreen[] = [
  { name: "landing-1470", figmaNode: "1-96", masks: [] },
  { name: "landing-1728", figmaNode: "1-119", masks: [] },
  { name: "landing-overlay-form", figmaNode: "30-25159", masks: [] },
  { name: "form-default", figmaNode: "7-196", masks: [checkboxBox, submitButton] },
  { name: "form-mobile-number", figmaNode: "27-24951", masks: [checkboxBox, submitButton] },
  { name: "form-business-type-open", figmaNode: "7-4525", masks: [] },
  { name: "form-order-channels-open", figmaNode: "11-9170", masks: [] },
  { name: "form-field-error", figmaNode: "7-6775", masks: [] },
  { name: "form-loading", figmaNode: "11-9300", masks: [checkboxBox] },
  { name: "result-on-the-list", figmaNode: "7-6308", masks: [] },
  { name: "result-already-on-the-list", figmaNode: "7-6743", masks: [] },
];

function blankOutPixel(image: PNG, pixelIndex: number) {
  image.data.fill(0, pixelIndex * 4, pixelIndex * 4 + 4);
}

export function compareWithFigma(screen: VisualScreen, screenshot: Buffer): ComparisonResult {
  const figma = PNG.sync.read(readFileSync(path.join(figmaDirectory, `${screen.name}.png`)));
  const actual = PNG.sync.read(screenshot);
  if (figma.width !== actual.width || figma.height !== actual.height) {
    throw new Error(`${screen.name}: screenshot is ${actual.width}×${actual.height}, Figma export is ${figma.width}×${figma.height}`);
  }

  const { width, height } = figma;
  let ignoredTransparentPixels = 0;
  let maskedPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = y * width + x;
      const isMasked = screen.masks.some((mask) => x >= mask.x && x < mask.x + mask.width && y >= mask.y && y < mask.y + mask.height);
      // Transparent Figma pixels lie outside the drawn frame (rounded corners, an
      // overflowing menu), so there is nothing in the design to compare them with.
      const isTransparentInFigma = figma.data[pixelIndex * 4 + 3] === 0;
      if (isMasked || isTransparentInFigma) {
        blankOutPixel(figma, pixelIndex);
        blankOutPixel(actual, pixelIndex);
        if (isMasked) maskedPixels++;
        else ignoredTransparentPixels++;
      }
    }
  }

  const diff = new PNG({ width, height });
  const rawMismatchedPixels = pixelmatch(figma.data, actual.data, null, width, height, { threshold: 0.1, includeAA: true });
  const filteredMismatchedPixels = pixelmatch(figma.data, actual.data, diff.data, width, height, { threshold: 0.1, includeAA: false });
  const comparedPixels = width * height - maskedPixels - ignoredTransparentPixels;

  return {
    rawMismatchPercent: (rawMismatchedPixels / comparedPixels) * 100,
    filteredMismatchPercent: (filteredMismatchedPixels / comparedPixels) * 100,
    comparedPixels,
    ignoredTransparentPixels,
    diffImage: PNG.sync.write(diff),
  };
}

function formatPercent(value: number) {
  return `${value.toFixed(3)}%`;
}

function writeReport() {
  mkdirSync(diffDirectory, { recursive: true });
  const rows = visualScreens.map((screen) => {
    const screenshotPath = path.join(screenshotDirectory, `${screen.name}.png`);
    if (!existsSync(screenshotPath)) return `| ${screen.name} | ${screen.figmaNode} | missing | missing | — | not captured |`;

    const result = compareWithFigma(screen, readFileSync(screenshotPath));
    writeFileSync(path.join(diffDirectory, `${screen.name}.png`), result.diffImage);
    const verdict = result.filteredMismatchPercent <= MAXIMUM_FILTERED_MISMATCH_PERCENT ? "pass" : "**defect**";
    const masks = screen.masks.map((mask) => `${mask.width}×${mask.height} at (${mask.x}, ${mask.y})`).join(", ") || "none";
    return `| ${screen.name} | ${screen.figmaNode} | ${formatPercent(result.rawMismatchPercent)} | ${formatPercent(result.filteredMismatchPercent)} | ${masks} | ${verdict} |`;
  });

  const report = [
    "# Visual comparison with Figma",
    "",
    `pixelmatch, threshold 0.1. Raw counts anti-aliased pixels; filtered ignores them (\`includeAA: false\`). Over ${MAXIMUM_FILTERED_MISMATCH_PERCENT}% filtered is a defect.`,
    "Pixels that are transparent in the Figma export are not compared.",
    "",
    "| Screen | Figma node | Raw mismatch | Filtered mismatch | Masks | Result |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
  writeFileSync(reportPath, report);
  console.log(report);
}

const isRunDirectly = process.argv[1]?.endsWith("compare-with-figma.ts");
if (isRunDirectly) {
  writeReport();
}
