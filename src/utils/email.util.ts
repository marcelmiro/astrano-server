import { readFileSync } from 'fs'
import { render } from 'ejs'
import { SendMailOptions, SentMessageInfo } from 'nodemailer'

import transporter, { defaultOptions, viewsDir } from '../config/email.config'

const verificationView = readFileSync(
    viewsDir + 'email-verification.min.ejs',
    'utf-8'
)

const verificationTextView = readFileSync(
    viewsDir + 'email-verification-text.ejs',
    'utf-8'
)

type SendEmailInput = SendMailOptions & ({ html: string } | { text: string })
type SendEmail = (options: SendEmailInput) => Promise<SentMessageInfo>

const sendEmail: SendEmail = async (options) => {
    const mailOptions = { ...defaultOptions, ...options }
    return await transporter.sendMail(mailOptions)
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
