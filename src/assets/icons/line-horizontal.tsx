import type { SVGProps } from "react";

// Figma "Line 4": a 1px #D5D7DA rule. It stretches to its box width, so the box sets the length.
export const LineHorizontal = (props: SVGProps<SVGSVGElement>) => (
    <svg width="100%" height="1" viewBox="0 0 1728 1" preserveAspectRatio="none" fill="none" aria-hidden="true" {...props}>
        <path d="M0 0.5H1728" stroke="#D5D7DA" />
    </svg>
);
