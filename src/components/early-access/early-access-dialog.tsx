"use client";

import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import type { Registration, RegistrationFormValues } from "@/lib/early-access/schema";
import { CloseButton } from "./close-button";
import { EarlyAccessForm } from "./early-access-form";
import { type RegistrationOutcome, RegistrationResult } from "./registration-result";

export interface CompletedRegistration {
    outcome: RegistrationOutcome;
    email: string;
}

interface EarlyAccessDialogProps {
    isOpen: boolean;
    form: UseFormReturn<RegistrationFormValues, unknown, Registration>;
    isSending: boolean;
    completedRegistration: CompletedRegistration | null;
    onSubmit: (registration: Registration) => void;
    /** Closes mid-entry and keeps what was typed. */
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

/**
 * The early-access modal (brief 8.1). It closes only through x-close or "Done": backdrop
 * clicks and Escape are ignored. React Aria locks page scroll, traps focus and returns it
 * to the button that opened the modal. It renders outside the scaled stage, so it is always
 * drawn at Figma size.
 */
export const EarlyAccessDialog = ({ isOpen, form, isSending, completedRegistration, onSubmit, onClose, onFinish }: EarlyAccessDialogProps) => {
    return (
        <ModalOverlay
            isOpen={isOpen}
            isDismissable={false}
            isKeyboardDismissDisabled
            data-testid="modal-overlay"
            // Figma: bg-primary-solid (#0A0D12) at 50% opacity with no blur, card centred both ways.
            className="items-center justify-center bg-[rgba(10,13,18,0.5)] p-0 backdrop-blur-none sm:p-0"
        >
            <Modal className="w-auto max-sm:overflow-visible max-sm:rounded-none">
                <Dialog aria-label="Pakoda early access">
                    {/* Figma's 1px card border is drawn inside the 400px width, hence an inset ring. */}
                    <div data-testid="early-access-card" className="relative w-[400px] rounded-2xl bg-primary p-8 ring-1 ring-primary ring-inset">
                        {completedRegistration ? (
                            <div className="flex flex-col items-center gap-12">
                                <header className="flex h-[30px] w-full items-center justify-between">
                                    <FormLogo />
                                    <CloseButton onPress={onFinish} />
                                </header>
                                <RegistrationResult outcome={completedRegistration.outcome} email={completedRegistration.email} onDone={onFinish} />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                <header className="flex h-[30px] items-center justify-between">
                                    <FormLogo />
                                    <CloseButton onPress={onClose} isDisabled={isSending} />
                                </header>
                                <EarlyAccessForm form={form} isSending={isSending} onSubmit={onSubmit} />
                            </div>
                        )}
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};
