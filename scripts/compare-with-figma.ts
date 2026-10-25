// Compares Playwright screenshots with the Figma exports in tests/visual/figma.
// Run directly (`npm run visual:report`) to write tests/visual/report.md, a diff per screen and,
// for card screens, a Figma | build | diff image in tests/visual/side-by-side, from the
// screenshots the visual spec saved. The spec imports the same comparison.

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
  /** A 400px card captured on its own, rather than a full 1470/1728 frame. */
  isCardFrame: boolean;
  masks: MaskRectangle[];
  /** A filtered mismatch above the usual limit that was reviewed and accepted for this screen only. */
  acceptedException?: { filteredMismatchPercent: number; reason: string };
}

export interface ComparisonResult {
  rawMismatchPercent: number;
  filteredMismatchPercent: number;
  maximumFilteredMismatchPercent: number;
  comparedPixels: number;
  ignoredCanvasPixels: number;
  diffImage: Buffer;
}

// Approved limits. Text is a large share of a lone card, and Figma and Chrome anti-alias text
// differently, so card captures get 1.0%; full frames keep the brief's 0.5%.
const FULL_FRAME_LIMIT_PERCENT = 0.5;
const CARD_FRAME_LIMIT_PERCENT = 1.0;

export function maximumFilteredMismatchPercent(screen: VisualScreen) {
  if (screen.acceptedException) return screen.acceptedException.filteredMismatchPercent;
  return screen.isCardFrame ? CARD_FRAME_LIMIT_PERCENT : FULL_FRAME_LIMIT_PERCENT;
}

// Figma exports are opaque: outside a card's rounded corners, and below a menu that overhangs
// the card, they show Figma's canvas colour, dithered and darkened by the menu shadow to within
// 3 levels per channel. Those pixels are not part of the design. No colour inside a card comes
// that close on all three channels (the darkest, text-primary #181D27, is 6 away on red).
const FIGMA_CANVAS_COLOUR = [0x1e, 0x1e, 0x1e];
const FIGMA_CANVAS_TOLERANCE = 3;

// Paths are relative to the repository root, where npm scripts and Playwright both run.
// (`import.meta` is unavailable because Playwright loads this file as CommonJS.)
const visualDirectory = path.resolve("tests/visual");
export const figmaDirectory = path.join(visualDirectory, "figma");
export const screenshotDirectory = path.join(visualDirectory, "screenshots");
const diffDirectory = path.join(visualDirectory, "diffs");
const sideBySideDirectory = path.join(visualDirectory, "side-by-side");
const reportPath = path.join(visualDirectory, "report.md");

// Figma draws these frames with a ticked checkbox and enabled button while the fields are
// empty (or an unticked checkbox while sending), which the real form cannot show. Brief
// Section 10.6 allows these masks; the field-text masks below were approved on top.
const checkboxBox: MaskRectangle = { x: 32, y: 392, width: 16, height: 16, reason: "checkbox state impossible with these field values" };
const submitButton: MaskRectangle = { x: 32, y: 450, width: 336, height: 36, reason: "button state impossible with these field values" };

// Text area inside a field: 12px in from the left, 8px down, one 20px line. Inputs run to 12px
// from the right edge; selects stop before the chevron and its 8px gap.
const fieldTops = [94, 142, 190, 238, 286, 334];
function fieldText(fieldIndex: number, kind: "input" | "select", reason: string): MaskRectangle {
  return { x: 44, y: fieldTops[fieldIndex] + 8, width: kind === "input" ? 312 : 288, height: 20, reason };
}

// Figma's sending frame shows empty fields, but sending needs them filled.
const loadingFieldText = (["input", "input", "select", "input", "input", "select"] as const).map((kind, index) =>
  fieldText(index, kind, "Figma shows empty fields while sending"),
);
// Approved deviation: the field shows the ticked labels while open; Figma shows the placeholder.
const orderChannelsFieldText = fieldText(5, "select", "labels shown while open (approved deviation)");

export const visualScreens: VisualScreen[] = [
  { name: "landing-1470", figmaNode: "1-96", isCardFrame: false, masks: [] },
  { name: "landing-1728", figmaNode: "1-119", isCardFrame: false, masks: [] },
  { name: "landing-overlay-form", figmaNode: "30-25159", isCardFrame: false, masks: [] },
  { name: "form-default", figmaNode: "7-196", isCardFrame: true, masks: [checkboxBox, submitButton] },
  { name: "form-mobile-number", figmaNode: "27-24951", isCardFrame: true, masks: [checkboxBox, submitButton] },
  { name: "form-business-type-open", figmaNode: "7-4525", isCardFrame: true, masks: [] },
  { name: "form-order-channels-open", figmaNode: "11-9170", isCardFrame: true, masks: [orderChannelsFieldText] },
  { name: "form-field-error", figmaNode: "7-6775", isCardFrame: true, masks: [] },
  { name: "form-loading", figmaNode: "11-9300", isCardFrame: true, masks: [checkboxBox, ...loadingFieldText] },
  { name: "result-on-the-list", figmaNode: "7-6308", isCardFrame: true, masks: [] },
  {
    name: "result-already-on-the-list",
    figmaNode: "7-6743",
    isCardFrame: true,
    masks: [],
    acceptedException: {
      filteredMismatchPercent: 1.057,
      reason:
        "Accepted after review of the side-by-side image: Chrome rasterises two centred body lines about 1px wider each side than Figma, shifting every glyph by a fraction of a pixel. No styling difference.",
    },
  },
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
  let ignoredCanvasPixels = 0;
  let maskedPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = y * width + x;
      const isMasked = screen.masks.some((mask) => x >= mask.x && x < mask.x + mask.width && y >= mask.y && y < mask.y + mask.height);
      // Only on card frames: on full frames the same colour can occur inside the design.
      const isFigmaCanvas = screen.isCardFrame && FIGMA_CANVAS_COLOUR.every((channel, offset) => Math.abs(figma.data[pixelIndex * 4 + offset] - channel) <= FIGMA_CANVAS_TOLERANCE);
      if (isMasked || isFigmaCanvas) {
        blankOutPixel(figma, pixelIndex);
        blankOutPixel(actual, pixelIndex);
        if (isMasked) maskedPixels++;
        else ignoredCanvasPixels++;
      }
    }
  }

  const diff = new PNG({ width, height });
  const rawMismatchedPixels = pixelmatch(figma.data, actual.data, null, width, height, { threshold: 0.1, includeAA: true });
  const filteredMismatchedPixels = pixelmatch(figma.data, actual.data, diff.data, width, height, { threshold: 0.1, includeAA: false });
  const comparedPixels = width * height - maskedPixels - ignoredCanvasPixels;

  return {
    rawMismatchPercent: (rawMismatchedPixels / comparedPixels) * 100,
    filteredMismatchPercent: (filteredMismatchedPixels / comparedPixels) * 100,
    maximumFilteredMismatchPercent: maximumFilteredMismatchPercent(screen),
    comparedPixels,
    ignoredCanvasPixels,
    diffImage: PNG.sync.write(diff),
  };
}

const sideBySideGap = 16;

// Figma | build | diff, left to right, on white, for reviewing a card by eye.
export function writeSideBySide(screen: VisualScreen, screenshot: Buffer, diffImage: Buffer) {
  const panels = [readFileSync(path.join(figmaDirectory, `${screen.name}.png`)), screenshot, diffImage].map((image) => PNG.sync.read(image));
  const { width, height } = panels[0];
  const combined = new PNG({ width: width * panels.length + sideBySideGap * (panels.length - 1), height });
  combined.data.fill(255);
  panels.forEach((panel, panelIndex) => PNG.bitblt(panel, combined, 0, 0, width, height, panelIndex * (width + sideBySideGap), 0));
  mkdirSync(sideBySideDirectory, { recursive: true });
  writeFileSync(path.join(sideBySideDirectory, `${screen.name}.png`), PNG.sync.write(combined));
}

function formatPercent(value: number) {
  return `${value.toFixed(3)}%`;
}

function writeReport() {
  mkdirSync(diffDirectory, { recursive: true });
  const rows = visualScreens.map((screen) => {
    const screenshotPath = path.join(screenshotDirectory, `${screen.name}.png`);
    if (!existsSync(screenshotPath)) return `| ${screen.name} | ${screen.figmaNode} | — | — | — | — | not captured |`;

    let result: ComparisonResult;
    try {
      result = compareWithFigma(screen, readFileSync(screenshotPath));
    } catch (error) {
      return `| ${screen.name} | ${screen.figmaNode} | — | — | — | — | **${(error as Error).message}** |`;
    }
    writeFileSync(path.join(diffDirectory, `${screen.name}.png`), result.diffImage);
    if (screen.isCardFrame) writeSideBySide(screen, readFileSync(screenshotPath), result.diffImage);
    const isWithinLimit = result.filteredMismatchPercent <= result.maximumFilteredMismatchPercent;
    const verdict = !isWithinLimit ? "**defect**" : screen.acceptedException ? "pass (accepted exception)" : "pass";
    const masks = screen.masks.length === 0 ? "none" : `${screen.masks.length}: ${[...new Set(screen.masks.map((mask) => mask.reason))].join("; ")}`;
    return `| ${screen.name} | ${screen.figmaNode} | ${formatPercent(result.rawMismatchPercent)} | ${formatPercent(result.filteredMismatchPercent)} | ${formatPercent(result.maximumFilteredMismatchPercent)} | ${masks} | ${verdict} |`;
  });

  const report = [
    "# Visual comparison with Figma",
    "",
    "pixelmatch, threshold 0.1. Raw counts anti-aliased pixels; filtered ignores them (`includeAA: false`).",
    `A filtered mismatch over the limit is a defect: ${FULL_FRAME_LIMIT_PERCENT}% for full frames, ${CARD_FRAME_LIMIT_PERCENT}% for card-only captures.`,
    "On card frames, pixels in Figma's canvas colour (#1E1E1E within ±3 per channel, outside the card) are not compared.",
    "Figma | build | diff images for card screens are in tests/visual/side-by-side/.",
    "",
    "| Screen | Figma node | Raw mismatch | Filtered mismatch | Limit | Masks | Result |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
    "## Accepted exceptions",
    "",
    ...visualScreens
      .filter((screen) => screen.acceptedException)
      .map((screen) => `- ${screen.name} (${screen.figmaNode}), limit ${formatPercent(maximumFilteredMismatchPercent(screen))}: ${screen.acceptedException?.reason}`),
    "",
  ].join("\n");
  writeFileSync(reportPath, report);
  console.log(report);
}

const isRunDirectly = process.argv[1]?.endsWith("compare-with-figma.ts");
if (isRunDirectly) {
  writeReport();
}
