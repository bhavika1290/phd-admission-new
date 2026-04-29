import prisma from '../services/prismaClient.js'

// Get all email templates
export async function getEmailTemplates(req, res) {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    })

    res.json({ templates })
  } catch (error) {
    console.error('Error fetching email templates:', error)
    res.status(500).json({ error: 'Failed to fetch email templates' })
  }
}

// Get single template
export async function getEmailTemplate(req, res) {
  try {
    const { id } = req.params

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    res.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    res.status(500).json({ error: 'Failed to fetch template' })
  }
}

// Create email template
export async function createEmailTemplate(req, res) {
  try {
    const { name, subject, body, variables, is_active } = req.body

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        variables: variables || [],
        is_active: is_active !== false,
      },
    })

    res.json({ template })
  } catch (error) {
    console.error('Error creating template:', error)
    res.status(500).json({ error: 'Failed to create template' })
  }
}

// Update email template
export async function updateEmailTemplate(req, res) {
  try {
    const { id } = req.params
    const { name, subject, body, variables, is_active } = req.body

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(body && { body }),
        ...(variables && { variables }),
        ...(is_active !== undefined && { is_active }),
      },
    })

    res.json({ template })
  } catch (error) {
    console.error('Error updating template:', error)
    res.status(500).json({ error: 'Failed to update template' })
  }
}

// Delete email template
export async function deleteEmailTemplate(req, res) {
  try {
    const { id } = req.params

    await prisma.emailTemplate.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    res.status(500).json({ error: 'Failed to delete template' })
  }
}

// Preview template with variables
export async function previewEmailTemplate(req, res) {
  try {
    const { id } = req.params
    const { variables } = req.body

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }

    let subject = template.subject
    let body = template.body

    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g')
        subject = subject.replace(regex, value)
        body = body.replace(regex, value)
      })
    }

    res.json({ subject, body })
  } catch (error) {
    console.error('Error previewing template:', error)
    res.status(500).json({ error: 'Failed to preview template' })
  }
}