<<<<<<< HEAD
# Job Tracker — Backend (Week 1)

Express + Prisma + PostgreSQL REST API with JWT authentication.

## Project structure

```
src/
  index.js                      ← Express app entry point
  lib/
    prisma.js                   ← Prisma client singleton
    schemas.js                  ← Zod validation schemas
  middleware/
    auth.js                     ← JWT verification middleware
    errorHandler.js             ← Global error handler
  routes/
    auth.js                     ← /api/auth/*
    applications.js             ← /api/applications/*
    misc.js                     ← /api/notes/*, /api/dashboard/*
  controllers/
    authController.js
    applicationsController.js
    notesController.js
    dashboardController.js
prisma/
  schema.prisma                 ← Database schema
  seed.js                       ← Test data
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your database URL and a JWT secret (any long random string).

### 3. Create the database
```bash
# Make sure PostgreSQL is running, then:
createdb job_tracker
```

### 4. Run migrations
```bash
npm run db:migrate
# Enter a migration name when prompted e.g. "init"
```

### 5. Generate Prisma client
```bash
npm run db:generate
```

### 6. (Optional) Seed test data
```bash
npm run db:seed
# Creates test@example.com / password123 with 4 sample applications
```

### 7. Start the dev server
```bash
npm run dev
```

Server runs at `http://localhost:5000`

## API reference

### Auth
| Method | Route | Auth | Body |
|--------|-------|------|------|
| POST | /api/auth/register | No | `{ email, password, name? }` |
| POST | /api/auth/login | No | `{ email, password }` |
| GET | /api/auth/me | Yes | — |

### Applications
| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| GET | /api/applications | Yes | `?status=INTERVIEW&search=google&sort=appliedDate&order=desc` |
| POST | /api/applications | Yes | See schema below |
| GET | /api/applications/:id | Yes | Includes notes + reminders |
| PATCH | /api/applications/:id | Yes | Any subset of fields |
| DELETE | /api/applications/:id | Yes | — |

### Notes
| Method | Route | Auth |
|--------|-------|------|
| GET | /api/applications/:id/notes | Yes |
| POST | /api/applications/:id/notes | Yes |
| DELETE | /api/notes/:noteId | Yes |

### Dashboard
| Method | Route | Auth |
|--------|-------|------|
| GET | /api/dashboard/stats | Yes |

## Application status values
`APPLIED` | `SCREENING` | `INTERVIEW` | `OFFER` | `REJECTED` | `WITHDRAWN`

## Auth header format
```
Authorization: Bearer <your-jwt-token>
```

## Example requests (Postman / curl)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123","name":"Your Name"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"password123"}'
```

### Create application (use token from login)
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Stripe",
    "role": "Backend Engineer",
    "appliedDate": "2024-01-20",
    "status": "APPLIED",
    "location": "Remote"
  }'
```
=======
# Job-Tracker
job tcker
>>>>>>> 77fb3a0fd459d0a0608c34f0456f382362507542
