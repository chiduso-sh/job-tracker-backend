# Job Tracker — Backend

REST API for the Job Tracker application. Built with Node.js, Express, Prisma, and PostgreSQL.

**Live API → [job-tracker-production-7b5c.up.railway.app](https://job-tracker-production-7b5c.up.railway.app)**

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs) ![Express](https://img.shields.io/badge/Express-4-000000?logo=express) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169e1?logo=postgresql) ![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma)

---

## Features

- **JWT authentication** — register, login, protected routes
- **Full CRUD** — applications, notes, reminders
- **Dashboard stats** — counts by status, timeline data, upcoming deadlines
- **Email reminders** — daily cron job sends deadline alerts via Nodemailer + Gmail
- **CSV export** — download all applications as a spreadsheet
- **Zod validation** — all request bodies validated with schemas
- **Global error handling** — Prisma errors, Zod errors, and 404s handled cleanly

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Email | Nodemailer |
| Scheduler | node-cron |
| Deployment | Railway |

---

## API reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |

### Applications
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/applications` | Yes | List all — supports `?status=&search=&sort=&order=` |
| POST | `/api/applications` | Yes | Create application |
| GET | `/api/applications/:id` | Yes | Get single application |
| PATCH | `/api/applications/:id` | Yes | Update application |
| DELETE | `/api/applications/:id` | Yes | Delete application |
| GET | `/api/applications/export` | Yes | Download CSV |

### Notes
| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/applications/:id/notes` | Yes |
| POST | `/api/applications/:id/notes` | Yes |
| DELETE | `/api/notes/:noteId` | Yes |

### Dashboard
| Method | Route | Auth |
|--------|-------|------|
| GET | `/api/dashboard/stats` | Yes |

### Auth header
```
Authorization: Bearer <token>
```

---

## Database schema

```
User          — id, email, passwordHash, name
Application   — id, userId, company, role, status, appliedDate, deadline, jobUrl, salary, location
Note          — id, applicationId, content
Reminder      — id, applicationId, remindAt, sent
```

Status enum: `APPLIED | SCREENING | INTERVIEW | OFFER | REJECTED | WITHDRAWN`

---

## Related

- **Frontend repo** → [github.com/chiduso-sh/Job-Tracker](https://github.com/chiduso-sh/Job-Tracker)
- **Live app** → [job-tracker-beryl-nu.vercel.app](https://job-tracker-beryl-nu.vercel.app)
