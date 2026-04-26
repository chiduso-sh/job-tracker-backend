import { ZodError } from 'zod'

export const errorHandler = (err, req, res, next) => {
  console.error(`[${req.method}] ${req.path} —`, err.message)

  // Zod validation error — bad request body
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation error',
      issues: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  // Prisma unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] ?? 'field'
    return res.status(409).json({ error: `${field} already in use` })
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' })
  }

  // Fallback
  const status = err.status ?? 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}
