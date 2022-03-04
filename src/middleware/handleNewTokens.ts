import { RequestHandler } from 'express'

import logger from '../utils/logger'
import {
	accessTokenCookie,
	refreshTokenCookie,
	accessTokenTtl,
	refreshTokenTtl,
} from '../config/auth.config'
import { cookieDefaults } from '../config/csrf.config'
import { reIssueTokens, deleteSessions } from '../services/session.service'
import { getReqLocation, getUserAgent } from '../utils/device'
import { shallowCompare } from '../utils/object'

const handleNewTokens =
	(refreshToken: string): RequestHandler =>
	async (req, res) => {
		// Generate new tokens
		const reIssue = await reIssueTokens(refreshToken)

		// Re-issue failed
		if (!reIssue) {
			// TODO: Check if refresh token is an old user token. If so, revoke all user's tokens/sessions
			// https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/

			// Invalid refresh token
			logger.info({ msg: 'Refresh token expired', refreshToken })

			res.clearCookie(accessTokenCookie, cookieDefaults)
			res.clearCookie(refreshTokenCookie, cookieDefaults)

			return (res.locals = {})
		}

		// Re-issue successful
		logger.info('Access token expired')

		const {
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			session,
		} = reIssue

		// Compare request's and session's user agent
		const reqAgent = getUserAgent(req.headers['user-agent'])
		const sessionAgent = session.userAgent

		const agentKeys = ['browser', 'os', 'device']
		if (
			sessionAgent &&
			!shallowCompare(reqAgent, sessionAgent, agentKeys)
		) {
			logger.info({
				msg: 'Request and session devices do not match',
				reqAgent,
				sessionAgent,
			})

			const sessionQuery = session
				? { _id: session._id }
				: { refreshToken }

			await deleteSessions(sessionQuery, true)

			res.clearCookie(accessTokenCookie, cookieDefaults)
			res.clearCookie(refreshTokenCookie, cookieDefaults)

			return (res.locals.revokedSession = true)
		}

		// Compare request's session's geolocation
		const reqLocation = await getReqLocation(req)

		const locationKeys = ['countryCode', 'city']
		if (
			session.location &&
			!shallowCompare(reqLocation, session.location, locationKeys)
		) {
			logger.info({
				msg: 'Request and session countries or cities do not match',
				reqLocation,
				sessionLocation: session.location,
			})

			await deleteSessions({ _id: session._id }, true)

			res.clearCookie(accessTokenCookie, cookieDefaults)
			res.clearCookie(refreshTokenCookie, cookieDefaults)

			return (res.locals.revokedSession = true)
		}

		// Set token cookies
		res.cookie(accessTokenCookie, newAccessToken, {
			...cookieDefaults,
			maxAge: accessTokenTtl * 1000,
		})
		res.cookie(refreshTokenCookie, newRefreshToken, {
			...cookieDefaults,
			maxAge: refreshTokenTtl * 1000,
		})

		const user = { id: session.user, session: session._id }

		const locals = {
			user,
			accessToken: newAccessToken || null,
			refreshToken: newRefreshToken || null,
		}

		res.locals = locals
	}

export default handleNewTokens
