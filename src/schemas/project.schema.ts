import { object, string, array, number } from 'zod'
import Big from 'big.js'

export const getProjectsSchema = object({
	query: object({
		sort: string().optional(),
	}),
})

export const getProjectSchema = object({
	params: object({
		slug: string({ required_error: 'Project slug is required' }),
	}).strict(),
})

export const createProjectSchema = object({
	body: object({
		name: string({ required_error: 'Project name is required' })
			.min(3, 'Project name is too short - Should be 3 characters minimum')
			.max(42, 'Project name is too long - Should be 42 characters maximum')
			.regex(
				/^[a-zA-Z0-9 !@#$%&()?\-_.,]+$/,
				'Project name should only contain alphanumeric characters, spaces and symbols (!@#$%&()?-_.,)'
			),
		tags: array(
			string({ required_error: 'At least 1 project tag is empty' })
				.min(2, 'Project tags must have at least 2 characters')
				.max(16, 'Project tags must not exceed 16 characters length')
		)
			.nonempty({ message: 'Project must have at least 1 tag' })
			.max(10, 'Project must have at most 10 tags'),
		description: object({
			blocks: array(
				object({
					text: string(),
				})
			).nonempty('Project description is required'),
			entityMap: object({}),
		}),
		relationship: string({
			required_error: 'Project relationship is required',
		})
			.min(20, 'Relationship is too short - Should be 20 characters minimum')
			.max(400, 'Relationship is too long - Should be 400 characters maximum'),
		tokenName: string({ required_error: 'Token name is required' })
			.min(3, 'Token name is too short - Should be 3 characters minimum')
			.max(42, 'Token name is too long - Should be 42 characters maximum'),
		tokenSymbol: string({ required_error: 'Token symbol is required' })
			.min(2, 'Token symbol is too short - Should be 2 characters minimum')
			.max(5, 'Token symbol is too long - Should be 5 characters maximum')
			.regex(
				/^[a-zA-Z0-9]+$/,
				'Token symbol should only contain alphanumeric characters'
			),
		tokenSupply: string({ required_error: 'Token supply is required' })
			.min(3, 'Token supply must be at least 100')
			.max(12, 'Token supply must not exceed 999,999,999,999 (999B)')
			.refine(
				(value) => {
					if (value.includes('.')) return false
					try {
						Big(value)
						return true
					} catch (e) {
						return false
					}
				},
				{
					message: 'Token supply must be an integer',
					path: ['tokenSupply'],
				}
			),
		tokenDecimals: number({
			required_error: 'Token decimals is required',
			invalid_type_error: 'Token decimals must be a number',
		})
			.int('Token decimals must be an integer')
			.gte(8, 'Token decimals must be at least 8')
			.lte(21, 'Token decimals must not exceed 21'),
		tokenDistributionTax: number({
			required_error: 'Token distribution tax is required',
			invalid_type_error: 'Token distribution tax must be a number',
		})
			.gte(0, 'Token distribution tax must be at least 0%')
			.lte(5, 'Token distribution tax must not exceed 5%')
			.optional(),
		// website: string({ required_error: 'Website is required' }),
	}),
	file: object({
		fieldname: string().refine((value) => value === 'logo', {
			message: 'Logo is required',
			path: ['logo'],
		}),
		path: string().refine((value) => value, {
			message: 'Logo is required',
			path: ['logo'],
		}),
	})
		.optional()
		.refine((file) => file, {
			message: 'Logo is required',
			path: ['logo'],
		}),
})
