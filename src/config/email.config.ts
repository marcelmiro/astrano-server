import { createTransport, SendMailOptions } from 'nodemailer'

import logger from '../utils/logger'

const mailUri = process.env.MAIL_URI
if (!mailUri) throw new Error('MAIL_URI environmental variable not found')
const fromAddress = process.env.MAIL_FROM_ADDRESS || 'noreply@astrano.io'

export const viewsDir = process.cwd() + '/src/views/'

export const defaultOptions: SendMailOptions = {
    from: fromAddress,
    subject: 'Astrano',
}

const transporter = createTransport(mailUri)

export async function connect() {
    try {
        await transporter.verify()
        logger.info('Nodemailer connected')
    } catch (e) {
        throw new Error('Could not connect to email server')
    }
}

export default transporter
