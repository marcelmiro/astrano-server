import { Document, Schema, model, LeanDocument } from 'mongoose'
import slugify from 'slugify'

import { UserDocument } from './user.model'
import { validationError } from '../utils/error'

interface IToken {
	name: string
	symbol: string
	totalSupply: string
	lockStartIn: string
	lockDuration: string
	tokenAddress: string
	vestingWalletAddress: string
}

interface ICrowdsale {
	rate: string
	cap: string
	individualCap: string
	minPurchaseAmount: string
	goal: string
	openingTime: string
	closingTime: string
	crowdsaleAddress: string
}

interface ILiquidity {
	percentage: number
	rate: string
	lockStartIn: string
	lockDuration: string
}

interface BaseProject {
	user: UserDocument['_id']
	name: string
	logoUri: string
	tags: string[]
	description: {
		blocks: { text: string; [key: string]: unknown }[]
		entityMap: Record<string, unknown>
	}
	// website: string
	// socialUrls: Array<{ name: string; url: string }>
}

export interface ProjectInput extends BaseProject {
	tokenName: string
	tokenSymbol: string
	tokenTotalSupply: string
	tokenLockStartIn: string
	tokenLockDuration: string
	crowdsaleRate: string
	crowdsaleCap: string
	crowdsaleIndividualCap: string
	crowdsaleMinPurchaseAmount: string
	crowdsaleGoal: string
	crowdsaleOpeningTime: string
	crowdsaleClosingTime: string
	liquidityPercentage: number
	liquidityRate: string
	liquidityLockStartIn: string
	liquidityLockDuration: string
}

export interface ProjectDocument extends BaseProject, Document {
	slug: string
	logoUri: string
	token: IToken
	crowdsale: ICrowdsale
	liquidity: ILiquidity
	status: 'crowdsale' | 'live'
	likes: number
	createdAt: Date
	updatedAt: Date
}

export interface UndeployedProjectDocument
	extends Omit<ProjectDocument, 'token' | 'crowdsale' | 'status' | 'likes'> {
	token: Omit<IToken, 'tokenAddress' | 'vestingWalletAddress'>
	crowdsale: Omit<ICrowdsale, 'crowdsaleAddress'>
	expiresAt?: Date
}

export type UndeployedProjectInput = Omit<
	LeanDocument<UndeployedProjectDocument>,
	'slug' | 'createdAt' | 'updatedAt'
>

export interface DeployProjectBody {
	tokenAddress: string
	crowdsaleAddress: string
	vestingWalletAddress: string
}

const projectSchema = new Schema(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		name: { type: String, required: true, unique: true, trim: true },
		slug: { type: String, required: true, unique: true },
		logoUri: { type: String, required: true },
		tags: [{ type: String, required: true, trim: true }],
		description: {
			blocks: [{ type: Object }],
			entityMap: { type: Object },
		},
		// website: { type: String },
		// socialUrls: { type: Array },
		token: {
			name: { type: String, required: true, trim: true },
			symbol: {
				type: String,
				required: true,
				uppercase: true,
				trim: true,
			},
			totalSupply: { type: String, required: true },
			lockStartIn: { type: String, required: true },
			lockDuration: { type: String, required: true },
			tokenAddress: { type: String, required: true, unique: true },
			vestingWalletAddress: {
				type: String,
				required: true,
				unique: true,
			},
		},
		crowdsale: {
			rate: { type: String, required: true },
			cap: { type: String, required: true },
			individualCap: { type: String, required: true },
			minPurchaseAmount: { type: String, required: true },
			goal: { type: String, required: true },
			openingTime: { type: String, required: true },
			closingTime: { type: String, required: true },
			crowdsaleAddress: { type: String, required: true, unique: true },
		},
		liquidity: {
			percentage: { type: Number, required: true, max: 100, min: 50 },
			rate: { type: String, required: true },
			lockStartIn: { type: String, required: true },
			lockDuration: { type: String, required: true },
		},
		status: {
			type: String,
			enum: ['crowdsale', 'live'],
			required: true,
			default: 'crowdsale',
		},
		likes: { type: Number, default: 0 },
	},
	{ timestamps: true }
)

const undeployedProjectSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		name: { type: String, required: true, unique: true, trim: true },
		slug: { type: String, unique: true },
		logoUri: { type: String, required: true },
		tags: [{ type: String, required: true, trim: true }],
		description: {
			blocks: [{ type: Object }],
			entityMap: { type: Object },
		},
		// website: { type: String },
		// socialUrls: { type: Array },
		token: {
			name: { type: String, required: true, trim: true },
			symbol: {
				type: String,
				required: true,
				uppercase: true,
				trim: true,
			},
			totalSupply: { type: String, required: true },
			lockStartIn: { type: String, required: true },
			lockDuration: { type: String, required: true },
		},
		crowdsale: {
			rate: { type: String, required: true },
			cap: { type: String, required: true },
			individualCap: { type: String, required: true },
			minPurchaseAmount: { type: String, required: true },
			goal: { type: String, required: true },
			openingTime: { type: String, required: true },
			closingTime: { type: String, required: true },
		},
		liquidity: {
			percentage: { type: Number, required: true, max: 100, min: 50 },
			rate: { type: String, required: true },
			lockStartIn: { type: String, required: true },
			lockDuration: { type: String, required: true },
		},
		expiresAt: { type: Date, expires: 0 },
	},
	{ timestamps: true }
)

const bannedSlugs = ['new', 'deploy']

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

undeployedProjectSchema.pre('save', async function (next) {
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

		// TODO
		const projects = await ProjectModel.find({ slug })

		if (projects?.length > 0) {
			const error = {
				code: 'invalid value',
				message: 'That name is taken - Please use another one',
				path: ['name'],
			}
			validationError(error)
		}

		project.slug = slug
	}

	next()
})

const ProjectModel = model<ProjectDocument>('Project', projectSchema)

export const UndeployedProjectModel = model<UndeployedProjectDocument>(
	'UndeployedProject',
	undeployedProjectSchema
)

export default ProjectModel
