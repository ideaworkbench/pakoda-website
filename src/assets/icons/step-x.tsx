import type { SVGProps } from "react";

// Figma x (16px, component 61:1236) inside the red circle on the error view.
export const StepX = (props: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
        <path
            d="M11.3333 4.66667L8 8M8 8L4.66667 11.3333M8 8L4.66667 4.66667M8 8L11.3333 11.3333"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
