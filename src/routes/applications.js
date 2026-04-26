import { Router } from 'express'
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applicationsController.js'
import { getNotes, createNote } from '../controllers/notesController.js'
import { createReminder } from '../controllers/remindersController.js'
import { exportCSV } from '../controllers/exportController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All application routes require auth
router.use(authenticate)

router.get('/export', exportCSV)   // must be before /:id
router.get('/', getApplications)
router.post('/', createApplication)
router.get('/:id', getApplication)
router.patch('/:id', updateApplication)
router.delete('/:id', deleteApplication)

// Notes nested under applications
router.get('/:id/notes', getNotes)
router.post('/:id/notes', createNote)

// Reminders nested under applications
router.post('/:id/reminders', createReminder)

export default router
