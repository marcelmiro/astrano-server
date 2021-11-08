import { RequestHandler } from 'express'
import { Types } from 'mongoose'

import { accessTokenCookie, refreshTokenCookie } from '../config/auth.config'
import { createUser, findUser, verifyUser } from '../services/user.service'
import { UserInput } from '../models/user.model'
import { deleteSessions } from '../services/session.service'
import { validationError } from '../utils/error'

export const createUserHandler: RequestHandler<unknown, unknown, UserInput> =
    async (req, res) => {
        await createUser(req.body)

        return res.status(201).json({ message: 'ok' })
    }

export const getCurrentUserHandler: RequestHandler = async (req, res) => {
    const userId = res.locals.user.id

    const user = await findUser({ _id: userId })

    // Revoke access to session and tokens
    if (!user) {
        await deleteSessions({ user: userId }, false)

        res.clearCookie(accessTokenCookie)
        res.clearCookie(refreshTokenCookie)

        return res.status(401).json({ message: 'An unexpected error occurred' })
    }

    const { email, username, name, avatar, likedProjects } = user
    const returnedUser = { email, username, name, avatar, likedProjects }
    return res.json(returnedUser)
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
    if (!user) return res.status(404).json({ message: 'not found' })

    const { username, name, avatar } = user
    const returnedUser = { username, name, avatar }
    return res.json(returnedUser)
}

export const getUserParamsHandler: RequestHandler<{ username: string }> =
    async (req, res) => {
        const user = await findUser(req.params)
        if (!user) return res.status(404).json({ message: 'not found' })
        const { username, name, avatar } = user
        const returnedUser = { username, name, avatar }
        return res.json(returnedUser)
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

    return res.status(200).json({ message: 'ok' })
}
