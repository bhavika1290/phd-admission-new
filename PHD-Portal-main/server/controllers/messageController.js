import prisma from '../services/prismaClient.js'

export async function sendMessage(req, res) {
  const { applicationId, content } = req.body
  const senderId = req.user.id

  if (!applicationId || !content) {
    return res.status(400).json({ error: 'Application ID and content are required.' })
  }

  try {
    const message = await prisma.message.create({
      data: {
        applicationId,
        senderId,
        content,
      },
      include: {
        sender: { select: { name: true, email: true, role: true } }
      }
    })

    return res.status(201).json({ message })
  } catch (err) {
    console.error('Error sending message:', err)
    return res.status(500).json({ error: 'Failed to send message.' })
  }
}

export async function getMessages(req, res) {
  const { applicationId } = req.params
  
  try {
    const messages = await prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true, email: true, role: true } }
      }
    })

    return res.status(200).json({ messages })
  } catch (err) {
    console.error('Error fetching messages:', err)
    return res.status(500).json({ error: 'Failed to fetch messages.' })
  }
}
