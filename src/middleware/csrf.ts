import csurf from 'csurf'

import { csrfOptions } from '../config/csrf.config'
import setCsrfCookie from './setCsrfCookie'

// Default CSRF middleware
export default [csurf(csrfOptions()), setCsrfCookie]
