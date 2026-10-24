"use client";

import { type Control, Controller } from "react-hook-form";
import { type RegistrationFormValues, orderChannelOptions } from "@/lib/early-access/schema";
import { SelectField } from "./select-field";

interface OrderChannelsSelectProps {
    control: Control<RegistrationFormValues>;
    isDisabled: boolean;
}

// Labels follow the fixed option order, whatever order they were ticked in (brief 8.5).
function selectedLabels(values: readonly string[]) {
    return orderChannelOptions
        .filter((option) => values.includes(option.value))
        .map((option) => option.label)
        .join(", ");
}

/**
 * Any number of order channels, including none. The list stays open while ticking, and the
 * field shows the chosen labels both while open and when closed.
 */
export const OrderChannelsSelect = ({ control, isDisabled }: OrderChannelsSelectProps) => {
    return (
        <Controller
            control={control}
            name="orderChannels"
            render={({ field }) => (
                <SelectField
                    selectionMode="multiple"
                    label="How do you take orders today?"
                    placeholder="How do you take orders today?"
                    options={orderChannelOptions}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    displayText={selectedLabels(field.value)}
                    isDisabled={isDisabled}
                    triggerRef={field.ref}
                />
            )}
        />
    );
};
