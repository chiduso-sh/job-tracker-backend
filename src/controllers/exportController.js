import prisma from '../lib/prisma.js'
import { STATUS_CONFIG } from '../lib/statusConfig.js'

// Simple status label map (server-side version of statusConfig)
const STATUS_LABELS = {
  APPLIED:   'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER:     'Offer',
  REJECTED:  'Rejected',
  WITHDRAWN: 'Withdrawn',
}

function escapeCSV(value) {
  if (value == null) return ''
  const str = String(value)
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(rows, headers) {
  const headerRow = headers.map(({ label }) => escapeCSV(label)).join(',')
  const dataRows = rows.map((row) =>
    headers.map(({ key }) => escapeCSV(row[key])).join(',')
  )
  return [headerRow, ...dataRows].join('\r\n')
}

// GET /api/applications/export
export const exportCSV = async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.id },
      orderBy: { appliedDate: 'desc' },
      include: { _count: { select: { notes: true } } },
    })

    const headers = [
      { label: 'Company',      key: 'company' },
      { label: 'Role',         key: 'role' },
      { label: 'Status',       key: 'status' },
      { label: 'Applied Date', key: 'appliedDate' },
      { label: 'Deadline',     key: 'deadline' },
      { label: 'Location',     key: 'location' },
      { label: 'Salary',       key: 'salary' },
      { label: 'Job URL',      key: 'jobUrl' },
      { label: 'Notes',        key: 'noteCount' },
    ]

    const rows = applications.map((app) => ({
      company:     app.company,
      role:        app.role,
      status:      STATUS_LABELS[app.status] ?? app.status,
      appliedDate: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '',
      deadline:    app.deadline    ? new Date(app.deadline).toLocaleDateString()    : '',
      location:    app.location ?? '',
      salary:      app.salary   ?? '',
      jobUrl:      app.jobUrl   ?? '',
      noteCount:   app._count.notes,
    }))

    const csv = toCSV(rows, headers)
    const filename = `job-applications-${new Date().toISOString().split('T')[0]}.csv`

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  } catch (err) {
    next(err)
  }
}
