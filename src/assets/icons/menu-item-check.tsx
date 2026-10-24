import type { SVGProps } from "react";

// Figma check (16px) in fg-brand-primary, marking a selected menu item.
export const MenuItemCheck = (props: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#768BCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
