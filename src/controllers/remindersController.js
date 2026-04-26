import prisma from '../lib/prisma.js'
import { z } from 'zod'

const createReminderSchema = z.object({
  remindAt: z.coerce.date(),
})

// POST /api/applications/:id/reminders
export const createReminder = async (req, res, next) => {
  try {
    const { remindAt } = createReminderSchema.parse(req.body)

    const application = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const reminder = await prisma.reminder.create({
      data: { applicationId: req.params.id, remindAt },
    })

    res.status(201).json({ reminder })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/reminders/:reminderId
export const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: req.params.reminderId,
        application: { userId: req.user.id },
      },
    })

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' })
    }

    await prisma.reminder.delete({ where: { id: req.params.reminderId } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
