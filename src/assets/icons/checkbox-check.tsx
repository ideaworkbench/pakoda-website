import type { SVGProps } from "react";

// Figma check (12px) inside the ticked 16px checkbox.
export const CheckboxCheck = (props: SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="1.6666" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
