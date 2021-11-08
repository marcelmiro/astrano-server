import { Document, Schema, model } from 'mongoose'

import { UserDocument } from './user.model'

export interface SessionInput {
    email: string
    password: string
}

export interface IUserAgent {
    browser: string
    os: string
    device: string
}

export interface ILocation {
    countryCode: string
    countryName: string
    city: string
    state: string
    postal: string
}

export interface SessionDocument extends Document {
    user: UserDocument['_id']
    refreshToken: string
    valid: boolean
    userAgent: Partial<IUserAgent>
    location: Partial<ILocation>
    expiresAt?: Date
    createdAt: Date
    updatedAt: Date
}

const userAgentSchema = new Schema(
    {
        browser: { type: String, trim: true },
        os: { type: String, trim: true },
        device: { type: String, trim: true },
    },
    { _id: false }
)

const locationSchema = new Schema(
    {
        countryCode: { type: String, trim: true },
        countryName: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        postal: { type: String, trim: true },
    },
    { _id: false }
)

const sessionSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        refreshToken: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        valid: { type: Boolean, default: true },
        userAgent: userAgentSchema,
        location: locationSchema,
        expiresAt: { type: Date, expires: 0 },
    },
    { timestamps: true }
)

const SessionModel = model<SessionDocument>('Session', sessionSchema)

export default SessionModel
