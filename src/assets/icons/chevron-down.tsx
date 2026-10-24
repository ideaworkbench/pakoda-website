import type { SVGProps } from "react";

// Figma chevron-down, re-exported from the Select node (the master component's export shows help-circle).
export const ChevronDown = (props: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
        <path d="M4 6L8 10L12 6" stroke="#A4A7AE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
