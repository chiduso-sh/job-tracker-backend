import cron from 'node-cron'
import prisma from './prisma.js'
import { sendDeadlineReminder } from './email.js'

export function startCronJobs() {
  // Run every day at 8:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cron] Running deadline reminder job...')

    try {
      const now = new Date()

      // Find reminders that are due and haven't been sent yet
      const reminders = await prisma.reminder.findMany({
        where: {
          sent: false,
          remindAt: { lte: now },
        },
        include: {
          application: {
            include: {
              user: { select: { email: true, name: true } },
            },
          },
        },
      })

      console.log(`[Cron] Found ${reminders.length} reminder(s) to send`)

      for (const reminder of reminders) {
        const { application } = reminder
        const { user } = application

        // Skip if application is already resolved
        if (['REJECTED', 'WITHDRAWN', 'OFFER'].includes(application.status)) {
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sent: true },
          })
          continue
        }

        try {
          await sendDeadlineReminder({
            to: user.email,
            name: user.name,
            company: application.company,
            role: application.role,
            deadline: application.deadline ?? reminder.remindAt,
            appId: application.id,
          })

          // Mark as sent
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: { sent: true },
          })

          console.log(`[Cron] Sent reminder to ${user.email} for ${application.company}`)
        } catch (emailErr) {
          console.error(`[Cron] Failed to send to ${user.email}:`, emailErr.message)
          // Don't mark as sent — retry next run
        }
      }

      // Also check for applications with deadlines in the next 3 days
      // that don't have a reminder yet — auto-create one
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

      const upcomingWithoutReminder = await prisma.application.findMany({
        where: {
          deadline: { gte: now, lte: threeDaysFromNow },
          status: { notIn: ['REJECTED', 'WITHDRAWN', 'OFFER'] },
          reminders: { none: {} },
        },
        include: {
          user: { select: { email: true, name: true } },
        },
      })

      for (const app of upcomingWithoutReminder) {
        // Create a reminder for now so it gets sent
        await prisma.reminder.create({
          data: {
            applicationId: app.id,
            remindAt: now,
            sent: false,
          },
        })
        console.log(`[Cron] Auto-created reminder for ${app.company} (${app.user.email})`)
      }

      console.log('[Cron] Deadline reminder job complete')
    } catch (err) {
      console.error('[Cron] Job failed:', err.message)
    }
  })

  console.log('[Cron] Scheduled: deadline reminders at 8:00 AM daily')
}
