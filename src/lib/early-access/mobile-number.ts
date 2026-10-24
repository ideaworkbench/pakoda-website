// The form keeps only the national digits. "+91 " is shown in front of them while the field
// is focused or filled, and "+91" is prepended when storing.

export const MOBILE_NUMBER_PREFIX = "+91 ";

const NATIONAL_NUMBER_LENGTH = 10;

function digitsOnly(text: string) {
    return text.replace(/\D/g, "");
}

export function digitsFromTypedText(text: string) {
    return digitsOnly(text).slice(0, NATIONAL_NUMBER_LENGTH);
}

/**
 * Pasted numbers often carry a country code (+91, 91, 0091), a trunk 0, spaces or dashes.
 * Keeping the last 10 digits drops any of those prefixes from a full number; an explicit
 * "+91" is also dropped from a short one.
 */
export function digitsFromPastedText(text: string) {
    const withoutCountryCode = text.trim().replace(/^\+91/, "");
    return digitsOnly(withoutCountryCode).slice(-NATIONAL_NUMBER_LENGTH);
}

export function toDisplayValue(digits: string) {
    return `${MOBILE_NUMBER_PREFIX}${digits}`;
}

export function toStoredMobileNumber(digits: string) {
    return digits === "" ? null : `+91${digits}`;
}
