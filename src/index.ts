import 'dotenv/config'
import express from 'express'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import logger from './utils/logger'
import config from './config/index.config'
import corsOptions from './config/cors.config'
import routes from './routes'
import { catchErrorRoute, catchAllRoute } from './middleware/index.middleware'

const app = express()
const PORT: number = +(process.env.PORT || 8080)

app.use(compression())
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`)
    next()
})

config()
    .then(() => {
        app.use('/api', routes)
        app.use(catchErrorRoute)
        app.use(catchAllRoute)
        app.listen(PORT, () => {
            const message =
                process.env.NODE_ENV === 'production'
                    ? `Server running at port: ${PORT}`
                    : `Server running at: http://localhost:${PORT}/`
            logger.info(message)
        })
    })
    .catch((e) => {
        logger.error(e)
        process.exit(1)
    })