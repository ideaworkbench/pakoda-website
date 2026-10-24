import { LineHorizontal } from "@/assets/icons/line-horizontal";
import { LineVertical } from "@/assets/icons/line-vertical";

const lineColumnLeft = "left-[calc(50%-735px)]";
const lineColumnRight = "left-[calc(50%+735px)]";

/**
 * The 1px guide lines from Figma frame 1-119, shown only when the viewport is wider than
 * the 1470px content block. Positions match the export pixel for pixel: the left line sits on
 * the block's first column, the right line just outside its last column.
 */
export const WideViewportLinesBehindStage = () => (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[103px] hidden @min-[1471px]:block">
        <LineHorizontal className="block" />
    </div>
);

// Figma draws these above the photo, so they render after the stage.
export const WideViewportLinesAboveStage = () => (
    <div data-testid="wide-viewport-lines" aria-hidden="true" className="pointer-events-none absolute inset-0 hidden @min-[1471px]:block">
        <div className="absolute inset-x-0 top-[900px]">
            <LineHorizontal className="block" />
        </div>
        <LineVertical className={`absolute top-0 ${lineColumnLeft}`} />
        <LineVertical className={`absolute top-0 ${lineColumnRight}`} />
    </div>
);
