import { RequestHandler } from 'express'
import { AnyObject, ObjectId, Schema, SortValues } from 'mongoose'

import { findProjects, updateProject } from '../services/project.service'
import { findUser, updateUser } from '../services/user.service'

export const createProjectHandler: RequestHandler<unknown, unknown, unknown> =
	async (req, res) => {}

export const getProjectsHandler: RequestHandler<
	unknown,
	unknown,
	unknown,
	{ sort: string }
> = async (req, res) => {
	let sort: Record<string, SortValues> = {}

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

	/* eslint-disable @typescript-eslint/no-unused-vars */
	const { relationship, ...returnedProject } = project
	return res.status(200).json(returnedProject)
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
		await updateUser({ _id: userId }, { $push: { likedProjects: project._id } })
	} catch (e) {
		await updateProject({ _id: project._id }, { likes: project.likes }).catch(
			(e) => {}
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
		await updateUser({ _id: userId }, { $pull: { likedProjects: project._id } })
	} catch (e) {
		await updateProject({ _id: project._id }, { likes: project.likes }).catch(
			(e) => {}
		)
		throw e
	}

	return res.status(200).json({ success: true })
}
