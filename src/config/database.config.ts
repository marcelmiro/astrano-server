import { connect as mongooseConnect } from 'mongoose'

import logger from '../utils/logger'

export default async function connect() {
    if (!process.env.DB_URI)
        throw new Error('DB_URI environmental variable not found')

    try {
        await mongooseConnect(process.env.DB_URI)
        logger.info('Database connected')
    } catch (e) {
        throw new Error('Could not connect to database')
    }
}
