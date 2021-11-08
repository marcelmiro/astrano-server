import {
    FilterQuery,
    UpdateQuery,
    FlattenMaps,
    LeanDocument,
    Types,
} from 'mongoose'

import {
    accessTokenTtl,
    RefreshTokenPayload,
    refreshTokenTtl,
    SessionPayloadNoType,
} from '../config/auth.config'
import SessionModel, { SessionDocument } from '../models/session.model'
import { findUser } from './user.service'
import { verifyJwt, signJwt } from '../utils/jwt'
import { validationError } from '../utils/error'

type Session = SessionDocument & { _id: string }

type FlatSession = FlattenMaps<LeanDocument<Session>>

type CreateSessionInput = Pick<
    Session,
    'user' | 'userAgent' | 'location' | 'expiresAt'
>

interface SaveSessionInput {
    session: Session
    refreshToken: string
}

export async function createSession(
    sessionInput: CreateSessionInput
): Promise<Session> {
    return new SessionModel(sessionInput)
}

export async function saveSession({
    session,
    refreshToken,
}: SaveSessionInput): Promise<FlatSession> {
    session.refreshToken = refreshToken
    return await session.save()
}

export async function findSessions({
    valid = true,
    ...query
}: FilterQuery<SessionDocument>): Promise<FlatSession[]> {
    // Check if id exists in query and if so validate id
    if (query._id && !Types.ObjectId.isValid(query._id)) {
        const error = {
            code: 'invalid format',
            message: 'Session id is not a valid object id',
            path: 'id',
        }
        validationError(error)
    }

    const findQuery = { ...query, valid }
    const sessions = await SessionModel.find(findQuery).lean()
    return sessions || []
}

async function updateSessions(
    query: FilterQuery<SessionDocument>,
    update: UpdateQuery<SessionDocument>,
    updateOne = true
) {
    return updateOne
        ? await SessionModel.updateOne(query, update)
        : await SessionModel.updateMany(query, update)
}

export async function deleteSessions(
    query: FilterQuery<SessionDocument>,
    deleteOne = true
) {
    return await updateSessions(query, { valid: false }, deleteOne)
}

export async function reIssueTokens(refreshToken: string): Promise<
    | {
          accessToken: string
          refreshToken: string
          decoded: SessionPayloadNoType
          session: FlatSession
      }
    | false
> {
    // Get token payload
    const { decoded } = await verifyJwt<RefreshTokenPayload>(refreshToken)
    if (!decoded?.sub || decoded.purpose !== 'rt') return false

    // Check if session found, is valid and is used by correct refresh token
    const session = await SessionModel.findById(decoded.sub).lean()
    if (!session || !session.valid || refreshToken !== session.refreshToken) {
        return false
    }

    // Safe check for user
    const user = await findUser({ _id: session.user })
    if (!user) return false

    // Create token payloads
    const sub = session._id.toString()
    const userId = user._id.toString()
    const accessPayload = { purpose: 'at', sub, user: userId } as const
    const refreshPayload = { purpose: 'rt', sub } as const

    // Calculate seconds left for old refresh token to expire
    // So that new refresh token expires at the same time that the old one would have done
    const refreshTokenExp = decoded.exp
    const refreshTokenExpiresIn = refreshTokenExp
        ? refreshTokenExp - Math.floor(Date.now() / 1000)
        : refreshTokenTtl

    // Generate new tokens
    const [newAccessToken, newRefreshToken] = await Promise.all([
        signJwt(accessPayload, { expiresIn: accessTokenTtl }),
        signJwt(refreshPayload, { expiresIn: refreshTokenExpiresIn }),
    ])

    // Update session with new refresh token
    await updateSessions(
        { _id: session._id },
        { refreshToken: newRefreshToken },
        true
    )

    const returnedObject = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        decoded: { sub, user: userId },
        session,
    }

    return returnedObject
}
