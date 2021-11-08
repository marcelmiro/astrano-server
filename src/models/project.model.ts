import { Document, Schema, model } from 'mongoose'
import slugify from 'slugify'

import { UserDocument } from './user.model'

export interface ProjectInput {
    name: string
    logoFile: File
    tags: string[]
    summary?: string
    /* eslint-disable @typescript-eslint/no-explicit-any */
    description?: Record<string, any>
    relationship: string
    token: Omit<IToken, 'contractAddress'>
}

interface IToken {
    name: string
    symbol: string
    totalSupply: string
    decimals: number
    distributionTax: number
    contractAddress: string
    price: string
}

interface IStatus {
    name: ['live', 'ico']
    startsAt?: Date
    endsAt?: Date
}

export interface ProjectDocument
    extends Omit<ProjectInput, 'logoFile'>,
        Document {
    user: UserDocument['_id']
    slug: string
    logoUri: string
    token: IToken
    status: IStatus
    website?: string
    socialUrls: Array<{ name: string; url: string }>
    likes: number
    statusEndDate?: Date
    createdAt: Date
    updatedAt: Date
}

const tokenSchema = new Schema(
    {
        name: { type: String, required: true },
        symbol: { type: String, required: true },
        totalSupply: { type: String, required: true },
        decimals: { type: Number, required: true },
        distributionTax: { type: Number, required: true },
        contractAddress: { type: String, required: true, unique: true },
        price: { type: String, default: '0' },
    },
    { _id: false, timestamps: false }
)

const statusSchema = new Schema(
    {
        name: { type: String, enum: ['live', 'ico'], required: true },
        startsAt: { type: Date, default: Date.now },
        endsAt: { type: Date, default: Date.now },
    },
    { _id: false, timestamps: false }
)

const projectSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        logoUri: { type: String, required: true },
        tags: [{ type: String }],
        summary: { type: String },
        description: { type: Object /* , required: true  */ },
        relationship: { type: String /* , required: true */ },
        token: { type: tokenSchema, required: true },
        status: { type: statusSchema, required: true },
        website: { type: String },
        socialUrls: { type: Array },
        likes: { type: Number, default: 0 },
    },
    { timestamps: true }
)

projectSchema.pre('save', function (next) {
    const project = this as ProjectDocument
    if (!project.isModified('name')) return next()

    const slug = slugify(project.name, {
        replacement: '-',
        lower: true,
        strict: true,
        trim: true,
    })

    project.slug = slug
    next()
})

const ProjectModel = model<ProjectDocument>('Project', projectSchema)

export default ProjectModel
