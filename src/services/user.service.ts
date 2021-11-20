import { FilterQuery, UpdateQuery } from 'mongoose'

import UserModel, {
	UserInput,
	UserDocument,
	FlatUser,
} from '../models/user.model'
import { originUrl } from '../config/index.config'
import {
	verificationTokenTtl,
	verificationHashLength,
} from '../config/auth.config'
import { signJwt, verifyJwt } from '../utils/jwt'
import { sendVerificationEmail } from '../utils/email.util'
import { generateAndUploadAvatar } from '../utils/file.util'

type UserNoPassword = Omit<FlatUser, 'password'>

const verificationUrl = (token: string) => `${originUrl}/u/verify/${token}`

export async function createUser(input: UserInput) {
	const _user = await UserModel.create(input)

	const user = _user.toJSON()

	// Send verification email
	try {
		await createVerification(user)
	} catch (e) {
		/* eslint-disable @typescript-eslint/no-empty-function */
		await UserModel.deleteOne({ _id: user._id }).catch(() => {})
		throw new Error('An unexpected error occurred')
	}

	const returnedUser = {
		email: user.email,
		username: user.username,
		name: user.name,
	}

	return returnedUser
}

export async function validatePassword(
	email: string,
	password: string
): Promise<UserNoPassword | false> {
	const user = await UserModel.findOne({ email })
	if (!user) return false

	const isValid = await user.comparePassword(password)
	if (!isValid) return false

	/* eslint-disable @typescript-eslint/no-unused-vars */
	const { password: _password, ...returnedUser } = user.toJSON()
	return returnedUser
}

export async function findUser(
	query: FilterQuery<UserDocument>
): Promise<UserNoPassword | null> {
	const userQuery = { ...query, confirmed: true }

	const user = await UserModel.findOne(userQuery).lean()
	if (!user) return null

	/* eslint-disable @typescript-eslint/no-unused-vars */
	const { password, ...returnedUser } = user
	return returnedUser
}

export async function updateUser(
	query: FilterQuery<UserDocument>,
	update: UpdateQuery<UserDocument>
) {
	return await UserModel.updateOne(query, update)
}

async function createVerification(user: FlatUser) {
	const payload = {
		id: user._id.toString(),
		hash: user.password.slice(-verificationHashLength),
	}
	const token = await signJwt(payload, { expiresIn: verificationTokenTtl })

	const emailOptions = {
		email: user.email,
		username: user.username,
		verifyUrl: verificationUrl(token),
	}

	await sendVerificationEmail(emailOptions)
}

interface VerificationPayload {
	id: string
	hash: string
}

export async function verifyUser(token: string): Promise<boolean> {
	const { decoded } = await verifyJwt<VerificationPayload>(token)

	// JWT verification failed
	if (!decoded) return false

	// Get user, check if user is already confirmed and compare hash with password
	const user = await UserModel.findById(decoded.id)

	if (!user || user.confirmed || !user.password.endsWith(decoded.hash)) {
		return false
	}

	// Generate and upload avatar and update user with logo URL
	const logoUrl = await generateAndUploadAvatar()

	// Update user to confirmed
	await updateUser({ _id: decoded.id }, { confirmed: true, logoUrl })

	return true
}
