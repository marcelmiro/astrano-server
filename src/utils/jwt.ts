import { sign, verify, SignOptions, JwtPayload } from 'jsonwebtoken'

import { jwtSecret, signBaseOptions } from '../config/auth.config'

type SignJwt = (
    payload: Record<string, unknown>,
    options?: SignOptions
) => Promise<string>

export const signJwt: SignJwt = async (payload, options) => {
    const token = await new Promise<string | undefined>((resolve) => {
        if (!payload) resolve(undefined)

        const signOptions = { ...signBaseOptions, ...options }

        sign(payload, jwtSecret, signOptions, (err, token) => {
            if (err) resolve(undefined)
            else resolve(token)
        })
    })

    if (!token) throw new Error('An unexpected error occurred')
    return token
}

export async function verifyJwt<T extends JwtPayload>(token: string) {
    try {
        type Decoded = T & JwtPayload

        const decoded = await new Promise<Decoded>((resolve, reject) => {
            if (!token) reject()

            verify(token, jwtSecret, (err, decoded) => {
                if (err || !decoded) reject(err)
                else resolve(decoded as Decoded)
            })
        })

        return { decoded, expired: false } as const
    } catch (e) {
        return {
            decoded: null,
            expired: (e as Error)?.message === 'jwt expired',
        }
    }
}
