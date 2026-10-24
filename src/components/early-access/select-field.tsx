"use client";

import type { ReactNode, Ref } from "react";
import { Button as AriaButton, Label as AriaLabel, ListBox as AriaListBox, Select as AriaSelect, SelectValue as AriaSelectValue } from "react-aria-components";
import { ChevronDown } from "@/assets/icons/chevron-down";
import { HintText } from "@/components/base/input/hint-text";
import { Popover } from "@/components/base/select/popover";
// Imported through the select entry: select.tsx and select-item.tsx import each other, and
// loading select-item first leaves it uninitialised when select.tsx attaches it.
import { Select as UntitledSelect } from "@/components/base/select/select";
import { cx } from "@/utils/cx";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldBaseProps {
    label: string;
    placeholder: string;
    options: readonly SelectOption[];
    /** The text shown in the closed field; empty shows the placeholder. */
    displayText: string;
    onBlur: () => void;
    errorMessage?: string;
    isDisabled: boolean;
    triggerRef?: Ref<HTMLButtonElement>;
}

interface SingleSelectFieldProps extends SelectFieldBaseProps {
    selectionMode: "single";
    value: string;
    onChange: (value: string) => void;
}

interface MultipleSelectFieldProps extends SelectFieldBaseProps {
    selectionMode: "multiple";
    value: string[];
    onChange: (value: string[]) => void;
}

type SelectFieldProps = SingleSelectFieldProps | MultipleSelectFieldProps;

/**
 * A select built on React Aria and Untitled UI's popover and menu items, drawn as Figma
 * shows it (nodes 7-4525, 11-9170): size sm with 14/20 text, Figma's chevron, no focus ring
 * while the menu is open, and the text-input error style (red ring and 12/18 message, but no
 * alert icon). Used for both the single and the multiple select.
 */
export const SelectField = (props: SelectFieldProps) => {
    const { label, placeholder, options, displayText, onBlur, errorMessage, isDisabled, triggerRef } = props;
    const isInvalid = Boolean(errorMessage);

    const contents = ({ isOpen, isFocused }: { isOpen: boolean; isFocused: boolean }) => (
        <>
            <AriaLabel className="sr-only">{label}</AriaLabel>
            <AriaButton
                ref={triggerRef}
                className={cx(
                    "relative flex w-full cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-left shadow-xs ring-1 ring-primary outline-hidden transition-shadow duration-100 ease-linear ring-inset",
                    isFocused && !isOpen && "ring-2 ring-brand",
                    isInvalid && "ring-error_subtle",
                    isInvalid && isFocused && !isOpen && "ring-2 ring-error",
                    // Locked while sending, but drawn as normal (brief 8.8).
                    isDisabled && "cursor-not-allowed",
                )}
            >
                <AriaSelectValue className="min-w-0 flex-1 truncate text-sm">
                    {(): ReactNode =>
                        displayText === "" ? <span className="text-placeholder">{placeholder}</span> : <span className="text-primary">{displayText}</span>
                    }
                </AriaSelectValue>
                <ChevronDown data-testid="select-chevron" className="shrink-0" />
            </AriaButton>
            {errorMessage && (
                <HintText isInvalid className="text-xs">
                    {errorMessage}
                </HintText>
            )}
            {/* Figma's menu border sits inside its 336px width; Untitled UI draws the ring outside. */}
            <Popover size="sm" className="ring-inset">
                <AriaListBox items={options.map((option) => ({ id: option.value, label: option.label }))} className="outline-hidden">
                    {(item) => <UntitledSelect.Item id={item.id} label={item.label} />}
                </AriaListBox>
            </Popover>
        </>
    );

    const sharedProps = {
        onBlur,
        isInvalid,
        isDisabled,
        placeholder,
        validationBehavior: "aria" as const,
        className: "flex w-full flex-col gap-1.5",
        children: contents,
    };

    if (props.selectionMode === "multiple") {
        const { value, onChange } = props;
        return <AriaSelect {...sharedProps} selectionMode="multiple" value={value} onChange={(keys) => onChange(keys.map(String))} />;
    }

    const { value, onChange } = props;
    return <AriaSelect {...sharedProps} value={value === "" ? null : value} onChange={(key) => onChange(key === null ? "" : String(key))} />;
};
