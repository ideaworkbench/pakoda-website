"use client";

import { Button as AriaButton } from "react-aria-components";
import { XClose } from "@/assets/icons/x-close";

interface CloseButtonProps {
    onPress: () => void;
    isDisabled?: boolean;
}

/**
 * The bare 24px x-close from Figma as a real button. Untitled UI's close button sits in a 44px
 * padded box with a hover background; Figma draws neither (brief 8.9).
 */
export const CloseButton = ({ onPress, isDisabled }: CloseButtonProps) => {
    return (
        <AriaButton
            aria-label="Close"
            onPress={onPress}
            isDisabled={isDisabled}
            className="size-6 shrink-0 cursor-pointer rounded-xs text-fg-quaternary outline-brand transition duration-100 ease-linear hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-fg-quaternary"
        >
            <XClose />
        </AriaButton>
    );
};
