import { object, string } from 'zod'

export const createSessionSchema = object({
    body: object({
        email: string({
            required_error: 'Email is required',
        }).email('Email is not a valid email address'),
        password: string({
            required_error: 'Password is required',
        }).min(1, 'Password is required'),
    }),
})

export const getSessionSchema = object({
    params: object({
        id: string({ required_error: 'Session id is required' }),
    }).strict(),
})

export const deleteSessionSchema = object({
    params: object({
        id: string({ required_error: 'Session id is required' }),
    }).strict(),
})
