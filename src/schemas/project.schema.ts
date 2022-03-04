import { object, string, array } from 'zod'
// import Big from 'big.js'

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
			.min(
				3,
				'Project name is too short - Should be 3 characters minimum'
			)
			.max(
				42,
				'Project name is too long - Should be 42 characters maximum'
			)
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
		/* website: string({ required_error: 'Website is required' }).url(
			'Website is not a valid URL'
		),
		socialUrls: array(
			object({
				name: string({
					required_error: 'At least 1 social name is empty',
				})
					.min(2, 'Social names must have at least 2 characters')
					.max(
						16,
						'Social names must not exceed 16 characters length'
					),
				url: string({
					required_error: 'At least 1 social URL is empty',
				}).url('At least 1 social URL is not a valid URL'),
			})
		).max(5, 'Project must have at most 5 social URLs'), */
		/* tokenName: string({ required_error: 'Token name is required' })
			.min(3, 'Token name is too short - Should be 3 characters minimum')
			.max(
				42,
				'Token name is too long - Should be 42 characters maximum'
			),
		tokenSymbol: string({ required_error: 'Token symbol is required' })
			.min(
				2,
				'Token symbol is too short - Should be 2 characters minimum'
			)
			.max(5, 'Token symbol is too long - Should be 5 characters maximum')
			.regex(
				/^[a-zA-Z0-9]+$/,
				'Token symbol should only contain alphanumeric characters'
			),
		tokenTotalSupply: string({
			required_error: 'Token total supply is required',
		})
			.min(3, 'Token total supply must be at least 100')
			.max(
				12,
				'Token total supply must not exceed 999,999,999,999 (999B)'
			)
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
					message: 'Token total supply must be an integer',
					path: ['tokenTotalSupply'],
				}
			), */
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

export const deployProjectSchema = object({
	body: object({
		tokenAddress: string({
			required_error: 'Token address is required',
		}).length(42, 'Token address is not a valid address'),
		crowdsaleAddress: string({
			required_error: 'Crowdsale address is required',
		}).length(42, 'Crowdsale address is not a valid address'),
		vestingWalletAddress: string({
			required_error: 'Vesting wallet address is required',
		}).length(42, 'Vesting wallet address is not a valid address'),
	}),
})
