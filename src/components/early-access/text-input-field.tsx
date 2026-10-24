"use client";

import type { ComponentProps, Ref } from "react";
import { HintText } from "@/components/base/input/hint-text";
import { InputBase, TextField } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";

type TextFieldProps = ComponentProps<typeof TextField>;

interface TextInputFieldProps extends Omit<TextFieldProps, "children" | "isInvalid"> {
    label: string;
    placeholder: string;
    errorMessage?: string;
    inputRef?: Ref<HTMLInputElement>;
}

/**
 * An Untitled UI input as Figma draws it: placeholder only, with the label kept for screen
 * readers (brief 8.3), size sm at 14/20 instead of Untitled UI's 16/24, and a 12/18 error
 * message 6px below.
 */
export const TextInputField = ({ label, placeholder, errorMessage, inputRef, ...textFieldProps }: TextInputFieldProps) => {
    const isInvalid = Boolean(errorMessage);

    return (
        <TextField {...textFieldProps} isInvalid={isInvalid} validationBehavior="aria" size="sm">
            <Label className="sr-only">{label}</Label>
            <InputBase ref={inputRef} placeholder={placeholder} isInvalid={isInvalid} inputClassName="text-sm" />
            {errorMessage && (
                <HintText isInvalid className="text-xs">
                    {errorMessage}
                </HintText>
            )}
        </TextField>
    );
};
