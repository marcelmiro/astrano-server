import connectDb from './database.config'
import { connect as connectEmail } from './email.config'

if (!process.env.BASE_URL)
    throw new Error('BASE_URL environmental variable not found')

const _originUrl = process.env.ORIGIN_URL?.replace(/\/*$/, '')
if (!_originUrl)
    throw new Error('ORIGIN_URL environmental variable not found')

export const baseUrl = process.env.BASE_URL
export const originUrl = _originUrl

export default async function config() {
    await Promise.all([connectDb(), connectEmail()])
}
