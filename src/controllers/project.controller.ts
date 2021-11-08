import { RequestHandler } from 'express'
import { SortValues } from 'mongoose'

import { findProjects } from '../services/project.service'

export const getProjects: RequestHandler<
    unknown,
    unknown,
    unknown,
    { sort: string }
> = async (req, res) => {
    let sort: Record<string, SortValues> = {}

    if (req.query.sort === 'best') sort = { likes: -1, createdAt: -1 }
    else sort = { createdAt: -1, likes: -1 } // Default sort (created date then likes)

    const projects = await findProjects(undefined, sort)

    res.json(projects)
}

export const getProject: RequestHandler<{ slug: string }> = async (
    req,
    res
) => {
    const project = (await findProjects(req.params))[0]
    if (!project) return res.status(404).json({ message: 'not found' })

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { relationship, ...returnedProject } = project
    return res.json(returnedProject)
}
