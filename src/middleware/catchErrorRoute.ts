import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import logger from '../utils/logger'

const catchAllRoute: ErrorRequestHandler = (err, req, res, next) => {
	// Don't overwrite headers (express best practice)
	// https://expressjs.com/en/guide/error-handling.html#the-default-error-handler
	if (res.headersSent) return next(err)

	// Handle bad JSON format
	if (
		err instanceof SyntaxError &&
		/* eslint-disable @typescript-eslint/no-explicit-any */
		(err as any).status === 400 &&
		/* eslint-disable @typescript-eslint/no-explicit-any */
		(err as any).body
	) {
		return res.status(400).json({ message: 'Bad JSON format' })
	}

	// Handle CSRF missing error
	if (err.code === 'EBADCSRFTOKEN') {
		return res.status(401).json({ message: err.message })
	}

	// Handle validation error
	if (err.type === 'validation') {
		const error = {
			type: 'validation',
			errors: (err as ZodError).errors.map((issue) => {
				const { code, message, path: _path } = issue
				const path =
					_path.length > 1
						? _path[1] // _path.slice(1).join('.')
						: _path[0].toString()
				return { code, message, path }
			}),
		}
		return res.status(400).json(error)
	}

	// Handle MongoDB duplicate error
	if (err.code === 11000) {
		const path = Object.keys(err.keyValue)[0]
		const error = {
			type: 'conflict',
			errors: [
				{
					path,
					code: 'duplicate',
					message: `That ${path} is already taken - Please try another one`,
				},
			],
		}
		return res.status(409).json(error)
	}

	// Handle file errors
	if (err.name === 'MulterError') {
		// File too large
		if (err.code === 'LIMIT_FILE_SIZE') {
			const error = {
				type: 'file_size',
				errors: [
					{
						path: err.field,
						code: err.code,
						message: 'File sent is too large',
					},
				],
			}
			return res.status(413).json(error)
		}

		if (err.code === 'LIMIT_LOW_RES') {
			const error = {
				type: 'image_res',
				errors: [
					{
						path: err.field,
						code: err.code,
						message: err.message || 'Image resolution too low',
					},
				],
			}
			return res.status(400).json(error)
		}

		// Too many files
		if (err.code === 'LIMIT_FILE_COUNT') {
			const error = { message: 'Too many files sent' }
			return res.status(400).json(error)
		}

		// Unexpected file
		if (err.code === 'LIMIT_UNEXPECTED_FILE') {
			const error = { message: 'Unexpected file found' }
			return res.status(400).json(error)
		}
	}

	logger.error(err)
	const error = { message: 'An unexpected error occurred' }
	return res.status(err.status || err.statusCode || 500).json(error)
}

export default catchAllRoute
