import { Document, Schema, model, FlattenMaps, LeanDocument } from 'mongoose'
import { hash, compare } from 'bcrypt'

import { verificationTokenTtl } from '../config/auth.config'

export interface UserInput {
    email: string
    username: string
    name: string
    password: string
    passwordConfirmation: string
}

export interface UserDocument
    extends Omit<UserInput, 'passwordConfirmation'>,
        Document {
    confirmed: boolean
    logoUrl?: string
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
        name: { type: String, required: true, trim: true },
        password: { type: String, required: true, trim: true },
        confirmed: { type: Boolean, default: false },
        logoUrl: { type: String, trim: true },
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

    if (!user.isModified('password')) return next()

    user.password = await hash(user.password, salt)

    return next()
})

userSchema.methods.comparePassword = async function (
    candidatePassword: string
) {
    const user = this as UserDocument
    try {
        return await compare(candidatePassword, user.password)
    } catch (e) {
        return false
    }
}

const UserModel = model<UserDocument>('User', userSchema)

export default UserModel
