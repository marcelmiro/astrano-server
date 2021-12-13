import {
	FlattenMaps,
	LeanDocument,
	FilterQuery,
	UpdateQuery,
	ObjectId,
	PipelineStage,
} from 'mongoose'

import ProjectModel, {
	ProjectInput,
	ProjectDocument,
} from '../models/project.model'

type Project = ProjectDocument & { _id: ObjectId }

type FlatProject = FlattenMaps<LeanDocument<Project>>

export async function createProject(input: ProjectInput) {
	const {
		tokenName,
		tokenSymbol,
		tokenSupply,
		tokenDecimals,
		tokenDistributionTax,
		...inputData
	} = input

	const projectData = {
		...inputData,
		token: {
			name: tokenName,
			symbol: tokenSymbol,
			totalSupply: tokenSupply,
			decimals: tokenDecimals,
			distributionTax: tokenDistributionTax,
			contractAddress: '0x3faf7e4fe6a1c30f78cc3a83755e33364bab77ed',
			blockchainExplorerUrl:
				'https://bscscan.com/token/0x3faf7e4fe6a1c30f78cc3a83755e33364bab77ed',
		},
		status: {
			name: 'ico',
			startsAt: '2021-12-16T18:15:45.158Z',
		},
		website: 'https://astrano.io',
		socialUrls: [
			{ name: 'instagram', url: 'https://www.instagram.com/astranocrypto/' },
			{ name: 'linkedin', url: 'https://www.linkedin.com/company/astrano' },
			{ name: 'twitter', url: 'https://twitter.com/astranocrypto' },
			{ name: 'reddit', url: 'https://www.reddit.com/r/Astrano/' },
		],
	}

	const _project = await ProjectModel.create(projectData)

	const project = _project.toJSON()

	/* eslint-disable @typescript-eslint/no-unused-vars */
	const { relationship, ...returnedProject } = project

	return returnedProject
}

export async function findProjects(
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
		},
	})

	pipeline.push({
		$set: {
			user: { $arrayElemAt: ['$user', 0] },
		},
	})

	if (sort) pipeline.push({ $sort: sort })

	const projects = await ProjectModel.aggregate(pipeline)

	return projects || []
}

export async function findLikedProjects(projects: ObjectId[]) {
	return await ProjectModel.find(
		{ _id: { $in: projects } },
		{ name: 1, slug: 1, logoUrl: 1 }
	)
}

export async function updateProject(
	query: FilterQuery<ProjectDocument>,
	update: UpdateQuery<Project>
) {
	return await ProjectModel.updateOne(query, update)
}
