import { Document, Schema, model, LeanDocument } from 'mongoose'
import slugify from 'slugify'

import { UserDocument } from './user.model'
import { validationError } from '../utils/error'

interface IToken {
	name: string
	symbol: string
	totalSupply: string
<<<<<<< HEAD
	lockStartIn: string
	lockDuration: string
	tokenAddress: string
	vestingWalletAddress: string
=======
	decimals: number
	distributionTax: number
	contractAddress: string
	blockchainExplorerUrl: string
	marketUrl?: string
	price: string
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
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
<<<<<<< HEAD
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
=======
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
		marketUrl: { type: String /* , unique: true */ }, // TODO: Remove unique comment
		price: { type: String, default: '0' },
	},
	{ _id: false, timestamps: false }
)

const statusSchema = new Schema(
	{
		name: { type: String, enum: ['live', 'ico'], required: true },
		startsAt: { type: Date },
		endsAt: { type: Date },
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
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
<<<<<<< HEAD
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
=======
		logoUrl: { type: String, required: true },
		tags: [{ type: String, required: true }],
		description: { blocks: [{ type: Object }], entityMap: { type: Object } },
		relationship: { type: String, required: true },
		token: { type: tokenSchema, required: true },
		status: { type: statusSchema, required: true },
		website: { type: String },
		socialUrls: { type: Array },
		likes: { type: Number, default: 0 },
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
	},
	{ timestamps: true }
)

<<<<<<< HEAD
const bannedSlugs = ['new', 'deploy']
=======
const bannedSlugs = ['new']
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9

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

<<<<<<< HEAD
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
		const projectSlug = await ProjectModel.find({ slug })

		if (projectSlug) {
			const error = {
				code: 'invalid value',
				message: 'That name is taken - Please use another one',
				path: ['name'],
			}
			validationError(error)
		}

		project.slug = slug
	}

=======
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
	next()
})

const ProjectModel = model<ProjectDocument>('Project', projectSchema)

export const UndeployedProjectModel = model<UndeployedProjectDocument>(
	'UndeployedProject',
	undeployedProjectSchema
)

export default ProjectModel
