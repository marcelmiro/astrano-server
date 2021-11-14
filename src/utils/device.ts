import { Request } from 'express'
import axios, { AxiosRequestConfig } from 'axios'
import uaParser from 'ua-parser-js'

import logger from './logger'
import { ILocation, IUserAgent } from '../models/session.model'

const axiosGeolocationConfig: AxiosRequestConfig = { timeout: 6000 }

const geolocationApi = (ip: string) => 'https://geolocation-db.com/json/' + ip

const getIpAddress = (req: Request): string => {
	logger.info({
		msg: 'getIpAddress',
		ip: {
			xRealIp: req.headers['x-real-ip'],
			nginxXRealIP: req.headers['X-Real-IP'],
			xForwardedFor: req.headers['x-forwarded-for'],
			socketRemoteAddress: req.socket.remoteAddress,
			connectionRemoteAddress: req.connection?.remoteAddress,
			ip: req.ip,
			ips: req.ips,
		},
	})

	const ip =
		req.headers['x-real-ip'] ||
		req.headers['x-forwarded-for'] ||
		req.socket.remoteAddress ||
		req.connection?.remoteAddress ||
		req.ip ||
		req.ips

	return Array.isArray(ip) ? ip[0] : ip
}

export const getReqLocation = async (
	req: Request
): Promise<Partial<ILocation>> => {
	try {
		const ipAddress = getIpAddress(req)

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
