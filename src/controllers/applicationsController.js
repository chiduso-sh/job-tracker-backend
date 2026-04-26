import prisma from '../lib/prisma.js'
import { createApplicationSchema, updateApplicationSchema } from '../lib/schemas.js'

// GET /api/applications
export const getApplications = async (req, res, next) => {
  try {
    const { status, search, sort = 'createdAt', order = 'desc' } = req.query

    const where = {
      userId: req.user.id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { company: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const validSortFields = ['createdAt', 'appliedDate', 'company', 'role', 'status']
    const orderBy = {
      [validSortFields.includes(sort) ? sort : 'createdAt']: order === 'asc' ? 'asc' : 'desc',
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { notes: true } },
      },
    })

    res.json({ applications, count: applications.length })
  } catch (err) {
    next(err)
  }
}

// GET /api/applications/:id
export const getApplication = async (req, res, next) => {
  try {
    const application = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
        reminders: { orderBy: { remindAt: 'asc' } },
      },
    })

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    res.json({ application })
  } catch (err) {
    next(err)
  }
}

// POST /api/applications
export const createApplication = async (req, res, next) => {
  try {
    const data = createApplicationSchema.parse(req.body)

    const application = await prisma.application.create({
      data: { ...data, userId: req.user.id },
    })

    res.status(201).json({ application })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/applications/:id
export const updateApplication = async (req, res, next) => {
  try {
    const data = updateApplicationSchema.parse(req.body)

    // Confirm ownership before updating
    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data,
    })

    res.json({ application })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/applications/:id
export const deleteApplication = async (req, res, next) => {
  try {
    const existing = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Application not found' })
    }

    await prisma.application.delete({ where: { id: req.params.id } })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
