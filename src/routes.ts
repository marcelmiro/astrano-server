import { Router } from 'express'

import {
	handleAsync,
	validateResource,
	deserializeUser,
	requireUser,
	csrfIgnoreAll,
	parseMultiPartForm,
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
	getCurrentUserLikedProjectsHandler,
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
import {
	getProjectsSchema,
	getProjectSchema,
	createProjectSchema,
	deployProjectSchema,
} from './schemas/project.schema'
import {
	createProjectHandler,
	getProjectsHandler,
	getProjectHandler,
	likeProjectHandler,
	dislikeProjectHandler,
	getUndeployedProjectHandler,
	deployProjectHandler,
} from './controllers/project.controller'
import { ParseMultiPartFormParams } from './middleware/parseMultiPartForm'

const router = Router()

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
	'/users/me/liked-projects',
	requireUser,
	handleAsync(getCurrentUserLikedProjectsHandler)
)

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
	handleAsync(getProjectsHandler)
)

router.get(
	'/projects/deploy',
	requireUser,
	handleAsync(getUndeployedProjectHandler)
)

router.post(
	'/projects/deploy',
	requireUser,
	validateResource(deployProjectSchema),
	handleAsync(deployProjectHandler)
)

const postProjectMultiPartFormParams: ParseMultiPartFormParams = {
	fileFormat: 'logo',
	jsonField: 'data',
	allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
	maxSize: 1_024_000,
}

router.post(
	'/projects',
	requireUser,
	parseMultiPartForm(postProjectMultiPartFormParams),
	validateResource(createProjectSchema),
	handleAsync(createProjectHandler)
)

router.get(
	'/projects/:slug',
	validateResource(getProjectSchema),
	handleAsync(getProjectHandler)
)

router.put(
	'/projects/:slug/likes',
	requireUser,
	validateResource(getProjectSchema),
	handleAsync(likeProjectHandler)
)

router.delete(
	'/projects/:slug/likes',
	requireUser,
	validateResource(getProjectSchema),
	handleAsync(dislikeProjectHandler)
)

/*
	GET: /search?q=:text

    POST: /auth/forgot-password/:email

    GET: /projects/:slug/price
    POST: /projects/:slug/report

    GET: /admin/projects/pending
    POST: /admin/projects/pending/:slug/approve
    DELETE: /admin/projects/pending/:slug/approve
    GET: /admin/reports
*/

export default router
