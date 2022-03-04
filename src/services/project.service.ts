import {
	FlattenMaps,
	LeanDocument,
	FilterQuery,
	UpdateQuery,
	ObjectId,
	PipelineStage,
} from 'mongoose'

import ProjectModel, {
	UndeployedProjectInput,
	ProjectDocument,
	UndeployedProjectModel,
	UndeployedProjectDocument,
	DeployProjectBody,
} from '../models/project.model'

type Project = ProjectDocument & { _id: ObjectId }

type FlatProject = FlattenMaps<LeanDocument<Project>>

type FlatUndeployedProject = FlattenMaps<
	LeanDocument<UndeployedProjectDocument>
>

export async function createProject(input: UndeployedProjectInput) {
	const _project = await UndeployedProjectModel.create(input)

	const project = _project.toJSON()

	return project
}

export async function findProjects(
<<<<<<< HEAD
	query?: FilterQuery<ProjectDocument>,
	sort?: Record<string, 1 | -1>
): Promise<FlatProject[]> {
	const aggregation: PipelineStage[] = [
		{
			$lookup: {
				from: 'users',
				as: 'user',
				let: { user: '$user' },
				pipeline: [
					{ $match: { $expr: { $eq: ['$$user', '$_id'] } } },
					{ $project: { _id: 0, username: 1, logoUri: 1 } },
				],
			},
=======
	query: FilterQuery<ProjectDocument> = {},
	sort?: Record<string, 1 | -1>
): Promise<FlatProject[]> {
	const pipeline: PipelineStage[] = []

	if (query) pipeline.push({ $match: query })

	pipeline.push({
		$lookup: {
			from: 'users',
			as: 'user',
			let: { user: '$user' },
			pipeline: [
				{ $match: { $expr: { $eq: ['$$user', '$_id'] } } },
				{ $project: { _id: 0, username: 1, logoUrl: 1 } },
			],
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
		},
	})

	pipeline.push({
		$set: {
			user: { $arrayElemAt: ['$user', 0] },
		},
<<<<<<< HEAD
	]

	if (query) aggregation.unshift({ $match: query })

	if (sort) aggregation.push({ $sort: sort })

	return await ProjectModel.aggregate(aggregation)
}
=======
	})

	if (sort) pipeline.push({ $sort: sort })

	const projects = await ProjectModel.aggregate(pipeline)
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9

export async function findUndeployedProject(
	query: FilterQuery<UndeployedProjectDocument>
): Promise<FlatUndeployedProject | null> {
	const project = await UndeployedProjectModel.findOne(query)
	return project ? project.toJSON() : null
}

export async function findLikedProjects(projects: ObjectId[]) {
	return await ProjectModel.find(
		{ _id: { $in: projects } },
		{ name: 1, slug: 1, logoUri: 1 }
	)
}

export async function updateProject(
	query: FilterQuery<ProjectDocument>,
	update: UpdateQuery<Project>
) {
	return await ProjectModel.updateOne(query, update)
}

export async function deployProject({
	userId,
	tokenAddress,
	crowdsaleAddress,
	vestingWalletAddress,
}: { userId: string } & DeployProjectBody): Promise<FlatProject | undefined> {
	const undeployedProject = await findUndeployedProject({ user: userId })
	if (!undeployedProject) return

	const projectInput = {
		...undeployedProject,
		token: {
			...undeployedProject.token,
			tokenAddress,
			vestingWalletAddress,
		},
		crowdsale: {
			...undeployedProject.crowdsale,
			crowdsaleAddress,
		},
	}

	const project = await ProjectModel.create(projectInput)
	await UndeployedProjectModel.deleteOne({ _id: undeployedProject._id })
	return project.toJSON()
}
