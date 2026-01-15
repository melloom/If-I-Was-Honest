import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

let transporter: nodemailer.Transporter | null = null

/**
 * Initialize email transporter
 * Supports different services based on environment variables
 */
function getTransporter() {
  if (transporter) {
    return transporter
  }

  // Use different email services based on environment
  const emailService = process.env.EMAIL_SERVICE || 'smtp'
  const emailFrom = process.env.EMAIL_FROM || 'noreply@example.com'

  if (emailService === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD, // Use app-specific password for Gmail
      },
    })
  } else if (emailService === 'sendgrid') {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  } else {
    // Generic SMTP service (e.g., AWS SES, custom SMTP)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    })
  }

  return transporter
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  baseUrl: string = process.env.NEXTAUTH_URL || 'http://localhost:3000'
) {
  const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`

  const html = `
    <h2>Verify Your Email</h2>
    <p>Thank you for signing up! Please verify your email address to complete registration.</p>
    <p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
    </p>
    <p>Or copy and paste this link:</p>
    <p><code>${verificationUrl}</code></p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create this account, please ignore this email.</p>
  `

  const text = `
Verify Your Email

Thank you for signing up! Please verify your email address to complete registration.

Click here: ${verificationUrl}

This link expires in 24 hours.

If you didn't create this account, please ignore this email.
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html,
    text,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl: string = process.env.NEXTAUTH_URL || 'http://localhost:3000'
) {
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`

  const html = `
    <h2>Reset Your Password</h2>
    <p>We received a request to reset your password. Click the link below to set a new password.</p>
    <p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
    </p>
    <p>Or copy and paste this link:</p>
    <p><code>${resetUrl}</code></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email or contact support.</p>
  `

  const text = `
Reset Your Password

We received a request to reset your password. Click the link below to set a new password.

${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, please ignore this email or contact support.
  `

  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
    text,
  })
}

/**
 * Send 2FA verification code
 */
export async function send2FAEmail(
  email: string,
  code: string
) {
  const html = `
    <h2>Your Two-Factor Authentication Code</h2>
    <p>Your 2FA code is:</p>
    <p style="font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 5px;">
      ${code}
    </p>
    <p>This code expires in 10 minutes.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `

  const text = `
Your Two-Factor Authentication Code

Your 2FA code is: ${code}

This code expires in 10 minutes.

If you didn't request this code, please ignore this email.
  `

  return sendEmail({
    to: email,
    subject: '2FA Verification Code',
    html,
    text,
  })
}

/**
 * Generic email sender
 */
export async function sendEmail(options: EmailOptions) {
  try {
    // In development, log the email instead of sending
    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_SERVICE === 'debug') {
      console.log('📧 [EMAIL DEBUG]', {
        to: options.to,
        subject: options.subject,
        html: options.html.substring(0, 100) + '...',
      })
      return { success: true, messageId: 'debug-mode' }
    }

    const transporter = getTransporter()
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html,
    })

    console.log(`✅ Email sent to ${options.to}`)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    throw error
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration() {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    console.log('✅ Email configuration is valid')
    return true
  } catch (error) {
    console.error('❌ Email configuration error:', error)
    return false
  }
}
