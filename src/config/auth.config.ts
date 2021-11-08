import { Algorithm } from 'jsonwebtoken'

if (!process.env.JWT_SECRET)
    throw new Error('JWT_SECRET environmental variable not found')
if (!process.env.ACCESS_TOKEN_COOKIE)
    throw new Error('ACCESS_TOKEN_COOKIE environmental variable not found')
if (!process.env.REFRESH_TOKEN_COOKIE)
    throw new Error('REFRESH_TOKEN_COOKIE environmental variable not found')
if (!process.env.ACCESS_TOKEN_TTL || !parseInt(process.env.ACCESS_TOKEN_TTL))
    throw new Error('ACCESS_TOKEN_TTL environmental variable is not a number')
if (!process.env.REFRESH_TOKEN_TTL || !parseInt(process.env.REFRESH_TOKEN_TTL))
    throw new Error('REFRESH_TOKEN_TTL environmental variable is not a number')
if (
    !process.env.VERIFICATION_TOKEN_TTL ||
    !parseInt(process.env.VERIFICATION_TOKEN_TTL)
)
    throw new Error(
        'VERIFICATION_TOKEN_TTL environmental variable is not a number'
    )
if (
    !process.env.VERIFICATION_HASH_LENGTH ||
    !parseInt(process.env.VERIFICATION_HASH_LENGTH)
)
    throw new Error(
        'VERIFICATION_HASH_LENGTH environmental variable is not a number'
    )

export const jwtSecret = process.env.JWT_SECRET
export const accessTokenCookie = process.env.ACCESS_TOKEN_COOKIE
export const refreshTokenCookie = process.env.REFRESH_TOKEN_COOKIE
export const accessTokenTtl = parseInt(process.env.ACCESS_TOKEN_TTL)
export const refreshTokenTtl = parseInt(process.env.REFRESH_TOKEN_TTL)
export const verificationTokenTtl = parseInt(process.env.VERIFICATION_TOKEN_TTL)
export const verificationHashLength = parseInt(
    process.env.VERIFICATION_HASH_LENGTH
)

export interface AccessTokenPayload {
    purpose: 'at'
    sub: string // Session id
    user: string // User id
}

export interface RefreshTokenPayload {
    purpose: 'rt'
    sub: string // Session id
}

export type SessionPayload = AccessTokenPayload | RefreshTokenPayload

export type SessionPayloadNoType = Omit<AccessTokenPayload, 'purpose'>

const algorithm: Algorithm = 'HS256'

// export const issuer = baseUrl

// export const audience = [baseUrl]

export const signBaseOptions = {
    algorithm,
}
