import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
      return res.status(401).json({ error: message })
    }

    // Attach user to request so controllers can use req.user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
