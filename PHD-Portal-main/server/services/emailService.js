import nodemailer from 'nodemailer'
import '../config/env.js'

function isPlaceholderEnvValue(value) {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  return (
    normalized.includes('your_') ||
    normalized.includes('example') ||
    normalized.includes('placeholder') ||
    normalized.includes('<')
  )
}

export const demoMailMode = isPlaceholderEnvValue(process.env.GMAIL_USER) || isPlaceholderEnvValue(process.env.GMAIL_APP_PASSWORD)

const transporter = nodemailer.createTransport(
  demoMailMode
    ? { jsonTransport: true }
    : {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      }
)

async function sendMail(mailOptions) {
  const result = await transporter.sendMail(mailOptions)

  if (demoMailMode) {
    console.log(`DEV EMAIL -> ${mailOptions.to} | ${mailOptions.subject}`)
  }

  return result
}

export async function sendBulkEmail({ to, subject, body }) {
  const result = await sendMail({
    from: `"PhD Portal Admissions" <${process.env.GMAIL_USER || 'no-reply@localhost'}>`,
    to,
    subject,
    html: body,
  })
  return { result, demoMailMode }
}

export async function sendOtpEmail({ to, otp, expiryMinutes, subject: customSubject }) {
  const subject = customSubject || 'Your PhD Portal Login Code'
  const text = `Your login code is: ${otp}. It will expire in ${expiryMinutes} minutes.`
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #6366f1;">PhD Admission Portal - IIT Ropar</h2>
      <p>You requested a login code for the IIT Ropar PhD Admission Portal.</p>
      <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #64748b;">This code will expire in ${expiryMinutes} minutes.</p>
    </div>
  `

  const result = await sendMail({
    from: `"PhD Portal Admissions" <${process.env.GMAIL_USER || 'no-reply@localhost'}>`,
    to,
    subject,
    text,
    html,
  })

  return { result, demoMailMode }
}

export async function sendSubmissionNotificationEmails({
  studentEmail,
  studentName,
  applicationId,
  researchPref1,
  eligibilityStatus,
  adminEmails = [],
}) {
  const cleanedAdmins = [...new Set(adminEmails.filter(Boolean))]
  const submissionLabel = `Application ${applicationId}`

  const studentMail = sendMail({
    from: `"PhD Portal Admissions" <${process.env.GMAIL_USER || 'no-reply@localhost'}>`,
    to: studentEmail,
    subject: 'Application Submitted Successfully',
    text: `Hello ${studentName || 'Applicant'}, your application has been received. Research preference: ${researchPref1 || 'N/A'}. Eligibility status: ${eligibilityStatus}.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #4f46e5;">Application Submitted</h2>
        <p>Dear ${studentName || 'Applicant'},</p>
        <p>Your PhD admission application has been received successfully.</p>
        <p><strong>Research Preference:</strong> ${researchPref1 || 'N/A'}</p>
        <p><strong>Eligibility Status:</strong> ${eligibilityStatus}</p>
        <p><strong>Reference:</strong> ${submissionLabel}</p>
      </div>
    `,
  })

  const adminMails = cleanedAdmins.map((adminEmail) =>
    sendMail({
      from: `"PhD Portal Admissions" <${process.env.GMAIL_USER || 'no-reply@localhost'}>`,
      to: adminEmail,
      subject: `New Application - ${studentName || studentEmail}`,
      text: `New Application received from ${studentName || studentEmail}. Eligibility: ${eligibilityStatus}.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #4f46e5;">New Application</h2>
          <p>A new application has been submitted.</p>
          <p><strong>Applicant:</strong> ${studentName || studentEmail}</p>
          <p><strong>Eligibility:</strong> ${eligibilityStatus}</p>
          <p><strong>Reference:</strong> ${submissionLabel}</p>
        </div>
      `,
    })
  )

  const results = await Promise.allSettled([studentMail, ...adminMails])

  return {
    results,
    adminCount: cleanedAdmins.length,
    demoMailMode,
  }
}

export async function sendFinalConfirmationEmail({
  studentEmail,
  studentName,
  transactionId,
  paymentDate,
}) {
  const subject = 'PhD Application - Final Submission Confirmed'
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #10b981;">Submission Confirmed</h2>
      <p>Dear ${studentName || 'Applicant'},</p>
      <p>Thank you for your payment and final submission.</p>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; margin: 20px 0; border: 1px solid #d1fae5;">
        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
        <p style="margin: 5px 0;"><strong>Payment Date:</strong> ${paymentDate}</p>
      </div>
      <p>Your application is now under review by the admission committee.</p>
      <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
        Reference: ${studentEmail}
      </p>
    </div>
  `
  return sendMail({
    from: `"PhD Portal Admissions" <${process.env.GMAIL_USER || 'no-reply@localhost'}>`,
    to: studentEmail,
    subject,
    html,
  })
}
