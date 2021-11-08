import connectDb from './database.config'
import { connect as connectEmail } from './email.config'

if (!process.env.BASE_URL)
    throw new Error('BASE_URL environmental variable not found')
if (!process.env.ORIGIN_URL)
    throw new Error('ORIGIN_URL environmental variable not found')

export const baseUrl = process.env.BASE_URL
export const originUrl = process.env.ORIGIN_URL

export default async function config() {
    await Promise.all([connectDb(), connectEmail()])
}
