import type { RegistrationFormValues } from "./schema";

export type SubmissionResult =
    | { status: "created"; email?: string }
    | { status: "already_registered"; email: string }
    | { status: "invalid"; fieldErrors: Partial<Record<keyof RegistrationFormValues, string[]>> }
    | { status: "error" };

interface InsertError {
    code: string;
    message: string;
}

const UNIQUE_VIOLATION = "23505";

// Kept apart from the server action because a "use server" file may only export async functions.
export function submissionResultFromInsert(error: InsertError | null, email: string): SubmissionResult {
    if (!error) return { status: "created", email };
    if (error.code === UNIQUE_VIOLATION) return { status: "already_registered", email };
    return { status: "error" };
}
