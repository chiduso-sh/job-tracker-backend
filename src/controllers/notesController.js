import prisma from '../lib/prisma.js'
import { createNoteSchema } from '../lib/schemas.js'

// GET /api/applications/:id/notes
export const getNotes = async (req, res, next) => {
  try {
    // Verify the application belongs to the user
    const application = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const notes = await prisma.note.findMany({
      where: { applicationId: req.params.id },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ notes })
  } catch (err) {
    next(err)
  }
}

// POST /api/applications/:id/notes
export const createNote = async (req, res, next) => {
  try {
    const { content } = createNoteSchema.parse(req.body)

    const application = await prisma.application.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const note = await prisma.note.create({
      data: { content, applicationId: req.params.id },
    })

    res.status(201).json({ note })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/notes/:noteId
export const deleteNote = async (req, res, next) => {
  try {
    // Join through application to verify ownership
    const note = await prisma.note.findFirst({
      where: {
        id: req.params.noteId,
        application: { userId: req.user.id },
      },
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    await prisma.note.delete({ where: { id: req.params.noteId } })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
