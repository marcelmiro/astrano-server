import { createAvatar, Options as _AvatarOptions } from '@dicebear/avatars'
import * as identiconStyle from '@dicebear/avatars-identicon-sprites'
import { PutObjectRequest, ManagedUpload } from 'aws-sdk/clients/s3'
import sharp from 'sharp'
import { MulterError } from 'multer'
import { randomBytes } from 'crypto'
import { createReadStream } from 'fs'

import s3, { bucketName } from '../config/file.config'

type File = Express.Multer.File

function generateId(length = 16) {
	return new Promise<string>((resolve, reject) =>
		randomBytes(length, (err, raw) => {
			if (err) reject(err)
			else resolve(raw.toString('hex'))
		})
	)
}

const getFileUrl = (filePath: string) =>
	`https://cdn.astrano.io/${encodeURI(filePath)}`

const getFilePath = (fileName: string, directory?: string): string => {
	// Format directory if exists
	directory = directory
		?.replace(/^\/*/, '') // Remove initial slashes
		.replace(/\/*$/, '') // Remove final slashes
		.replace(/[/\\]+/, '/') // Replace more than 1 continuous slashes with a single slash

	return (directory ? directory + '/' : '') + fileName
}

interface UploadFileParams {
	buffer?: Buffer
	file?: File
	contentType?: string
	fileName?: string
	directory?: string
}

const uploadFile = async ({
	file,
	buffer,
	contentType,
	fileName,
	directory,
}: UploadFileParams): Promise<ManagedUpload.SendData> => {
	if (!buffer && !file) throw new Error('Buffer or file is required')

	const Body = buffer || createReadStream((file as File).path)

	if (!Body) throw new Error('Buffer or file path not found')

	if (!fileName) fileName = file?.filename || (await generateId())

	const Key = getFilePath(fileName, directory)

	const ContentType = contentType || file?.mimetype

	const uploadParams: PutObjectRequest = {
		Key,
		Body,
		ContentType,
		Bucket: bucketName,
	}

	return s3.upload(uploadParams).promise()
}

/* async function deleteFile(filePath: string): Promise<true> {
	if (!filePath) throw new Error('File path not found')

	const deleteParams: DeleteObjectRequest = {
		Bucket: bucketName,
		Key: filePath,
	}

	await s3.deleteObject(deleteParams).promise()

	return true
} */

export interface UploadImageParams {
	file: File
	directory?: string
	resolutions?: number[]
	minOriginalSize?: number
	maxOriginalSize?: number
}

export const uploadImage = async ({
	file,
	directory,
	resolutions,
	minOriginalSize = 128,
	maxOriginalSize = 512,
}: UploadImageParams): Promise<string> => {
	let sharpImage = sharp(file.path)
	const imageMetaData = await sharpImage.metadata()

	// Process original file
	const { width, height } = imageMetaData

	if (!width || !height) throw new MulterError('LIMIT_UNEXPECTED_FILE')

	let imageSize = width

	// Resize if image is not squared
	if (width !== height) {
		imageSize = Math.min(width, height)
		sharpImage = sharpImage.resize(imageSize, imageSize)
	}

	// Check if image size is too small
	if (imageSize < minOriginalSize) {
		const message = `Image resolution is too small - Should be at least ${minOriginalSize}px`
		throw {
			name: 'MulterError',
			code: 'LIMIT_LOW_RES',
			field: file.fieldname,
			message,
		}
	}

	// Resize if original image size is too big
	if (imageSize > maxOriginalSize) {
		imageSize = maxOriginalSize
		sharpImage = sharpImage.resize(imageSize, imageSize)
	}

	const uploads = []

	// Upload original file
	const fileName = file.filename
	const contentType = file.mimetype

	const uploadParams: UploadFileParams = {
		buffer: await sharpImage.toBuffer(),
		fileName,
		directory,
		contentType,
	}

	uploads.push(uploadFile(uploadParams))

	// Upload resizes
	if (resolutions) {
		resolutions = resolutions.filter((res) => res <= imageSize)

		for (const size of resolutions) {
			const fileDir = (directory ? directory + '/' : '') + `s${size}x${size}`
			const buffer = await sharpImage.resize(size, size).toBuffer()
			const uploadParams = { buffer, fileName, directory: fileDir, contentType }
			uploads.push(uploadFile(uploadParams))
		}
	}

	const uploadOutputs = await Promise.all(uploads)

	// Get image URLs
	const imageUrls = uploadOutputs.map((output) => getFileUrl(output.Key))

	// Return most wanted resized image URL (from resolutions array priority)
	// if exists, else original image URL
	return imageUrls[1] || imageUrls[0]
}

// export const deleteImage =  (fileName: string) => {}

type AvatarOptions = Partial<identiconStyle.Options & _AvatarOptions>

const baseAvatarOptions: AvatarOptions = {
	size: 32,
	scale: 80,
	backgroundColor: '#f0f0f0',
}

const avatarContentType = 'image/svg+xml'

function generateAvatar(seed: string, options?: AvatarOptions) {
	const avatarOptions = { ...baseAvatarOptions, ...options, seed }
	return createAvatar(identiconStyle, avatarOptions)
}

export async function generateAndUploadAvatar() {
	const id = await generateId(16)

	const avatar = generateAvatar(id)

	const buffer = Buffer.from(avatar)

	const uploadParams: UploadFileParams = {
		buffer,
		contentType: avatarContentType,
		fileName: id,
		directory: 'users',
	}

	const upload = await uploadFile(uploadParams)

	return getFileUrl(upload.Key)
}
