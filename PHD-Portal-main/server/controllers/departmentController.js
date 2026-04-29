import prisma from '../services/prismaClient.js'

// Get all departments
export async function getDepartments(req, res) {
  try {
    const departments = await prisma.department.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    })

    res.json({ departments })
  } catch (error) {
    console.error('Error fetching departments:', error)
    res.status(500).json({ error: 'Failed to fetch departments' })
  }
}

// Get single department
export async function getDepartment(req, res) {
  try {
    const { id } = req.params

    const department = await prisma.department.findUnique({
      where: { id },
    })

    if (!department) {
      return res.status(404).json({ error: 'Department not found' })
    }

    res.json({ department })
  } catch (error) {
    console.error('Error fetching department:', error)
    res.status(500).json({ error: 'Failed to fetch department' })
  }
}

// Create department
export async function createDepartment(req, res) {
  try {
    const { name, code, description } = req.body

    const department = await prisma.department.create({
      data: { name, code, description: description || null },
    })

    res.json({ department })
  } catch (error) {
    console.error('Error creating department:', error)
    res.status(500).json({ error: 'Failed to create department' })
  }
}

// Update department
export async function updateDepartment(req, res) {
  try {
    const { id } = req.params
    const { name, code, description, is_active } = req.body

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(is_active !== undefined && { is_active }),
      },
    })

    res.json({ department })
  } catch (error) {
    console.error('Error updating department:', error)
    res.status(500).json({ error: 'Failed to update department' })
  }
}

// Delete department
export async function deleteDepartment(req, res) {
  try {
    const { id } = req.params

    // Check if department has applications
    const appCount = await prisma.application.count({
      where: { department_id: id },
    })

    if (appCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department with existing applications' 
      })
    }

    await prisma.department.delete({ where: { id } })

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting department:', error)
    res.status(500).json({ error: 'Failed to delete department' })
  }
}