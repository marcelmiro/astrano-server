import pino, { P } from 'pino'

const options: P.LoggerOptions = {
	transport: { target: 'pino-pretty' },
	base: { pid: false },
	timestamp: () => `, "time": "${new Date().toISOString()}"`,
}

const logger = pino(options)

export default logger

export const finalLogger = pino(options, pino.destination(1))
