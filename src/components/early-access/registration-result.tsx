"use client";

import { StepCheck } from "@/assets/icons/step-check";
import { StatusView } from "./status-view";

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
        <StatusView
            icon={
                <div className="relative flex size-8 items-center justify-center rounded-full bg-success-solid">
                    <StepCheck />
                </div>
            }
            title={copy[outcome].title}
            message={copy[outcome].message(email)}
            buttonLabel="Done"
            onButtonPress={onDone}
        />
    );
};
