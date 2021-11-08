import { RequestHandler } from 'express'

import { csrfTokenCookie } from '../config/csrf.config'

const setCsrfCookie: RequestHandler = (req, res, next) => {
    res.cookie(csrfTokenCookie, req.csrfToken())
    next()
}

export default setCsrfCookie
