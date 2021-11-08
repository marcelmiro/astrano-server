import { object, string } from 'zod'

export const getProjectsSchema = object({
    query: object({
        sort: string().optional(),
    }),
})

export const getProjectSchema = object({
    params: object({
        slug: string({ required_error: 'Project slug is required' }),
    }).strict(),
})
