import { Router } from 'express'

import {
    handleAsync,
    validateResource,
    deserializeUser,
    requireUser,
    csrfIgnoreAll,
} from './middleware/index.middleware'
import {
    createUserSchema,
    getUserParamsSchema,
    getUserQuerySchema,
    verifyUserSchema,
} from './schemas/user.schema'
import {
    createUserHandler,
    getCurrentUserHandler,
    getUserParamsHandler,
    getUserQueryHandler,
    verifyUserHandler,
} from './controllers/user.controller'
import {
    createSessionSchema,
    getSessionSchema,
    deleteSessionSchema,
} from './schemas/session.schema'
import {
    createSessionHandler,
    deleteCurrentSessionHandler,
    getSessionsHandler,
    getSessionHandler,
    deleteSessionHandler,
} from './controllers/session.controller'
import { getProjectsSchema, getProjectSchema } from './schemas/project.schema'
import { getProjects, getProject } from './controllers/project.controller'

const router = Router()

router.get('/', (req, res) => res.status(200).json({ message: 'health check' }))

router.post(
    '/auth/signup',
    validateResource(createUserSchema),
    handleAsync(createUserHandler)
)

router.post(
    '/auth/login',
    validateResource(createSessionSchema),
    csrfIgnoreAll,
    deserializeUser,
    handleAsync(createSessionHandler)
)

router.post(
    '/auth/logout',
    deserializeUser,
    handleAsync(deleteCurrentSessionHandler)
)

router.get(
    '/auth/verify/:token',
    validateResource(verifyUserSchema),
    handleAsync(verifyUserHandler)
)

router.get('/users/me', requireUser, handleAsync(getCurrentUserHandler))

router.get(
    '/users',
    validateResource(getUserQuerySchema),
    handleAsync(getUserQueryHandler)
)

router.get(
    '/users/:username',
    validateResource(getUserParamsSchema),
    handleAsync(getUserParamsHandler)
)

router.get('/sessions', requireUser, handleAsync(getSessionsHandler))

router.get(
    '/sessions/:id',
    requireUser,
    validateResource(getSessionSchema),
    handleAsync(getSessionHandler)
)

router.delete(
    '/sessions/:id',
    requireUser,
    validateResource(deleteSessionSchema),
    handleAsync(deleteSessionHandler)
)

router.get(
    '/projects',
    validateResource(getProjectsSchema),
    handleAsync(getProjects)
)

router.get(
    '/projects/:slug',
    validateResource(getProjectSchema),
    handleAsync(getProject)
)

/*
    POST: /auth/forgot-password/:email
    POST: /auth/reverify/:email

    POST: /projects
    GET: /projects/:slug/price
    POST: /projects/:slug/likes
    DELETE: /projects/:slug/likes
    POST: /projects/:slug/report

    GET: /admin/projects/pending
    POST: /admin/projects/pending/:slug/approve
    DELETE: /admin/projects/pending/:slug/approve
    GET: /admin/reports
*/

export default router
