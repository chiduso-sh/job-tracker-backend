import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

// ─── Applications ─────────────────────────────────────────────────────────────

const StatusEnum = z.enum(['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'])

export const createApplicationSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  status: StatusEnum.optional(),
  appliedDate: z.coerce.date(),
  deadline: z.coerce.date().optional().nullable(),
  jobUrl: z.string().url().optional().nullable(),
  salary: z.string().max(100).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
})

export const updateApplicationSchema = createApplicationSchema.partial()

// ─── Notes ────────────────────────────────────────────────────────────────────

export const createNoteSchema = z.object({
  content: z.string().min(1).max(2000),
})
