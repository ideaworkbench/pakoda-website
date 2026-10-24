import type { SVGProps } from "react";

// Figma alert-circle (16px), shown at the right of a text input with an error.
export const AlertCircle = (props: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
        <path
            d="M8 5.33333V8M8 10.6667H8.00667M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.3181 4.3181 1.33333 8 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z"
            stroke="#F04438"
            strokeWidth="1.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
