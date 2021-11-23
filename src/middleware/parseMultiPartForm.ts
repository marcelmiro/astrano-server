import { RequestHandler } from 'express'
import multer, { Options as MulterOptions } from 'multer'
import { unlink } from 'fs/promises'

import logger from '../utils/logger'
import { tempDir, maxSize, FileType } from '../config/file.config'
import { validationError } from '../utils/error'

type File = Express.Multer.File

type FileFormat = string | [string, number?] | undefined

type FileCleanup = (
	files: File[] | { [fieldName: string]: File[] } | undefined
) => Promise<void>

type ParseMulter = (
	jsonField?: string,
	allowedTypes?: FileType[]
) => RequestHandler

export interface ParseMultiPartFormParams {
	fileFormat: FileFormat
	jsonField?: string
	allowedTypes?: FileType[]
	maxSize?: number
}

type ParseMultiPartForm = (params: ParseMultiPartFormParams) => RequestHandler[]

const defaultUploadParams = (fileSize?: number): MulterOptions => ({
	dest: tempDir || 'uploads/',
	limits: {
		fileSize: fileSize || maxSize || 512000,
		files: 4,
	},
})

const upload = (fileSize?: number) => multer(defaultUploadParams(fileSize))

const useMulterUpload = (fileFormat: FileFormat, fileSize?: number) => {
	const uploadFunc = upload(fileSize)
	if (typeof fileFormat === 'string') return uploadFunc.single(fileFormat)
	if (Array.isArray(fileFormat))
		return uploadFunc.array(fileFormat[0], fileFormat[1])
	return uploadFunc.any()
}

const fileCleanup: FileCleanup = async (files) => {
	if (!files) return

	const filePaths = Array.isArray(files)
		? files.map((file) => file.path)
		: Object.values(files)
				.map((fileArray) => fileArray.map((file) => file.path))
				.flat()

	if (!filePaths || filePaths.length === 0) return

	for (const path of filePaths) {
		try {
			if (path) await unlink(path)
		} catch (e) {
			logger.error(e)
		}
	}
}

const parseMulter: ParseMulter =
	(jsonField, allowedTypes) => (req, res, next) => {
		// Get request files as an array of files
		let _files = !!req.file && [req.file]
		if (!_files && req.files) {
			if (Array.isArray(req.files)) _files = req.files
			else Object.values(req.files).flat()
		}

		const files = _files || []

		// Cleanup files on route finish
		res.on('finish', async () =>
			fileCleanup(files).catch((e) => logger.error(e))
		)

		// Validate file type
		if (
			allowedTypes &&
			!files.every((file) => allowedTypes.includes(file.mimetype as FileType))
		) {
			const stringifiedAllowedTypes = allowedTypes.join(', ')
			return validationError({
				code: 'LIMIT_UNEXPECTED_FILE',
				message: `Only file formats (${stringifiedAllowedTypes}) are allowed`,
				path: files[0].fieldname,
			})
		}

		// If JSON data exists, parse it from string and override req.body to JSON
		if (jsonField) {
			let body: Record<string, unknown> | undefined
			const jsonData = req.body[jsonField]

			if (jsonData) {
				try {
					body = JSON.parse(jsonData)
				} catch (e) {}
			}

			if (body && typeof body === 'object' && !Array.isArray(body)) {
				req.body = body
			} else {
				const message = 'Bad request format'
				return res.status(400).json({ message })
			}
		}

		next()
	}

const parseMultiPartForm: ParseMultiPartForm = ({
	fileFormat,
	jsonField,
	allowedTypes,
	maxSize,
}) => [
	useMulterUpload(fileFormat, maxSize),
	parseMulter(jsonField, allowedTypes),
]

export default parseMultiPartForm
