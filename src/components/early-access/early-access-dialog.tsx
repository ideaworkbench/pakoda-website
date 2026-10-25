"use client";

import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import type { Registration, RegistrationFormValues } from "@/lib/early-access/schema";
import { cx } from "@/utils/cx";
import { CloseButton } from "./close-button";
import { EarlyAccessForm } from "./early-access-form";
import { type RegistrationOutcome, RegistrationResult } from "./registration-result";
import { SubmissionError } from "./submission-error";

export interface CompletedRegistration {
    outcome: RegistrationOutcome;
    email: string;
}

interface EarlyAccessDialogProps {
    isOpen: boolean;
    form: UseFormReturn<RegistrationFormValues, unknown, Registration>;
    isSending: boolean;
    completedRegistration: CompletedRegistration | null;
    hasSubmissionFailed: boolean;
    /** True right after "Try again", so the form puts focus back on its submit button. */
    shouldFocusSubmit: boolean;
    onSubmit: (registration: Registration) => void;
    onTryAgain: () => void;
    /** Closes mid-entry, or from the error view, and keeps what was typed. */
    onClose: () => void;
    /** Closes a result view and resets the form to empty. */
    onFinish: () => void;
}

const FormLogo = () => (
    <div className="flex shrink-0 items-center gap-3">
        <Image src="/brand/form-logomark.svg" alt="" width={27.0624} height={30} unoptimized className="h-[30px] w-[27.062px]" />
        <Image src="/brand/form-logotype.svg" alt="Pakoda" width={74.8268} height={15} unoptimized className="h-[15px] w-[74.827px]" />
    </div>
);

const StatusHeader = ({ onClose }: { onClose: () => void }) => (
    <header className="flex h-[30px] w-full items-center justify-between">
        <FormLogo />
        <CloseButton onPress={onClose} />
    </header>
);

/**
 * The early-access modal (brief 8.1). It closes only through x-close, "Done" or "Try again": backdrop
 * clicks and Escape are ignored. React Aria locks page scroll, traps focus and returns it
 * to the button that opened the modal. It renders outside the scaled stage, so it is always
 * drawn at Figma size.
 */
export const EarlyAccessDialog = ({
    isOpen,
    form,
    isSending,
    completedRegistration,
    hasSubmissionFailed,
    shouldFocusSubmit,
    onSubmit,
    onTryAgain,
    onClose,
    onFinish,
}: EarlyAccessDialogProps) => {
    const isFormView = !completedRegistration && !hasSubmissionFailed;

    return (
        <ModalOverlay
            isOpen={isOpen}
            isDismissable={false}
            isKeyboardDismissDisabled
            data-testid="modal-overlay"
            // Figma: bg-primary-solid (#0A0D12) at 50% opacity with no blur, card centred both ways.
            className={cx(
                "justify-center bg-[rgba(10,13,18,0.5)] p-0 backdrop-blur-none sm:p-0",
                isFormView ? "items-start sm:items-start" : "items-center sm:items-center",
            )}
        >
            <Modal
                className={cx(
                    "w-auto max-sm:overflow-visible max-sm:rounded-none",
                    // The form view keeps the top edge its default 518px height (Figma 7-196) gets when
                    // centred, so error messages grow it downward instead of moving x-close mid-click.
                    // Result and error views stay centred.
                    isFormView && "mt-[max(0px,calc((100dvh-518px)/2))]",
                )}
            >
                <Dialog aria-label="Pakoda early access">
                    {/* Figma's 1px card border is drawn inside the 400px width, hence an inset ring. */}
                    <div data-testid="early-access-card" className="relative w-[400px] rounded-2xl bg-primary p-8 ring-1 ring-primary ring-inset">
                        {completedRegistration ? (
                            <div className="flex flex-col items-center gap-12">
                                <StatusHeader onClose={onFinish} />
                                <RegistrationResult outcome={completedRegistration.outcome} email={completedRegistration.email} onDone={onFinish} />
                            </div>
                        ) : hasSubmissionFailed ? (
                            // Nothing was saved, so x-close keeps the values, as when closing mid-entry.
                            <div className="flex flex-col items-center gap-12">
                                <StatusHeader onClose={onClose} />
                                <SubmissionError onTryAgain={onTryAgain} />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                <header className="flex h-[30px] items-center justify-between">
                                    <FormLogo />
                                    <CloseButton onPress={onClose} isDisabled={isSending} />
                                </header>
                                <EarlyAccessForm form={form} isSending={isSending} shouldFocusSubmit={shouldFocusSubmit} onSubmit={onSubmit} />
                            </div>
                        )}
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};
