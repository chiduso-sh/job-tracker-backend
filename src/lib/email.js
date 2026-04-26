import nodemailer from 'nodemailer'

// Create transporter once, reuse across the app
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Verify connection on startup (only in production)
if (process.env.NODE_ENV === 'production') {
  transporter.verify((err) => {
    if (err) console.error('[Email] SMTP connection failed:', err.message)
    else console.log('[Email] SMTP ready')
  })
}

// ─── Templates ────────────────────────────────────────────────────────────────

function deadlineReminderHtml({ name, company, role, deadline, appId, clientUrl }) {
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  const dateStr = new Date(deadline).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const urgency = days <= 1 ? '🚨' : days <= 3 ? '⚠️' : '📅'
  const appUrl = `${clientUrl}/applications/${appId}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#4f46e5;padding:24px 32px;">
      <p style="margin:0;color:#c7d2fe;font-size:13px;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;">JobTracker</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:20px;font-weight:600;">
        ${urgency} Deadline reminder
      </h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="margin:0 0 16px;color:#374151;font-size:15px;">
        Hi ${name ?? 'there'},
      </p>
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
        You have an application deadline coming up:
      </p>
      <div style="background:#f3f4f6;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-weight:600;color:#111827;font-size:15px;">${role}</p>
        <p style="margin:0 0 10px;color:#6b7280;font-size:14px;">${company}</p>
        <p style="margin:0;color:#4f46e5;font-size:13px;font-weight:500;">
          Due: ${dateStr}
          ${days === 0 ? ' — Today!' : days === 1 ? ' — Tomorrow!' : ` — ${days} days`}
        </p>
      </div>
      <a href="${appUrl}"
         style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:500;">
        View application →
      </a>
      <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;">
        You're receiving this because you have deadline reminders enabled in JobTracker.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

// ─── Send functions ────────────────────────────────────────────────────────────

export async function sendDeadlineReminder({ to, name, company, role, deadline, appId }) {
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))

  const subject =
    days <= 0
      ? `🚨 Overdue: ${role} at ${company}`
      : days === 1
      ? `⚠️ Tomorrow: ${role} at ${company}`
      : `📅 Reminder: ${role} at ${company} — ${days} days left`

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html: deadlineReminderHtml({ name, company, role, deadline, appId, clientUrl }),
  })
}
