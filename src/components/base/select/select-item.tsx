"use client";

import { isValidElement, useContext } from "react";
import type { ListBoxItemProps as AriaListBoxItemProps } from "react-aria-components";
import { ListBoxItem as AriaListBoxItem, Text as AriaText } from "react-aria-components";
import { MenuItemCheck } from "@/assets/icons/menu-item-check";
import { Avatar } from "@/components/base/avatar/avatar";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";
import type { SelectItemType } from "./select";
import { SelectContext } from "./select";

// The Pakoda Figma file pads items 8px all round, and 10px on the right only when the check shows.
const sizes = {
    sm: "p-2",
    md: "p-2.5 pl-2",
};

interface SelectItemProps extends Omit<AriaListBoxItemProps<SelectItemType>, "id">, SelectItemType {}

export const SelectItem = ({ label, id, value, avatarUrl, supportingText, isDisabled, icon: Icon, className, children, ...props }: SelectItemProps) => {
    const { size } = useContext(SelectContext);

    const labelOrChildren = label || (typeof children === "string" ? children : "");
    const textValue = supportingText ? labelOrChildren + " " + supportingText : labelOrChildren;

    return (
        <AriaListBoxItem
            id={id}
            value={
                value ?? {
                    id,
                    label: labelOrChildren,
                    avatarUrl,
                    supportingText,
                    isDisabled,
                    icon: Icon,
                }
            }
            textValue={textValue}
            isDisabled={isDisabled}
            {...props}
            className={(state) => cx("w-full px-1.5 py-px outline-hidden", typeof className === "function" ? className(state) : className)}
        >
            {(state) => (
                <div
                    className={cx(
                        "flex cursor-pointer items-center gap-2 rounded-md outline-hidden select-none",
                        state.isSelected && "bg-active",
                        state.isDisabled && "cursor-not-allowed",
                        // Selected keeps Figma's bg-active under the pointer or focus; keyboard focus
                        // still shows through the inset focus ring below.
                        state.isFocused && !state.isSelected && "bg-primary_hover",
                        state.isFocusVisible && "ring-2 ring-focus-ring ring-inset",

                        // Icon styles
                        "*:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:text-fg-quaternary",
                        state.isDisabled && "*:data-icon:text-fg-disabled",

                        sizes[size],
                        size === "sm" && state.isSelected && "pr-2.5",
                    )}
                >
                    {avatarUrl ? (
                        <Avatar aria-hidden="true" size="xs" src={avatarUrl} alt={label} />
                    ) : isReactComponent(Icon) ? (
                        <Icon data-icon aria-hidden="true" />
                    ) : isValidElement(Icon) ? (
                        Icon
                    ) : null}

                    <div className="flex w-full min-w-0 flex-1 flex-wrap gap-x-2">
                        <AriaText
                            slot="label"
                            className={cx("truncate text-md font-medium whitespace-nowrap text-primary", state.isDisabled && "text-disabled")}
                        >
                            {label || (typeof children === "function" ? children(state) : children)}
                        </AriaText>

                        {supportingText && (
                            <AriaText slot="description" className={cx("text-md whitespace-nowrap text-tertiary", state.isDisabled && "text-disabled")}>
                                {supportingText}
                            </AriaText>
                        )}
                    </div>

                    {/* The Pakoda Figma file's check: 16px, 1.5px stroke, fg-brand-primary. */}
                    {state.isSelected && <MenuItemCheck className={cx("ml-auto shrink-0", size === "md" && "size-5")} />}
                </div>
            )}
        </AriaListBoxItem>
    );
};
