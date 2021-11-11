import { CookieOptions } from 'csurf'
import { Request } from 'express'

import { originUrl } from './index.config'

if (!process.env.CSRF_TOKEN_COOKIE)
    throw new Error('CSRF_TOKEN_COOKIE environmental variable not found')

export const csrfTokenCookie = process.env.CSRF_TOKEN_COOKIE

const cookie: CookieOptions = {
    sameSite: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    domain: originUrl.replace(/^https?:\/\//, '').replace(/:\d+/, '')
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
    cookie,
    ignoreMethods: ignore ? ignoreAllMethods : ignoreMethods,
    value: (req: Request) => req.cookies[csrfTokenCookie],
})
