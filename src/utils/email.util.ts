import { readFileSync } from 'fs'
import { render } from 'ejs'
import { SendEmailRequest } from 'aws-sdk/clients/ses'

import sgMail, { defaultOptions, viewsDir } from '../config/email.config'

const verificationView = readFileSync(
	viewsDir + 'email-verification.min.ejs',
	'utf-8'
)

const verificationTextView = readFileSync(
	viewsDir + 'email-verification-text.ejs',
	'utf-8'
)

interface SendMailOptions {
	from?: string
	to: string | string[]
	cc?: string | string[]
	bcc?: string | string[]
	replyTo?: string
	subject: string
}

type SendEmailInput = SendMailOptions &
	({ html: string; text?: string } | { text: string; html?: string })
type SendEmail = (options: SendEmailInput) => Promise<void>

// const CHARSET = 'UTF-8'

/* const generateEmailRequest = (options: SendEmailInput): SendEmailRequest => {
	const input = {
		...defaultOptions,
		...options,
	}

	const object: SendEmailRequest = {
		Source: input.from,
		Destination: {
			ToAddresses: [input.to].flat(),
			CcAddresses: input.cc ? [input.cc].flat() : undefined,
			BccAddresses: input.bcc ? [input.bcc].flat() : undefined,
		},
		ReplyToAddresses: input.replyTo ? [input.replyTo].flat() : undefined,
		Message: {
			Subject: {
				Charset: CHARSET,
				Data: input.subject,
			},
			Body: {},
		},
	}

	if (input.html)
		object.Message.Body.Html = {
			Charset: CHARSET,
			Data: input.html,
		}
	if (input.text)
		object.Message.Body.Text = {
			Charset: CHARSET,
			Data: input.text,
		}

	return object
} */

const sendEmail: SendEmail = async (options) => {
	try {
		// const mailOptions = generateEmailRequest(options)
		// await ses.sendEmail(mailOptions).promise()
		await sgMail.send({ ...defaultOptions, ...options })
	} catch (e) {
		console.log(e)
		throw e
	}
}

interface SendVerificationEmailInput {
	email: string
	username: string
	verifyUrl: string
}

export const sendVerificationEmail = async ({
	email,
	username,
	verifyUrl,
}: SendVerificationEmailInput) => {
	const renderData = { username, verifyUrl }

	const renderedView = render(verificationView, renderData)

	const renderedTextView = render(verificationTextView, renderData)

	const options = {
		to: email,
		subject: 'Welcome to Astrano! Verify Your Email',
		html: renderedView,
		text: renderedTextView,
	}

	await sendEmail(options)
}
