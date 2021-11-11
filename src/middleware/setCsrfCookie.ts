import { RequestHandler } from 'express'

import { csrfTokenCookie, cookieDefaults } from '../config/csrf.config'

const setCsrfCookie: RequestHandler = (req, res, next) => {
    res.cookie(csrfTokenCookie, req.csrfToken(), cookieDefaults)
    next()
}

export default setCsrfCookie
