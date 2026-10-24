import type { SVGProps } from "react";

// Figma "Line 2": the same 1px #D5D7DA rule, which Figma rotates 90°. Drawn upright here so it
// can stretch to the full page height.
export const LineVertical = (props: SVGProps<SVGSVGElement>) => (
    <svg width="1" height="100%" viewBox="0 0 1 1117" preserveAspectRatio="none" fill="none" aria-hidden="true" {...props}>
        <path d="M0.5 0V1117" stroke="#D5D7DA" />
    </svg>
);
