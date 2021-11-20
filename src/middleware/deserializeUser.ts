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
		// Handle new tokens generation (await is necessary)
		// Next function not passed to avoid next being called in
		// handleNewTokens and not at the end of this middleware
		/* eslint-disable @typescript-eslint/no-empty-function */
		await handleNewTokens(refreshToken)(req, res, () => {})
	} // If both fail, access and refresh tokens have expired (Login required)

	next()
}

export default deserializeUser
