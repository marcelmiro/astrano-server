import { join as pathJoin } from 'path'
// import SES from 'aws-sdk/clients/ses'
import sgMail from '@sendgrid/mail'

import logger from '../utils/logger'

// Get SES config from env variables
/* export const region = process.env.AWS_REGION as string
if (!region) throw new Error('AWS_REGION environmental variable not found')
const creds = process.env.AWS_CREDS as string
if (!creds) throw new Error('AWS_CREDS environmental variable not found')

const splitCreds = creds.split(':')
const accessKeyId = splitCreds[0]
const secretAccessKey = splitCreds[1]

if (!accessKeyId || !secretAccessKey)
	throw new Error('AWS_CREDS environmental variable incorrect format')

const ses = new SES({ region, accessKeyId, secretAccessKey }) */

const apiKey = process.env.SENDGRID_API_KEY as string
if (!apiKey) throw new Error('SENDGRID_API_KEY environmental variable not found')

sgMail.setApiKey(apiKey)

const fromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@astrano.io'

export const viewsDir = pathJoin(__dirname, '../../views/')

export const defaultOptions: { from: string; subject?: string } = {
	from: fromAddress,
	subject: 'Astrano',
}

export async function connect() {
	try {
		// await ses.getAccountSendingEnabled().promise()
		logger.info('Email server connected')
	} catch (e) {
		throw new Error('Could not connect to email server')
	}
}

export default sgMail
