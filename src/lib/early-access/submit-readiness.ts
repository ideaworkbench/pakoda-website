import { type RegistrationFormValues, registrationSchema } from "./schema";

/**
 * The submit button is enabled only when the whole form would pass validation: name,
 * business name and business type filled, a valid email, an empty or 10-digit mobile
 * number, and consent ticked (brief 8.6). The same schema produces the on-blur messages,
 * so the button rule and the errors can never disagree.
 */
export function isReadyToSubmit(values: RegistrationFormValues) {
    return registrationSchema.safeParse(values).success;
}
