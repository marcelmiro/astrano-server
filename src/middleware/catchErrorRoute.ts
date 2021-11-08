import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import logger from '../utils/logger'

const catchAllRoute: ErrorRequestHandler = (err, req, res, next) => {
    // Don't overwrite headers (express best practice)
    // https://expressjs.com/en/guide/error-handling.html#the-default-error-handler
    if (res.headersSent) return next(err)

    // Handle CSRF missing error
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(401).json({ message: err.message })
    }

    // Handle validation error
    if (err.type === 'validation') {
        const error = {
            type: 'validation',
            errors: (err as ZodError).errors.map((issue) => {
                const { code, message, path: _path } = issue
                const path =
                    _path.length > 1
                        ? _path.slice(1).join('.')
                        : _path[0].toString()
                return { code, message, path }
            }),
        }
        return res.status(400).json(error)
    }

    // Handle MongoDB duplicate error
    if (err.code === 11000) {
        const path = Object.keys(err.keyValue)[0]
        const error = {
            type: 'conflict',
            errors: [
                {
                    path,
                    code: 'duplicate',
                    message: `That ${path} is already taken - Please try another one`,
                },
            ],
        }
        return res.status(409).json(error)
    }

    logger.error(err)
    const error = { message: err.message || 'An unexpected error occurred' }
    return res.status(err.status || err.statusCode || 500).json(error)
}

export default catchAllRoute
