"use client";

import type { ReactNode, Ref } from "react";
import { Button } from "@/components/base/buttons/button";

interface StatusViewProps {
    /** The 32px circle with its 16px icon. */
    icon: ReactNode;
    title: string;
    message: ReactNode;
    buttonLabel: string;
    onButtonPress: () => void;
    /** Set when focus should move to the title, so screen readers announce the view. */
    titleRef?: Ref<HTMLParagraphElement>;
}

/**
 * The shared body of the result and error views (Figma _Step base): icon, title and message
 * in a centred 320px column, then a full-width flat primary button.
 */
export const StatusView = ({ icon, title, message, buttonLabel, onButtonPress, titleRef }: StatusViewProps) => {
    return (
        <>
            <div className="flex w-[320px] flex-col items-center gap-4">
                {icon}
                <div className="flex w-full flex-col items-center gap-2 text-center">
                    <p ref={titleRef} tabIndex={titleRef ? -1 : undefined} className="text-md font-semibold text-secondary outline-hidden">
                        {title}
                    </p>
                    <p className="text-md text-tertiary">{message}</p>
                </div>
            </div>
            <Button color="primary" size="sm" onClick={onButtonPress} className="w-full font-medium shadow-none ring-0 before:hidden">
                {buttonLabel}
            </Button>
        </>
    );
};
