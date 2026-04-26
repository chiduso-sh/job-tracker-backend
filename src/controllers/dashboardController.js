import prisma from '../lib/prisma.js'

// GET /api/dashboard/stats
export const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Count by status in one query using groupBy
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    })

    const counts = {
      APPLIED: 0,
      SCREENING: 0,
      INTERVIEW: 0,
      OFFER: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    }

    for (const row of statusCounts) {
      counts[row.status] = row._count.status
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    // Last 6 months of applications for the timeline chart
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentApplications = await prisma.application.findMany({
      where: { userId, appliedDate: { gte: sixMonthsAgo } },
      select: { appliedDate: true, status: true },
      orderBy: { appliedDate: 'asc' },
    })

    // Upcoming deadlines in the next 14 days
    const now = new Date()
    const twoWeeks = new Date()
    twoWeeks.setDate(twoWeeks.getDate() + 14)

    const upcoming = await prisma.application.findMany({
      where: {
        userId,
        deadline: { gte: now, lte: twoWeeks },
        status: { notIn: ['REJECTED', 'WITHDRAWN'] },
      },
      select: { id: true, company: true, role: true, deadline: true },
      orderBy: { deadline: 'asc' },
    })

    res.json({
      counts,
      total,
      recentApplications,
      upcomingDeadlines: upcoming,
    })
  } catch (err) {
    next(err)
  }
}
