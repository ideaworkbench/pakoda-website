"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/base/buttons/button";
import { type Registration, type RegistrationFormValues, emptyRegistrationForm, registrationSchema } from "@/lib/early-access/schema";
import type { SubmissionResult } from "@/lib/early-access/submission-result";
import { submitRegistration } from "@/lib/early-access/submit-registration";
import { type CompletedRegistration, EarlyAccessDialog } from "./early-access-dialog";

interface EarlyAccessContextValue {
    openEarlyAccess: () => void;
}

const EarlyAccessContext = createContext<EarlyAccessContextValue | null>(null);

function useEarlyAccess() {
    const context = useContext(EarlyAccessContext);
    if (!context) throw new Error("useEarlyAccess must be used inside EarlyAccessProvider");
    return context;
}

/**
 * Owns the one early-access modal that both calls to action open. The form lives here rather
 * than in the modal, so closing mid-entry keeps what was typed (brief 8.1).
 */
export const EarlyAccessProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [completedRegistration, setCompletedRegistration] = useState<CompletedRegistration | null>(null);
    const [hasSubmissionFailed, setHasSubmissionFailed] = useState(false);
    const [shouldFocusSubmit, setShouldFocusSubmit] = useState(false);

    const form = useForm<RegistrationFormValues, unknown, Registration>({
        resolver: zodResolver(registrationSchema),
        defaultValues: emptyRegistrationForm,
        // Errors first appear when a field is left, then re-check as the user types (brief 8.7).
        mode: "onTouched",
    });

    const showResult = (result: SubmissionResult, enteredEmail: string) => {
        if (result.status === "created") {
            setCompletedRegistration({ outcome: "created", email: enteredEmail });
        } else if (result.status === "already_registered") {
            setCompletedRegistration({ outcome: "already_registered", email: enteredEmail });
        } else if (result.status === "invalid") {
            // Field problems stay inline under their fields, never in the error view.
            for (const [field, messages] of Object.entries(result.fieldErrors)) {
                form.setError(field as keyof RegistrationFormValues, { message: messages?.[0] });
            }
        } else {
            setHasSubmissionFailed(true);
        }
    };

    const handleSubmit = async () => {
        setIsSending(true);
        setShouldFocusSubmit(false);
        // The raw values go to the server, which validates them again with the same schema.
        const values = form.getValues();
        try {
            showResult(await submitRegistration(values), values.email.trim());
        } catch (error) {
            // A network failure never reaches the server's log, so it is recorded here.
            console.error("Early access submission did not reach the server", error);
            setHasSubmissionFailed(true);
        } finally {
            setIsSending(false);
        }
    };

    // Back to the form exactly as it was left; nothing is resubmitted until the user presses the button.
    const tryAgain = () => {
        setHasSubmissionFailed(false);
        setShouldFocusSubmit(true);
    };

    // From the form or the error view: nothing was saved, so every value is kept for reopening.
    const close = () => {
        setIsOpen(false);
        setHasSubmissionFailed(false);
        setShouldFocusSubmit(false);
    };

    const finish = () => {
        setIsOpen(false);
        setCompletedRegistration(null);
        form.reset(emptyRegistrationForm);
    };

    return (
        <EarlyAccessContext.Provider value={{ openEarlyAccess: () => setIsOpen(true) }}>
            {children}
            <EarlyAccessDialog
                isOpen={isOpen}
                form={form}
                isSending={isSending}
                completedRegistration={completedRegistration}
                hasSubmissionFailed={hasSubmissionFailed}
                shouldFocusSubmit={shouldFocusSubmit}
                onSubmit={handleSubmit}
                onTryAgain={tryAgain}
                onClose={close}
                onFinish={finish}
            />
        </EarlyAccessContext.Provider>
    );
};

interface EarlyAccessTriggerProps {
    color: "primary" | "secondary";
    size: "sm";
    className?: string;
    children: ReactNode;
}

/** A call to action that opens the early-access modal. */
export const EarlyAccessTrigger = (props: EarlyAccessTriggerProps) => {
    const { openEarlyAccess } = useEarlyAccess();
    return <Button {...props} onClick={openEarlyAccess} />;
};
