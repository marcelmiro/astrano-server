import logger from 'pino'

export default logger({
    transport: {
        target: 'pino-pretty',
    },
    base: {
        pid: false,
    },
    timestamp: () => `, "time": "${new Date().toISOString()}"`,
})