import { FlattenMaps, LeanDocument, FilterQuery, SortValues } from 'mongoose'

import ProjectModel, { ProjectDocument } from '../models/project.model'

type Project = ProjectDocument & { _id: string }

type FlatProject = FlattenMaps<LeanDocument<Project>>

export async function findProjects(
    query: FilterQuery<ProjectDocument> = {},
    sort?: Record<string, SortValues>
): Promise<FlatProject[]> {
    const aggregation = [
        query ? { $match: query } : undefined,
        {
            $lookup: {
                from: 'users',
                as: 'user',
                let: { user: '$user' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$$user', '$_id'] } } },
                    { $project: { _id: 0, username: 1, avatar: 1 } },
                ],
            },
        },
        {
            $set: {
                user: { $arrayElemAt: ['$user', 0] },
            },
        },
        sort ? { $sort: sort } : undefined,
    ]

    const projects = await ProjectModel.aggregate(aggregation.filter(Boolean))

    return projects || []
}
