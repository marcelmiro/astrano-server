import { CookieOptions } from 'csurf'
import { Request } from 'express'

import { originUrl } from './index.config'

if (!process.env.CSRF_TOKEN_COOKIE)
	throw new Error('CSRF_TOKEN_COOKIE environmental variable not found')

export const csrfTokenCookie = process.env.CSRF_TOKEN_COOKIE

const cookieDomain =
	process.env.COOKIE_DOMAIN ||
	originUrl.replace(/^https?:\/\//, '').replace(/:\d+/, '') // Remove protocol and port

export const cookieDefaults: CookieOptions = {
	sameSite: true,
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	domain: cookieDomain,
}

const ignoreMethods = ['HEAD', 'OPTIONS']

const ignoreAllMethods = [
	'CHECKOUT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'M-SEARCH',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE',
]

export const csrfOptions = (ignore = false) => ({
	cookie: cookieDefaults,
	ignoreMethods: ignore ? ignoreAllMethods : ignoreMethods,
	value: (req: Request) => req.cookies[csrfTokenCookie],
})
