import csurf from 'csurf'

import { csrfOptions } from '../config/csrf.config'
import setCsrfCookie from './setCsrfCookie'

// Middleware to set CSRF cookie and not check if CSRF token exists in request
export default [csurf(csrfOptions(true)), setCsrfCookie]
