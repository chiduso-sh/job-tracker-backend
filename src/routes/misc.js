import { Router } from 'express'
import { deleteNote } from '../controllers/notesController.js'
import { deleteReminder } from '../controllers/remindersController.js'
import { getStats } from '../controllers/dashboardController.js'
import { authenticate } from '../middleware/auth.js'

// Standalone note deletion
export const notesRouter = Router()
notesRouter.use(authenticate)
notesRouter.delete('/:noteId', deleteNote)

// Standalone reminder deletion
export const remindersRouter = Router()
remindersRouter.use(authenticate)
remindersRouter.delete('/:reminderId', deleteReminder)

// Dashboard
export const dashboardRouter = Router()
dashboardRouter.use(authenticate)
dashboardRouter.get('/stats', getStats)
