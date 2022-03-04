import { Document, Schema, model, FlattenMaps, LeanDocument } from 'mongoose'
import { hash, compare } from 'bcrypt'

import { verificationTokenTtl } from '../config/auth.config'

export interface UserInput {
	email: string
	username: string
<<<<<<< HEAD
=======
	name: string
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
	password: string
	passwordConfirmation: string
}

export interface UserDocument
	extends Omit<UserInput, 'passwordConfirmation'>,
		Document {
	confirmed: boolean
<<<<<<< HEAD
	logoUri?: string
=======
	logoUrl?: string
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
	likedProjects: Schema.Types.ObjectId[]
	expiresAt?: Date
	createdAt: Date
	updatedAt: Date
	comparePassword(candidatePassword: string): Promise<boolean>
}

export type FlatUser = FlattenMaps<
	LeanDocument<UserDocument & { _id: Schema.Types.ObjectId }>
>

const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
<<<<<<< HEAD
		password: { type: String, required: true, trim: true },
		confirmed: { type: Boolean, default: false },
		logoUri: { type: String, trim: true },
=======
		name: { type: String, required: true, trim: true },
		password: { type: String, required: true, trim: true },
		confirmed: { type: Boolean, default: false },
		logoUrl: { type: String, trim: true },
>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
		likedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
	},
	{ timestamps: true }
)

// Expire document if confirmed is false after 24 hours
userSchema.index(
	{ createdAt: 1 },
	{
		expireAfterSeconds: verificationTokenTtl,
		partialFilterExpression: { confirmed: false },
	}
)

const _salt = process.env.SALT_ROUNDS
const salt = (!!_salt && parseInt(_salt)) || 10

userSchema.pre('save', async function (next) {
	const user = this as UserDocument

	if (user.isModified('password'))
		user.password = await hash(user.password, salt)

	next()
})

userSchema.methods.comparePassword = async function (
	candidatePassword: string
) {
	const user = this as UserDocument
<<<<<<< HEAD
=======

>>>>>>> e990402a2c5a0ea5147943a1892667335d3a92b9
	try {
		return await compare(candidatePassword, user.password)
	} catch (e) {
		return false
	}
}

const UserModel = model<UserDocument>('User', userSchema)

export default UserModel
