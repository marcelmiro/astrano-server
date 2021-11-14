import { Request } from 'express'
import axios, { AxiosRequestConfig } from 'axios'
import uaParser from 'ua-parser-js'

import logger from './logger'
import { ILocation, IUserAgent } from '../models/session.model'

const axiosGeolocationConfig: AxiosRequestConfig = { timeout: 6000 }

const geolocationApi = (ip: string) => 'https://geolocation-db.com/json/' + ip

const getIpAddress = (req: Request): string | undefined => {
	let ip: string | undefined
	const xForwardedFor = req.headers['x-forwarded-for']
	const xRealIp = req.headers['x-real-ip']

	if (xForwardedFor) {
		ip = Array.isArray(xForwardedFor)
			? xForwardedFor[0]
			: xForwardedFor.split(',')[0]
	} else if (xRealIp) {
		ip = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp.split(',')[0]
	}

	return ip
}

export const getReqLocation = async (
	req: Request
): Promise<Partial<ILocation>> => {
	try {
		const ipAddress = getIpAddress(req)
		if (!ipAddress) return {}

		const { data } = await axios.get(
			geolocationApi(ipAddress),
			axiosGeolocationConfig
		)

		// Get wanted properties
		const _location: Partial<ILocation> = {
			countryCode: data.country_code,
			countryName: data.country_name,
			city: data.city,
			state: data.state,
			postal: data.postal,
		}

		// Remove null properties or properties with string value 'Not found'
		const location = Object.fromEntries(
			Object.entries(_location).filter(([, v]) => v && v !== 'Not found')
		)

		return location
	} catch (e) {
		logger.error(e)
		return {}
	}
}

export const getUserAgent = (userAgent?: string): Partial<IUserAgent> => {
	if (!userAgent) return {}

	const data = uaParser(userAgent)

	const {
		browser: { name: browser },
		os: { name: os },
		device: { vendor: deviceVendor, model: deviceModel },
	} = data

	const device =
		[deviceVendor, deviceModel].filter(Boolean).join(' ') || undefined

	return { browser, os, device }
}
