import { RequestHandler } from 'express'

import csrf from './csrf'
import deserializeUser from './deserializeUser'

const requireUser: RequestHandler = async (req, res, next) => {
    // Check if user was forcefully logged out
    if (res.locals.revokedSession) {
        const message =
            'You have been detected as using an unknown device or location. ' +
            'Your session has been logged out to prevent unwanted access.'
        return res.status(401).json({ message })
    }

    // Check if user exists
    if (!res.locals.user) {
        return res.status(401).json({ message: 'Unauthorized user' })
    }

    next()
}

export default [...csrf, deserializeUser, requireUser]
