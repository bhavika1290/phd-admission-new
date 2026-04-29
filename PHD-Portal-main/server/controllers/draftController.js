import prisma from '../services/prismaClient.js'

// Save draft
export async function saveDraft(req, res) {
  try {
    const userId = req.user.id
    const { data } = req.body

    const draft = await prisma.applicationDraft.upsert({
      where: { user_id: userId },
      update: { 
        data: JSON.stringify(data),
        last_saved: new Date(),
      },
      create: {
        user_id: userId,
        data: JSON.stringify(data),
      },
    })

    res.json({ success: true, last_saved: draft.last_saved })
  } catch (error) {
    console.error('Error saving draft:', error)
    res.status(500).json({ error: 'Failed to save draft' })
  }
}

// Get draft
export async function getDraft(req, res) {
  try {
    const userId = req.user.id

    const draft = await prisma.applicationDraft.findUnique({
      where: { user_id: userId },
    })

    if (!draft) {
      return res.json({ draft: null })
    }

    res.json({ 
      draft: {
        ...draft,
        data: JSON.parse(draft.data),
      },
      last_saved: draft.last_saved,
    })
  } catch (error) {
    console.error('Error getting draft:', error)
    res.status(500).json({ error: 'Failed to get draft' })
  }
}

// Delete draft
export async function deleteDraft(req, res) {
  try {
    const userId = req.user.id

    await prisma.applicationDraft.delete({
      where: { user_id: userId },
    }).catch(() => {})

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting draft:', error)
    res.status(500).json({ error: 'Failed to delete draft' })
  }
}