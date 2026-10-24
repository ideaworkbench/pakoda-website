"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/base/buttons/button";
import { type Registration, type RegistrationFormValues, emptyRegistrationForm, registrationSchema } from "@/lib/early-access/schema";
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

    const form = useForm<RegistrationFormValues, unknown, Registration>({
        resolver: zodResolver(registrationSchema),
        defaultValues: emptyRegistrationForm,
        // Errors first appear when a field is left, then re-check as the user types (brief 8.7).
        mode: "onTouched",
    });

    const handleSubmit = () => {
        setIsSending(true);
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
                onSubmit={handleSubmit}
                onClose={() => setIsOpen(false)}
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
