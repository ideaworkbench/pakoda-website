import type { SVGProps } from "react";

// Figma x-close (24px). Stroke follows `currentColor` so the button can switch between
// fg-quaternary and fg-quaternary_hover (#A4A7AE in the export).
export const XClose = (props: SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
        <path d="M18 6L12 12M12 12L6 18M12 12L6 6M12 12L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
