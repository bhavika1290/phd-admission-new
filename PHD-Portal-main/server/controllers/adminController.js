import prisma from '../services/prismaClient.js'
import { sendOtpEmail } from '../services/emailService.js'

// Update application status
export async function updateApplicationStatus(req, res) {
  const { applicationId } = req.params
  const { status } = req.body

  console.log(`Received status update request. AppID: ${applicationId}, New Status: ${status}`)
  
  if (!['pending', 'shortlisted', 'waitlisted', 'rejected', 'selected'].includes(status)) {
    console.error(`Status validation failed: invalid status "${status}"`)
    return res.status(400).json({ error: 'Invalid status.' })
  }

  try {
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status, status_updated_at: new Date() },
    })
    console.log(`Successfully updated status for application ${applicationId}`)
    return res.status(200).json({
      message: 'Status updated successfully.',
      application,
    })
  } catch (err) {
    console.error('CRITICAL ERROR in updateApplicationStatus:', err)
    return res.status(500).json({ error: `Failed to update status. Details: ${err.message}` })
  }
}

// Get all email templates
export async function getEmailTemplates(req, res) {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { created_at: 'desc' },
    })
    return res.status(200).json({ templates })
  } catch (err) {
    console.error('Error fetching templates:', err)
    return res.status(500).json({ error: 'Failed to fetch templates.' })
  }
}

// Create email template
export async function createEmailTemplate(req, res) {
  const { name, subject, body } = req.body

  if (!name || !subject || !body) {
    return res.status(400).json({ error: 'Name, subject, and body are required.' })
  }

  try {
    const template = await prisma.emailTemplate.create({
      data: { name, subject, body },
    })

    return res.status(201).json({ message: 'Template created.', template })
  } catch (err) {
    console.error('Error creating template:', err)
    return res.status(500).json({ error: 'Failed to create template.' })
  }
}

// Update email template
export async function updateEmailTemplate(req, res) {
  const { templateId } = req.params
  const { name, subject, body } = req.body

  try {
    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: { name, subject, body },
    })

    return res.status(200).json({ message: 'Template updated.', template })
  } catch (err) {
    console.error('Error updating template:', err)
    return res.status(500).json({ error: 'Failed to update template.' })
  }
}

// Delete email template
export async function deleteEmailTemplate(req, res) {
  const { templateId } = req.params

  try {
    await prisma.emailTemplate.delete({
      where: { id: templateId },
    })

    return res.status(200).json({ message: 'Template deleted.' })
  } catch (err) {
    console.error('Error deleting template:', err)
    return res.status(500).json({ error: 'Failed to delete template.' })
  }
}

// Send bulk emails
export async function sendBulkEmail(req, res) {
  const { templateId, applicationIds } = req.body

  if (!templateId || !applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
    return res.status(400).json({ error: 'Template ID and application IDs are required.' })
  }

  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' })
    }

    const applications = await prisma.application.findMany({
      where: { id: { in: applicationIds } },
      include: { user: true },
    })

    if (applications.length === 0) {
      return res.status(404).json({ error: 'No applications found.' })
    }

    let successCount = 0
    const emailLogs = []

    for (const app of applications) {
      try {
        // Replace placeholders in template
        let emailBody = template.body
          .replace(/{name}/g, app.name || 'Applicant')
          .replace(/{email}/g, app.email || '')
          .replace(/{status}/g, app.status || 'pending')
          .replace(/{statusDate}/g, new Date().toLocaleDateString())

        let emailSubject = template.subject
          .replace(/{name}/g, app.name || 'Applicant')
          .replace(/{status}/g, app.status || 'pending')

        // Send email
        await sendOtpEmail({
          to: app.email,
          subject: emailSubject,
          body: emailBody,
          isEmailContent: true,
        })

        // Log email
        await prisma.emailLog.create({
          data: {
            application_id: app.id,
            recipient_email: app.email,
            subject: emailSubject,
            body: emailBody,
            status: 'sent',
            sent_at: new Date(),
          },
        })

        successCount++
      } catch (emailErr) {
        console.error(`Error sending email to ${app.email}:`, emailErr)

        // Log failed email
        await prisma.emailLog.create({
          data: {
            application_id: app.id,
            recipient_email: app.email,
            subject: template.subject,
            body: template.body,
            status: 'failed',
            error_message: emailErr.message,
          },
        })
      }
    }

    return res.status(200).json({
      message: `Emails sent to ${successCount} out of ${applications.length} applicant(s).`,
      successCount,
      totalCount: applications.length,
    })
  } catch (err) {
    console.error('Error sending bulk emails:', err)
    return res.status(500).json({ error: 'Failed to send bulk emails.' })
  }
}
