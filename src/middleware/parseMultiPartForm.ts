import { RequestHandler } from 'express'
import multer from 'multer'
import { unlink } from 'fs/promises'

import logger from '../utils/logger'

const _tempDir = process.env.FILE_TEMP_DIR
const tempDir = _tempDir?.replace(/^\/*/, '').replace(/\/*$/, '/')

const _maxSize = process.env.FILE_MAX_SIZE
const maxSize = !!_maxSize && parseInt(_maxSize)

const upload = multer({
	dest: tempDir || 'uploads/',
	limits: {
		fileSize: maxSize || 512000,
		files: 4,
	},
})

type FileFormat = string | [string, number?] | undefined

const useMulterUpload = (fileFormat: FileFormat) => {
	if (typeof fileFormat === 'string') return upload.single(fileFormat)
	if (Array.isArray(fileFormat))
		return upload.array(fileFormat[0], fileFormat[1])
	return upload.any()
}

type File = Express.Multer.File
type FileCleanup = (
	files: File[] | { [fieldName: string]: File[] } | undefined
) => Promise<void>

const fileCleanup: FileCleanup = async (files) => {
	if (!files) return

	const filePaths = Array.isArray(files)
		? files.map((file) => file.path)
		: Object.values(files)
				.map((fileArray) => fileArray.map((file) => file.path))
				.flat()

	if (!filePaths || filePaths.length === 0) return

	for (const path of filePaths) path && (await unlink(path))
}

const parseMultiPartForm =
	(jsonField?: string): RequestHandler =>
	(req, res, next) => {
		// Cleanup files on route finish
		res.on('finish', async () => {
			const files = req.file ? [req.file] : req.files
			fileCleanup(files).catch((e) => logger.error(e))
		})

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

export default (fileFormat?: FileFormat, jsonField?: string) => [
	useMulterUpload(fileFormat),
	parseMultiPartForm(jsonField),
]
