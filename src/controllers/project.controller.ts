import { RequestHandler } from 'express'
import { ObjectId } from 'mongoose'

import {
	DeployProjectBody,
	ProjectInput,
	UndeployedProjectInput,
} from '../models/project.model'
import {
	createProject,
	deployProject,
	findProjects,
	findUndeployedProject,
	updateProject,
} from '../services/project.service'
import { findUser, updateUser } from '../services/user.service'
import { validationError } from '../utils/error'
import { uploadImage, UploadImageParams } from '../utils/file.util'

export const createProjectHandler: RequestHandler<
	unknown,
	unknown,
	ProjectInput
> = async (req, res) => {
	// Validate description min and max length
	// Not able to do it in schema with refine
	const descriptionLength = req.body.description.blocks
		.map(({ text }) => text)
		.join('').length

<<<<<<< HEAD
=======
	// TODO: Change min length to 200
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
	if (descriptionLength < 20)
		return validationError({
			code: 'too_small',
			message:
				'Project description is too short - Should be 20 characters minimum',
			path: 'description',
		})

	if (descriptionLength > 8000)
		return validationError({
			code: 'too_big',
			message:
				'Project description is too long - Should be 8000 characters maximum',
			path: 'description',
		})

	// Upload logo and get URL
	const file = req.file as Express.Multer.File

	const uploadLogoParams: UploadImageParams = {
		file,
		directory: 'projects',
		resolutions: [128],
	}

	const logoUri = await uploadImage(uploadLogoParams)

	// Set data object and upload project
	const {
		tokenName,
		tokenSymbol,
		tokenTotalSupply,
		tokenLockStartIn,
		tokenLockDuration,
		crowdsaleRate,
		crowdsaleCap,
		crowdsaleIndividualCap,
		crowdsaleMinPurchaseAmount,
		crowdsaleGoal,
		crowdsaleOpeningTime,
		crowdsaleClosingTime,
		liquidityPercentage,
		liquidityRate,
		liquidityLockStartIn,
		liquidityLockDuration,
		...restBody
	} = req.body

	const user = res.locals.user.id
	const expiresAt = new Date(Date.now() + 86400 * 1000) // 24h
	const input: UndeployedProjectInput = {
		...restBody,
		user,
		logoUri,
		expiresAt,
		token: {
			name: tokenName,
			symbol: tokenSymbol,
			totalSupply: tokenTotalSupply,
			lockStartIn: tokenLockStartIn,
			lockDuration: tokenLockDuration,
		},
		crowdsale: {
			rate: crowdsaleRate,
			cap: crowdsaleCap,
			individualCap: crowdsaleIndividualCap,
			minPurchaseAmount: crowdsaleMinPurchaseAmount,
			goal: crowdsaleGoal,
			openingTime: crowdsaleOpeningTime,
			closingTime: crowdsaleClosingTime,
		},
		liquidity: {
			percentage: liquidityPercentage,
			rate: liquidityRate,
			lockStartIn: liquidityLockStartIn,
			lockDuration: liquidityLockDuration,
		},
	}

	const project = await createProject(input)

	return res.status(201).json(project)
}

export const getProjectsHandler: RequestHandler<
	unknown,
	unknown,
	unknown,
	{ sort: string }
> = async (req, res) => {
	let sort: Record<string, 1 | -1> = {}

	if (req.query.sort === 'best') sort = { likes: -1, createdAt: -1 }
	else sort = { createdAt: -1, likes: -1 } // Default sort (created date then likes)

	const projects = await findProjects(undefined, sort)

	res.status(200).json(projects)
}

export const getProjectHandler: RequestHandler<{ slug: string }> = async (
	req,
	res
) => {
	const project = (await findProjects(req.params))[0]
	if (!project) return res.status(404).json({ message: 'Project not found' })
	return res.status(200).json(project)
}

export const getUndeployedProjectHandler: RequestHandler = async (
	_req,
	res
) => {
	const userId = res.locals.user.id
	const project = await findUndeployedProject({ user: userId })
	if (!project) return res.status(404).json({ message: 'Project not found' })
	return res.status(200).json(project)
}

export const deployProjectHandler: RequestHandler<
	unknown,
	unknown,
	DeployProjectBody
> = async (req, res) => {
	const userId = res.locals.user.id
	const project = await deployProject({ userId, ...req.body })
	if (!project) return res.status(404).json({ message: 'Project not found' })
	return res.status(200).json(project)
}

export const likeProjectHandler: RequestHandler<{ slug: string }> = async (
	req,
	res
) => {
	const userId = res.locals.user.id

	const project = (await findProjects(req.params))[0]
	if (!project) return res.status(404).json({ message: 'Project not found' })

	const user = await findUser({
		_id: userId,
		likedProjects: { $nin: [project._id as ObjectId] },
	})

	if (!user) {
		return res.status(422).json({ message: 'Request cannot be processed' })
	}

	try {
		await updateProject({ _id: project._id }, { $inc: { likes: 1 } })
		await updateUser(
			{ _id: userId },
			{ $push: { likedProjects: project._id } }
		)
	} catch (e) {
		await updateProject(
			{ _id: project._id },
			{ likes: project.likes }
		).catch(
			/* eslint-disable @typescript-eslint/no-empty-function */
			() => {}
		)
		throw e
	}

	return res.status(200).json({ success: true })
}

export const dislikeProjectHandler: RequestHandler = async (req, res) => {
	const userId = res.locals.user.id

	const project = (await findProjects(req.params))[0]
	if (!project) return res.status(404).json({ message: 'Project not found' })

	const user = await findUser({
		_id: userId,
		likedProjects: { $in: [project._id as ObjectId] },
	})

	if (!user) {
		return res.status(422).json({ message: 'Request cannot be processed' })
	}

	try {
		await updateProject({ _id: project._id }, { $inc: { likes: -1 } })
		await updateUser(
			{ _id: userId },
			{ $pull: { likedProjects: project._id } }
		)
	} catch (e) {
		await updateProject(
			{ _id: project._id },
			{ likes: project.likes }
		).catch(
			/* eslint-disable @typescript-eslint/no-empty-function */
			() => {}
		)
		throw e
	}

	return res.status(200).json({ success: true })
}
