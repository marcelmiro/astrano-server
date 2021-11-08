import { object, string } from 'zod'

export const createUserSchema = object({
    body: object({
        email: string({
            required_error: 'Email is required',
        }).email('Email is not a valid email address'),
        username: string({
            required_error: 'Username is required',
        })
            .min(3, 'Username is too short - Should be 3 characters minimum')
            .max(32, 'Username is too long - Should be 32 characters maximum')
            .regex(
                /^(?!.*[._]{2})(?!.*\.$)(?!\..*$)[a-zA-Z0-9._]+$/g,
                'Sorry, only alphanumeric characters and symbols (._) are allowed'
            ),
        name: string({
            required_error: 'Full name is required',
        })
            .min(2, 'Full name is too short - Should be 2 characters minimum')
            .max(32, 'Full name is too long - Should be 32 characters maximum')
            .regex(
                /^(?!.*[  ]{2})[a-zA-Z0-9 ]+$/g,
                'Sorry, only letters and single spaces are allowed'
            ),
        password: string({ required_error: 'Password is required' })
            .min(8, 'Password is too short - Should be 8 characters minimum')
            .max(100, 'Password is too long - Should be 100 characters maximum')
            .regex(
                /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[~!@#$%^&*()_\-+=[\]{}:;"'|\\<>,./?€]).*$/g,
                'Please use a mix of letters, numbers and symbols'
            ),
        passwordConfirmation: string({
            required_error: 'Confirm password is required',
        }),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: 'Passwords do not match',
        path: ['passwordConfirmation'],
    }),
})

export const getUserQuerySchema = object({
    query: object({
        id: string(),
        username: string(),
    })
        .partial()
        .refine(
            ({ id, username }) => id || username,
            'At least the id or username must be sent'
        ),
})

export const getUserParamsSchema = object({
    params: object({
        username: string({ required_error: 'Username is required' }),
    }).strict(),
})

export const verifyUserSchema = object({
    params: object({
        token: string({ required_error: 'Verification id is required' }),
    }).strict(),
})
