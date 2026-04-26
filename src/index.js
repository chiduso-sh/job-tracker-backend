import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRouter from './routes/auth.js'
import applicationsRouter from './routes/applications.js'
import { notesRouter, remindersRouter, dashboardRouter } from './routes/misc.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startCronJobs } from './lib/cron.js'

const app = express()

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth',         authRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/notes',        notesRouter)
app.use('/api/reminders',    remindersRouter)
app.use('/api/dashboard',    dashboardRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// Global error handler (must be last)
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV ?? 'development'}`)

  if (process.env.NODE_ENV !== 'test') {
    startCronJobs()
  }
})

export default app
