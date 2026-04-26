import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean slate
  await prisma.application.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      applications: {
        create: [
          {
            company: 'Google',
            role: 'Software Engineer',
            status: 'INTERVIEW',
            appliedDate: new Date('2024-01-15'),
            location: 'Remote',
            salary: '$120,000 - $150,000',
            jobUrl: 'https://careers.google.com',
            notes: {
              create: [{ content: 'Had first round — went well. Waiting on technical round.' }],
            },
          },
          {
            company: 'Stripe',
            role: 'Backend Engineer',
            status: 'APPLIED',
            appliedDate: new Date('2024-01-20'),
            location: 'San Francisco, CA',
            deadline: new Date('2024-02-20'),
          },
          {
            company: 'Vercel',
            role: 'Full Stack Engineer',
            status: 'SCREENING',
            appliedDate: new Date('2024-01-18'),
            location: 'Remote',
          },
          {
            company: 'Meta',
            role: 'Frontend Engineer',
            status: 'REJECTED',
            appliedDate: new Date('2024-01-10'),
            location: 'Menlo Park, CA',
          },
        ],
      },
    },
  })

  console.log(`Created user: ${user.email}`)
  console.log('Seed complete. Login with test@example.com / password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
