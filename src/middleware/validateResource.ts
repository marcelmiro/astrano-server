import { RequestHandler } from 'express'
import { AnyZodObject, ZodError } from 'zod'

const validate =
	(schema: AnyZodObject): RequestHandler =>
	async (req, _res, next) => {
		try {
			await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
			})
			next()
		} catch (e) {
			const error = {
				type: 'validation',
				errors: (e as ZodError).errors,
			}
			next(error)
		}
	}

export default validate
