import { CorsOptions } from 'cors'

import connectDb from './database.config'
import { connect as connectEmail } from './email.config'
import { connect as connectFile } from './file.config'

if (!process.env.BASE_URL)
	throw new Error('BASE_URL environmental variable not found')
const _originUrl = process.env.ORIGIN_URL?.replace(/\/*$/, '')
if (!_originUrl) throw new Error('ORIGIN_URL environmental variable not found')

export default async function config() {
	await Promise.all([connectDb(), connectEmail(), connectFile()])
}

export const baseUrl = process.env.BASE_URL

export const originUrl = _originUrl

export const corsOptions: CorsOptions = {
	origin: originUrl,
	credentials: true,
}
