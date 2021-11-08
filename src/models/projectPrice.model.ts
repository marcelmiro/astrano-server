import { Document, Schema, model } from 'mongoose'

import { ProjectDocument } from './project.model'

interface ProjectPriceDocument extends Document {
    project: ProjectDocument['_id']
    price: string
    createdAt: Date
    updatedAt: Date
}

const projectPriceSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        price: { type: String, required: true, default: '-' },
    },
    { timestamps: true }
)

const ProjectPriceModel = model<ProjectPriceDocument>(
    'ProjectPrice',
    projectPriceSchema
)

export default ProjectPriceModel
