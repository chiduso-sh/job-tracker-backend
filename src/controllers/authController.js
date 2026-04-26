import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { registerSchema, loginSchema } from '../lib/schemas.js'

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  })

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    const token = signToken(user.id)

    res.status(201).json({ token, user })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })

    // Compare against hash — run even if user not found to prevent timing attacks
    const dummyHash = '$2a$12$dummyhashusedtopreventimingtimingattacks'
    const passwordMatch = await bcrypt.compare(password, user?.passwordHash ?? dummyHash)

    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user.id)

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me  (protected)
export const me = async (req, res) => {
  // req.user is attached by auth middleware
  res.json({ user: req.user })
}
