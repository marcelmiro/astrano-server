import { RequestHandler } from 'express'
import { Types } from 'mongoose'

import {
	accessTokenCookie,
	refreshTokenCookie,
	accessTokenTtl,
	refreshTokenTtl,
} from '../config/auth.config'
import { cookieDefaults } from '../config/csrf.config'
import { SessionInput } from '../models/session.model'
import { findUser, validatePassword } from '../services/user.service'
import {
	createSession,
	findSessions,
	deleteSessions,
	saveSession,
} from '../services/session.service'
import { signJwt } from '../utils/jwt'
import { getReqLocation, getUserAgent } from '../utils/device'
import { validationError } from '../utils/error'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const createSessionHandler: RequestHandler<
	any,
	unknown,
	SessionInput
> = async (req, res) => {
	// User already logged in
	if (res.locals.user) {
		const user = await findUser({ _id: res.locals.user.id })
		if (!user) {
			const message = 'Incorrect email or password'
			return res.status(401).json({ message })
		}

		const returnedUser = {
			email: user.email,
			username: user.username,
			logoUri: user.logoUri,
			likedProjects: user.likedProjects,
		}
		return res.status(201).json(returnedUser)
	}

	// Validate login credentials
	const { email, password } = req.body
	const user = await validatePassword(email, password)
	if (!user) {
		const message = 'Incorrect email or password'
		return res.status(401).json({ message })
	}

	if (!user.confirmed) {
		const message = 'Verify your email address before using your account'
		return res.status(403).json({ message })
	}

	// Calculate session expiration date
	const expiresAt = new Date(Date.now() + refreshTokenTtl * 1000)

	// Create new session to get session id before saving to database
	const session = await createSession({
		user: user._id,
		userAgent: getUserAgent(req.headers['user-agent']),
		location: await getReqLocation(req),
		expiresAt,
	})

	// Generate token payloads with session id
	const sub = session._id.toString()
	const userId = user._id.toString()
	const accessPayload = { purpose: 'at', sub, user: userId } as const
	const refreshPayload = { purpose: 'rt', sub } as const

	// Generate tokens
	const [accessToken, refreshToken] = await Promise.all([
		signJwt(accessPayload, { expiresIn: accessTokenTtl }),
		signJwt(refreshPayload, { expiresIn: refreshTokenTtl }),
	])

	// Update new session with refresh token and save to database
	// Session can now be saved with an automatic id and with the refresh token
	await saveSession({ session, refreshToken })

	// Set token cookies
	res.cookie(accessTokenCookie, accessToken, {
		...cookieDefaults,
		maxAge: accessTokenTtl * 1000,
	})
	res.cookie(refreshTokenCookie, refreshToken, {
		...cookieDefaults,
		maxAge: refreshTokenTtl * 1000,
	})

	const returnedUser = {
		email: user.email,
		username: user.username,
		logoUri: user.logoUri,
		likedProjects: user.likedProjects,
	}
	return res.status(201).json(returnedUser)
}

export const getSessionsHandler: RequestHandler = async (_req, res) => {
	const userId = res.locals.user.id

	const sessions = await findSessions({ user: userId }).catch(() => {
		throw new Error('An unexpected error occurred')
	})

	return res.status(200).json(sessions)
}

export const getSessionHandler: RequestHandler<{ id: string }> = async (
	req,
	res
) => {
	const userId = res.locals.user.id
	const sessionId = req.params.id

	const session = (await findSessions({ _id: sessionId, user: userId }))[0]
	if (!session) return res.status(404).json({ message: 'Session not found' })

	return res.status(200).json(session)
}

export const deleteCurrentSessionHandler: RequestHandler = async (
	_req,
	res
) => {
	const sessionId = res.locals.user?.session
	if (sessionId) await deleteSessions({ _id: sessionId }, true)

	res.clearCookie(accessTokenCookie, cookieDefaults)
	res.clearCookie(refreshTokenCookie, cookieDefaults)

	return res.status(200).json({ success: true })
}

export const deleteSessionHandler: RequestHandler = async (req, res) => {
	const userId = res.locals.user.id
	const sessionId = req.params.id

	// Check sessionId's format to mongoose object id
	if (!Types.ObjectId.isValid(sessionId)) {
		const error = {
			code: 'invalid format',
			message: 'Session id is not a valid object id',
			path: 'id',
		}
		return validationError(error)
	}

	await deleteSessions({ _id: sessionId, user: userId }, true)

	return res.status(200).json({ success: true })
}

export const deleteAllSessionsHandler: RequestHandler = async (_req, res) => {
	const userId = res.locals.user
	await deleteSessions({ user: userId }, false)

	res.clearCookie(accessTokenCookie, cookieDefaults)
	res.clearCookie(refreshTokenCookie, cookieDefaults)

	return res.status(200).json({ success: true })
}
