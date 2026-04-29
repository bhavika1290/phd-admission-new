import prisma from '../services/prismaClient.js'

// Create audit log
export async function createAuditLog(userId, action, entityType, entityId, details, ipAddress) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details ? JSON.stringify(details) : null,
        ip_address: ipAddress,
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}

// Get audit logs (admin)
export async function getAuditLogs(req, res) {
  try {
    const { userId, action, entityType, from, to, page = 1, limit = 50 } = req.query

    const where = {}
    if (userId) where.user_id = userId
    if (action) where.action = action
    if (entityType) where.entity_type = entityType
    if (from || to) {
      where.created_at = {}
      if (from) where.created_at.gte = new Date(from)
      if (to) where.created_at.lte = new Date(to)
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.auditLog.count({ where }),
    ])

    res.json({ 
      logs, 
      total, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / parseInt(limit)) 
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
}

// Get audit logs for specific entity
export async function getEntityAuditLogs(req, res) {
  try {
    const { entityType, entityId } = req.params

    const logs = await prisma.auditLog.findMany({
      where: { entity_type: entityType, entity_id: entityId },
      orderBy: { created_at: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    })

    res.json({ logs })
  } catch (error) {
    console.error('Error fetching entity audit logs:', error)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
}