import prisma from '../services/prismaClient.js'
import crypto from 'crypto'

// Get all webhooks
export async function getWebhooks(req, res) {
  try {
    const webhooks = await prisma.webhook.findMany({
      orderBy: { created_at: 'desc' },
    })

    // Don't expose secrets
    const sanitized = webhooks.map(wh => ({
      ...wh,
      secret: wh.secret ? '••••••••' : null,
    }))

    res.json({ webhooks: sanitized })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    res.status(500).json({ error: 'Failed to fetch webhooks' })
  }
}

// Create webhook
export async function createWebhook(req, res) {
  try {
    const { name, url, events, secret } = req.body

    const webhook = await prisma.webhook.create({
      data: {
        name,
        url,
        events: events || [],
        secret: secret || crypto.randomBytes(32).toString('hex'),
      },
    })

    res.json({ webhook: { ...webhook, secret: '••••••••' } })
  } catch (error) {
    console.error('Error creating webhook:', error)
    res.status(500).json({ error: 'Failed to create webhook' })
  }
}

// Update webhook
export async function updateWebhook(req, res) {
  try {
    const { id } = req.params
    const { name, url, events, is_active, secret } = req.body

    const webhook = await prisma.webhook.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(url && { url }),
        ...(events && { events }),
        ...(is_active !== undefined && { is_active }),
        ...(secret && { secret }),
      },
    })

    res.json({ webhook: { ...webhook, secret: '••••••••' } })
  } catch (error) {
    console.error('Error updating webhook:', error)
    res.status(500).json({ error: 'Failed to update webhook' })
  }
}

// Delete webhook
export async function deleteWebhook(req, res) {
  try {
    const { id } = req.params

    await prisma.webhook.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    res.status(500).json({ error: 'Failed to delete webhook' })
  }
}

// Trigger webhook (internal)
export async function triggerWebhook(event, data) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { is_active: true },
    })

    const matching = webhooks.filter(wh => wh.events.includes(event))
    
    for (const webhook of matching) {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      }

      // Add signature if secret exists
      if (webhook.secret) {
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(payload))
          .digest('hex')
        payload.signature = signature
      }

      // In production, use a job queue for reliability
      fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.error('Webhook delivery failed:', err))
    }
  } catch (error) {
    console.error('Error triggering webhooks:', error)
  }
}