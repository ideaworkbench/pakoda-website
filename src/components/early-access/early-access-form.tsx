"use client";

import { Controller, type UseFormReturn, useWatch } from "react-hook-form";
import { LoadingSpinner } from "@/assets/icons/loading-spinner";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { type Registration, type RegistrationFormValues, businessTypeOptions, fieldMaxLengths } from "@/lib/early-access/schema";
import { isReadyToSubmit } from "@/lib/early-access/submit-readiness";
import { cx } from "@/utils/cx";
import { MobileNumberInput } from "./mobile-number-input";
import { OrderChannelsSelect } from "./order-channels-select";
import { SelectField } from "./select-field";
import { TextInputField } from "./text-input-field";

interface EarlyAccessFormProps {
    form: UseFormReturn<RegistrationFormValues, unknown, Registration>;
    isSending: boolean;
    onSubmit: (registration: Registration) => void;
}

function businessTypeLabel(value: string) {
    return businessTypeOptions.find((option) => option.value === value)?.label ?? "";
}

// "Privacy Policy." is styled as in Figma but is plain text: the page is deferred (brief 8.6).
const consentLabel = (
    <>
        I agree to be contacted about Pakoda and accept the{" "}
        <span className="text-brand-primary underline decoration-from-font [text-decoration-skip-ink:none] [text-underline-position:from-font]">
            Privacy Policy.
        </span>
    </>
);

export const EarlyAccessForm = ({ form, isSending, onSubmit }: EarlyAccessFormProps) => {
    const { control, register, handleSubmit } = form;
    const values = useWatch({ control }) as RegistrationFormValues;
    const isReady = isReadyToSubmit(values);

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
                <Controller
                    control={control}
                    name="fullName"
                    render={({ field, fieldState }) => (
                        <TextInputField
                            {...field}
                            inputRef={field.ref}
                            label="Your name"
                            placeholder="Your name"
                            autoComplete="name"
                            maxLength={fieldMaxLengths.fullName}
                            isReadOnly={isSending}
                            errorMessage={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="businessName"
                    render={({ field, fieldState }) => (
                        <TextInputField
                            {...field}
                            inputRef={field.ref}
                            label="Business name"
                            placeholder="Business name"
                            autoComplete="organization"
                            maxLength={fieldMaxLengths.businessName}
                            isReadOnly={isSending}
                            errorMessage={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="businessType"
                    render={({ field, fieldState }) => (
                        <SelectField
                            selectionMode="single"
                            label="Business type"
                            placeholder="Business type"
                            options={businessTypeOptions}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            displayText={businessTypeLabel(field.value)}
                            errorMessage={fieldState.error?.message}
                            isDisabled={isSending}
                            triggerRef={field.ref}
                        />
                    )}
                />
                <MobileNumberInput control={control} isReadOnly={isSending} />
                <Controller
                    control={control}
                    name="email"
                    render={({ field, fieldState }) => (
                        <TextInputField
                            {...field}
                            inputRef={field.ref}
                            type="email"
                            label="Email address"
                            placeholder="Email address"
                            autoComplete="email"
                            maxLength={fieldMaxLengths.email}
                            isReadOnly={isSending}
                            errorMessage={fieldState.error?.message}
                        />
                    )}
                />
                <OrderChannelsSelect control={control} isDisabled={isSending} />
            </div>

            <Controller
                control={control}
                name="consentGiven"
                render={({ field }) => (
                    <Checkbox
                        name={field.name}
                        isSelected={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        isReadOnly={isSending}
                        label={consentLabel}
                    />
                )}
            />

            {/* Figma draws the enabled button flat (no shadow, ring or inner border) in medium weight.
                While sending it shows Figma's spinner and the hover blue instead of the disabled grey. */}
            <Button
                type="submit"
                color="primary"
                size="sm"
                isDisabled={!isReady || isSending}
                iconLeading={isSending ? <LoadingSpinner data-icon="loading" className="animate-spin" /> : undefined}
                className={cx(
                    "w-full font-medium shadow-none ring-0 before:hidden",
                    isSending && "disabled:bg-brand-solid_hover disabled:text-white disabled:shadow-none",
                )}
            >
                {isSending ? "Sending..." : "Request early access"}
            </Button>

            {/* Honeypot: out of sight and out of the tab order, so only bots fill it. */}
            <input
                {...register("website")}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] size-px opacity-0"
            />
        </form>
    );
};
