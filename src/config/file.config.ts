import 'dotenv/config'
import S3 from 'aws-sdk/clients/s3'

import logger from '../utils/logger'

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

export async function connect() {
	try {
		await s3.headBucket({ Bucket: bucketName }).promise()
		logger.info('AWS S3 connected')
	} catch (e) {
		throw new Error('Could not connect to AWS S3 server')
	}
}

export default s3
