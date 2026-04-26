# Deployment Guide — Week 4

## Backend → Railway

1. Push backend to GitHub (create a repo, push the job-tracker-backend folder)

2. Go to https://railway.app and sign in with GitHub

3. Click "New Project" → "Deploy from GitHub repo" → select your repo

4. Railway auto-detects Node.js and runs `npm start`

5. Add a PostgreSQL database:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets DATABASE_URL in your environment

6. Set environment variables in Railway dashboard:
   ```
   JWT_SECRET=your-long-random-secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   CLIENT_URL=https://your-vercel-url.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   SMTP_FROM=JobTracker <your-email@gmail.com>
   ```

7. After deploy, run migrations:
   - In Railway dashboard → your service → "Shell"
   - Run: `npx prisma migrate deploy`

8. Copy the Railway URL (e.g. https://job-tracker-api.up.railway.app)

---

## Frontend → Vercel

1. Push frontend to GitHub (separate repo or monorepo)

2. Go to https://vercel.com and sign in with GitHub

3. Click "Add New Project" → import your frontend repo

4. Set the environment variable:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```

5. Click "Deploy"

6. Copy the Vercel URL and go back to Railway to update CLIENT_URL

---

## Update vite.config.js for production

Replace the proxy config with the env variable:

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  // proxy only needed in dev — production uses VITE_API_URL
})
```

Update src/lib/api.js:
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
})
```

---

## Gmail App Password setup

1. Go to https://myaccount.google.com
2. Security → 2-Step Verification (must be enabled)
3. Search "App passwords" → create one for "Mail"
4. Copy the 16-character password → use as SMTP_PASS

---

## Test reminder emails locally

Add a reminder to any application in the DB, set `remindAt` to now, 
then trigger the cron manually:

```js
// In src/lib/cron.js, temporarily change the schedule to run every minute:
cron.schedule('* * * * *', async () => { ... })
```
