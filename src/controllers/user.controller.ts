import { RequestHandler } from 'express'
import { Types, ObjectId } from 'mongoose'

import { accessTokenCookie, refreshTokenCookie } from '../config/auth.config'
import { cookieDefaults } from '../config/csrf.config'
import { createUser, findUser, verifyUser } from '../services/user.service'
import { UserInput } from '../models/user.model'
import { deleteSessions } from '../services/session.service'
import { validationError } from '../utils/error'
import { findLikedProjects } from '../services/project.service'

export const createUserHandler: RequestHandler<
	unknown,
	unknown,
	UserInput
> = async (req, res) => {
	const user = await createUser(req.body)
	return res.status(201).json(user)
}

export const getCurrentUserHandler: RequestHandler = async (_req, res) => {
	const userId = res.locals.user.id

	const user = await findUser({ _id: userId })

	// Revoke access to session and tokens
	if (!user) {
		await deleteSessions({ user: userId }, false)

		res.clearCookie(accessTokenCookie, cookieDefaults)
		res.clearCookie(refreshTokenCookie, cookieDefaults)

		return res.status(401).json({ message: 'An unexpected error occurred' })
	}

	const { email, username, logoUri, likedProjects } = user
	const returnedUser = { email, username, logoUri, likedProjects }
	return res.status(200).json(returnedUser)
}

export const getCurrentUserLikedProjectsHandler: RequestHandler = async (
	_req,
	res
) => {
	const userId = res.locals.user.id

	const user = await findUser({ _id: userId })

	// Revoke access to session and tokens
	if (!user) {
		await deleteSessions({ user: userId }, false)

		res.clearCookie(accessTokenCookie, cookieDefaults)
		res.clearCookie(refreshTokenCookie, cookieDefaults)

		return res.status(401).json({ message: 'An unexpected error occurred' })
	}

	const { likedProjects } = user

	const projects = await findLikedProjects(likedProjects as ObjectId[])

	return res.status(200).json({ likedProjects: projects })
}

type UserQuery = { id: string; username: string }
export const getUserQueryHandler: RequestHandler<
	unknown,
	unknown,
	unknown,
	UserQuery
> = async (req, res) => {
	// Remove all query parameters with "false" values
	const query = Object.fromEntries(
		Object.entries(req.query as UserQuery).filter(([, v]) => v)
	)

	const { id, ...restQuery } = query

	// Set id to correct field if exists and check if id is a valid Mongo object id
	if (id) restQuery._id = id
	if (restQuery._id && !Types.ObjectId.isValid(restQuery._id)) {
		const error = {
			code: 'invalid format',
			message: 'User id is not a valid object id',
			path: id ? 'id' : '_id',
		}
		return validationError(error)
	}

	const user = await findUser(restQuery)
	if (!user) return res.status(404).json({ message: 'User not found' })

	const { username, logoUri } = user
	const returnedUser = { username, logoUri }
	return res.status(200).json(returnedUser)
}

export const getUserParamsHandler: RequestHandler<{
	username: string
}> = async (req, res) => {
	const user = await findUser(req.params)
	if (!user) return res.status(404).json({ message: 'User not found' })
	const { username, logoUri } = user
	const returnedUser = { username, logoUri }
	return res.status(200).json(returnedUser)
}

export const verifyUserHandler: RequestHandler<{ token: string }> = async (
	req,
	res
) => {
	const isVerified = await verifyUser(req.params.token)

	if (!isVerified) {
		const message = 'Incorrect or expired verification url'
		return res.status(404).json({ message })
	}

	return res.status(200).json({ success: true })
}
