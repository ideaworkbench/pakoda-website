"use client";

import { type ClipboardEvent, type SyntheticEvent, useState } from "react";
import { type Control, Controller } from "react-hook-form";
import { MOBILE_NUMBER_PREFIX, digitsFromPastedText, digitsFromTypedText, toDisplayValue } from "@/lib/early-access/mobile-number";
import type { RegistrationFormValues } from "@/lib/early-access/schema";
import { TextInputField } from "./text-input-field";

interface MobileNumberInputProps {
    control: Control<RegistrationFormValues>;
    isReadOnly: boolean;
}

// Keeps the caret and any selection out of the fixed "+91 " prefix, so it cannot be edited.
function keepCaretAfterPrefix(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const prefixEnd = MOBILE_NUMBER_PREFIX.length;
    if (input.value.startsWith(MOBILE_NUMBER_PREFIX) && (input.selectionStart ?? 0) < prefixEnd) {
        input.setSelectionRange(prefixEnd, Math.max(prefixEnd, input.selectionEnd ?? prefixEnd));
    }
}

/**
 * Optional Indian mobile number (brief 8.4). The form value holds only the 10 national
 * digits; "+91 " is shown in front of them while the field is focused or filled.
 */
export const MobileNumberInput = ({ control, isReadOnly }: MobileNumberInputProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Controller
            control={control}
            name="mobileNumber"
            render={({ field, fieldState }) => {
                const digits = field.value;

                // Any edit that leaves the prefix intact updates the digits. An edit that would break
                // the prefix (Backspace into it) is ignored, except clearing the field outright.
                const handleChange = (value: string) => {
                    if (value === "") field.onChange("");
                    else if (value.startsWith(MOBILE_NUMBER_PREFIX)) field.onChange(digitsFromTypedText(value.slice(MOBILE_NUMBER_PREFIX.length)));
                };

                const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
                    event.preventDefault();
                    field.onChange(digitsFromPastedText(event.clipboardData.getData("text/plain")));
                };

                return (
                    <TextInputField
                        label="Mobile number"
                        placeholder="Mobile number"
                        name={field.name}
                        inputRef={field.ref}
                        value={isFocused || digits !== "" ? toDisplayValue(digits) : ""}
                        onChange={handleChange}
                        onPaste={handlePaste}
                        onSelect={keepCaretAfterPrefix}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setIsFocused(false);
                            field.onBlur();
                        }}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        isReadOnly={isReadOnly}
                        errorMessage={fieldState.error?.message}
                    />
                );
            }}
        />
    );
};
