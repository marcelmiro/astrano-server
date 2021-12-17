import { Document, Schema, model } from 'mongoose'
import slugify from 'slugify'

import { UserDocument } from './user.model'
import { validationError } from '../utils/error'

interface IToken {
	name: string
	symbol: string
	totalSupply: string
	decimals: number
	distributionTax: number
	contractAddress: string
	blockchainExplorerUrl: string
	price: string
}

interface IStatus {
	name: ['live', 'ico']
	startsAt?: Date
	endsAt?: Date
}

interface BaseProject {
	user: UserDocument['_id']
	name: string
	logoUrl: string
	tags: string[]
	description: {
		blocks: { text: string; [key: string]: unknown }[]
		entityMap: Record<string, unknown>
	}
	relationship: string
}

export interface ProjectInput extends BaseProject {
	tokenName: string
	tokenSymbol: string
	tokenSupply: string
	tokenDecimals: number
	tokenDistributionTax?: number
}

export interface ProjectDocument extends BaseProject, Document {
	slug: string
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
		symbol: { type: String, required: true, uppercase: true },
		totalSupply: { type: String, required: true },
		decimals: { type: Number, required: true },
		distributionTax: { type: Number, default: 0 },
		contractAddress: { type: String, required: true /* , unique: true */ }, // TODO: Remove unique comment
		blockchainExplorerUrl: {
			type: String,
			required: true /* , unique: true */, // TODO: Remove unique comment
		},
		price: { type: String, default: '0' },
	},
	{ _id: false, timestamps: false }
)

const statusSchema = new Schema(
	{
		name: { type: String, enum: ['live', 'ico'], required: true },
		startsAt: { type: Date },
		endsAt: { type: Date },
	},
	{ _id: false, timestamps: false }
)

const projectSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		name: { type: String, required: true, unique: true },
		slug: { type: String, unique: true },
		logoUrl: { type: String, required: true },
		tags: [{ type: String, required: true }],
		description: { blocks: [{ type: Object }], entityMap: { type: Object } },
		relationship: { type: String, required: true },
		token: { type: tokenSchema, required: true },
		status: { type: statusSchema, required: true },
		website: { type: String },
		socialUrls: { type: Array },
		likes: { type: Number, default: 0 },
	},
	{ timestamps: true }
)

const bannedSlugs = ['new']

projectSchema.pre('save', function (next) {
	const project = this as ProjectDocument

	// On name change
	if (project.isModified('name')) {
		const slug = slugify(project.name, {
			replacement: '-',
			lower: true,
			strict: true,
			trim: true,
		})

		// Throw error if slug is not allowed
		if (bannedSlugs.includes(slug)) {
			const error = {
				code: 'invalid value',
				message: 'That name cannot be used - Please use another one',
				path: ['name'],
			}
			validationError(error)
		}

		project.slug = slug
	}

	next()
})

const ProjectModel = model<ProjectDocument>('Project', projectSchema)

export default ProjectModel
