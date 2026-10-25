"use client";

import { useEffect, useRef } from "react";
import { StepX } from "@/assets/icons/step-x";
import { StatusView } from "./status-view";

interface SubmissionErrorProps {
    onTryAgain: () => void;
}

/**
 * The one generic view for every failed submission (Figma 61-1198): a server error or a request
 * that never completed. It never shows causes, codes or messages; field problems stay inline in
 * the form and "already registered" has its own view.
 */
export const SubmissionError = ({ onTryAgain }: SubmissionErrorProps) => {
    const titleRef = useRef<HTMLParagraphElement>(null);

    // Moving focus to the title makes screen readers announce the error when it replaces the form.
    useEffect(() => {
        titleRef.current?.focus();
    }, []);

    return (
        <StatusView
            icon={
                <div className="relative flex size-8 items-center justify-center rounded-full bg-error-solid">
                    <StepX />
                </div>
            }
            title="Something went wrong"
            message="We couldn’t save your request. Please try again in a moment."
            buttonLabel="Try again"
            onButtonPress={onTryAgain}
            titleRef={titleRef}
        />
    );
};
