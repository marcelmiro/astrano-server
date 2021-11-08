interface ErrorInput {
    code: string
    message: string
    path: string | string[]
}

interface ValidationIssue {
    code: string
    message: string
    path: string[]
}

interface ValidationError {
    type: string
    errors: ValidationIssue[]
}

export function validationError(errorInput: ErrorInput | ErrorInput[]): void {
    const inputErrors = Array.isArray(errorInput) ? errorInput : [errorInput]

    const error: ValidationError = { type: 'validation', errors: [] }

    error.errors = inputErrors.map(({ code, message, path }) => ({
        code,
        message,
        path: Array.isArray(path) ? path : [path],
    }))

    throw error
}
