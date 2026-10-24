"use client";

import { StepCheck } from "@/assets/icons/step-check";
import { Button } from "@/components/base/buttons/button";

export type RegistrationOutcome = "created" | "already_registered";

interface RegistrationResultProps {
    outcome: RegistrationOutcome;
    email: string;
    onDone: () => void;
}

// Figma sets the email in medium weight; it is the only emphasised text (brief 8.8).
const Email = ({ email }: { email: string }) => <strong className="font-medium">{email}</strong>;

const copy = {
    created: {
        title: "You’re on the list!",
        message: (email: string) => (
            <>
                We’ll contact you on <Email email={email} /> when your spot is ready.
            </>
        ),
    },
    already_registered: {
        title: "You’re already on the list!",
        message: (email: string) => (
            <>
                We already have <Email email={email} /> on our early access list. Sit tight, we’ll reach out soon.
            </>
        ),
    },
} as const;

/** The "on the list" (7-6308) and "already on the list" (7-6743) views. */
export const RegistrationResult = ({ outcome, email, onDone }: RegistrationResultProps) => {
    return (
        <>
            <div className="flex w-[320px] flex-col items-center gap-4">
                <div className="relative flex size-8 items-center justify-center rounded-full bg-success-solid">
                    <StepCheck />
                </div>
                <div className="flex w-full flex-col items-center gap-2 text-center">
                    <p className="text-md font-semibold text-secondary">{copy[outcome].title}</p>
                    <p className="text-md text-tertiary">{copy[outcome].message(email)}</p>
                </div>
            </div>
            <Button color="primary" size="sm" onClick={onDone} className="w-full font-medium shadow-none ring-0 before:hidden">
                Done
            </Button>
        </>
    );
};
