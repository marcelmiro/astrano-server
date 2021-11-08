import { RequestHandler } from 'express'

import {
    accessTokenCookie,
    AccessTokenPayload,
    refreshTokenCookie,
} from '../config/auth.config'
import { verifyJwt } from '../utils/jwt'
import handleNewTokens from './handleNewTokens'

const deserializeUser: RequestHandler = async (req, res, next) => {
    // Get tokens and verify access token
    const accessToken = req.cookies[accessTokenCookie]

    const refreshToken = req.cookies[refreshTokenCookie]

    const verifiedAccessToken =
        !!accessToken && (await verifyJwt<AccessTokenPayload>(accessToken))

    const { decoded, expired } = verifiedAccessToken || {}

    // Access token valid
    if (decoded && decoded.purpose === 'at') {
        const locals = {
            accessToken,
            refreshToken,
            user: { id: decoded.user, session: decoded.sub },
        }
        res.locals = locals
    } else if (refreshToken && (!accessToken || expired)) {
        // Handle new tokens generation
        await handleNewTokens(refreshToken)(req, res, next) // Await is necessary
    } // If both fail, access and refresh tokens have expired (Login required)

    next()
}

export default deserializeUser
