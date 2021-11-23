import 'dotenv/config'
import S3 from 'aws-sdk/clients/s3'
import { readdir, unlink } from 'fs/promises'

import logger from '../utils/logger'

const _tempDir = process.env.FILE_TEMP_DIR
export const tempDir = _tempDir?.replace(/^\/*/, '').replace(/\/*$/, '/')

const _maxSize = process.env.FILE_MAX_SIZE
export const maxSize = !!_maxSize && parseInt(_maxSize)

// Get S3 config from file URI
const fileUri = process.env.FILE_URI
if (!fileUri) throw new Error('FILE_URI environmental variable not found')

let data = fileUri.split('://')
export const region = data[0]
data = data[1].split('@')
export const bucketName = data[0]
data = data[1].split(':')
export const accessKey = data[0]
export const secretKey = data[1]

if (!region || !bucketName || !accessKey || !secretKey)
	throw new Error('FILE_URI environmental variable incorrect format')

const s3 = new S3({
	region,
	accessKeyId: accessKey,
	secretAccessKey: secretKey,
})

async function cleanTempDir() {
	if (!tempDir) return
	try {
		const files = await readdir(tempDir)
		for (const file of files) {
			if (file && typeof file === 'string') {
				try {
					await unlink(tempDir + file)
				} catch (e) {
					logger.error(e)
				}
			}
		}
	} catch (e) {
		logger.error(e)
	}
}

// Test S3 connection and clean file directory on startup
export async function connect() {
	try {
		await s3.headBucket({ Bucket: bucketName }).promise()
		await cleanTempDir()
		logger.info('File server connected')
	} catch (e) {
		throw new Error('Could not connect to file server')
	}
}

export default s3

export type FileType =
	| 'application/gzip'
	| 'application/json'
	| 'application/msword'
	| 'application/octet-stream'
	| 'application/ogg'
	| 'application/pdf'
	| 'application/rtf'
	| 'application/vnd.ms-excel'
	| 'application/vnd.ms-powerpoint'
	| 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
	| 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	| 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	| 'application/vnd.rar'
	| 'application/x-7z-compressed'
	| 'application/x-bzip'
	| 'application/x-bzip2'
	| 'application/x-tar'
	| 'application/xhtml+xml'
	| 'application/xml'
	| 'application/zip'
	| 'audio/aac'
	| 'audio/mpeg'
	| 'audio/ogg'
	| 'audio/opus'
	| 'audio/wav'
	| 'audio/webm'
	| 'font/otf'
	| 'font/ttf'
	| 'font/woff'
	| 'font/woff2'
	| 'image/bmp'
	| 'image/gif'
	| 'image/jpeg'
	| 'image/png'
	| 'image/svg+xml'
	| 'image/tiff'
	| 'image/vnd.microsoft.icon'
	| 'image/webp'
	| 'text/css'
	| 'text/csv'
	| 'text/html'
	| 'text/javascript'
	| 'text/plain'
	| 'video/mp2t'
	| 'video/mp4'
	| 'video/mpeg'
	| 'video/ogg'
	| 'video/webm'
	| 'video/x-msvideo'
