# 🚀 Deploy ModShop to Vercel + Render (FREE)

Complete step-by-step guide to deploy your ModShop platform for FREE.

---

## 📋 Overview

| Component | Service | Cost |
|-----------|---------|------|
| Frontend (Next.js) | Vercel | FREE |
| Backend (Express) | Render | FREE |
| Database (PostgreSQL) | Render | FREE (1GB) |
| Storage | Cloudflare R2 | FREE (10GB) |

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended) or email

### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Fill in:
   - **Name:** `modshop-db`
   - **Database:** `modshop`
   - **Region:** Choose closest to you
   - **Plan:** **Free**
3. Click **"Create Database"**
4. ⏳ Wait for database to be ready (2-3 minutes)
5. Click on your database → **"Connection Info"** tab
6. **Copy** the **External Connection String** (looks like: `postgresql://user:password@host:5432/modshop`)

### Step 3: Create Web Service (Backend)

1. Click **"New +"** → **"Web Service"**
2. Select your **modshop** repository
3. Configure:
   - **Name:** `modshop-api`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `./` (leave blank)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** **Free**
   - **Auto-Deploy:** ✅ Enabled

4. Click **"Advanced"** and add these **Environment Variables**:

```
# Database
DATABASE_URL=<paste-your-postgresql-connection-string>

# JWT (generate a strong secret)
JWT_SECRET=modshop-production-jwt-secret-change-this-now-xyz123abc

# Paystack (Test Keys for now)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_SPLIT_CODE=

# Storage (Optional - for file uploads)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=auto
S3_BUCKET=modshop-files
S3_ENDPOINT=

# Email (Optional - for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=
EMAIL_FROM=ModShop <noreply@modshop.io>

# App Configuration
NODE_ENV=production
PORT=10000
NEXT_PUBLIC_API_URL=<will-add-after-deploy>
NEXT_PUBLIC_SITE_URL=<will-add-after-deploy>

# Platform Settings
PLATFORM_COMMISSION_FREE=15
PLATFORM_COMMISSION_PRO=10
MAX_FILE_SIZE_MB=1024
ALLOWED_FILE_TYPES=.zip,.rar,.7z,.tar.gz,.mod,.dll,.exe

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. Click **"Create Web Service"**
6. ⏳ Wait for deployment (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://modshop-api-xyz.onrender.com`)

### Step 4: Run Database Migrations

1. Go back to your Render dashboard
2. Click on your **modshop-api** service
3. Click **"Shell"** tab
4. Wait for shell to connect
5. Run these commands:

```bash
npx prisma migrate deploy
npx prisma generate
```

6. (Optional) Seed demo data:
```bash
npx prisma db seed
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Sign in with **GitHub** (recommended)

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find and select **modshop** from your repositories
3. Click **"Import"**

### Step 3: Configure Build

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (leave as default)

### Step 4: Add Environment Variables

Click **"Environment Variables"** → **"Add"** for each:

```
# Backend API URL (from Render)
NEXT_PUBLIC_API_URL=https://modshop-api-xyz.onrender.com

# Site URL (your Vercel URL)
NEXT_PUBLIC_SITE_URL=https://modshop-xyz.vercel.app

# Paystack Public Key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

### Step 5: Deploy

1. Click **"Deploy"**
2. ⏳ Wait for build (3-5 minutes)
3. Click **"Visit"** to see your live site!

---

## Part 3: Update Backend with Frontend URL

1. Go back to **Render Dashboard**
2. Click on **modshop-api** → **"Environment"** tab
3. Update these variables:

```
NEXT_PUBLIC_API_URL=https://modshop-api-xyz.onrender.com
NEXT_PUBLIC_SITE_URL=https://modshop-xyz.vercel.app
```

4. Click **"Save Changes"**
5. Service will auto-redeploy

---

## ✅ You're Live!

### Your URLs:

| Service | URL |
|---------|-----|
| **Frontend** | `https://modshop-xyz.vercel.app` |
| **Backend API** | `https://modshop-api-xyz.onrender.com` |
| **API Health** | `https://modshop-api-xyz.onrender.com/api/health` |
| **Database** | Render PostgreSQL (private) |

---

## 🧪 Test Your Deployment

1. **Visit your frontend** - Should show ModShop homepage
2. **Check API health** - Visit `/api/health` endpoint
3. **Test registration** - Create a test account
4. **Test login** - Login with your test account

---

## 🆘 Troubleshooting

### Frontend Shows "API Error"
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Ensure backend is running (check Render logs)

### Backend Won't Start
- Check Render logs for errors
- Verify `DATABASE_URL` is correct
- Ensure all environment variables are set

### Prisma Errors
```bash
# In Render Shell
npx prisma generate
npx prisma migrate deploy
```

### Database Connection Failed
- Use **External Connection String** from Render
- Ensure SSL is enabled in connection string

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies in package.json

---

## 💰 Free Tier Limits

| Service | Limit | Notes |
|---------|-------|-------|
| **Vercel** | 100GB bandwidth/month | Generous for testing |
| **Render Web Service** | 750 hours/month | Goes to sleep after 15min idle |
| **Render PostgreSQL** | 1GB storage | Enough for thousands of users |
| **Cloudflare R2** | 10GB storage | Free tier |

**Note:** Render free services "sleep" after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## 🔧 Optional: Add Custom Domain

### Vercel:
1. Go to Project → **Settings** → **Domains**
2. Add your domain
3. Update DNS records as shown

### Render:
1. Go to Service → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records

---

## 📊 Monitoring

### Vercel Analytics:
- Project → **Analytics** → Enable

### Render Logs:
- Service → **Logs** tab

### Error Tracking (Recommended):
- Add **Sentry** for error monitoring
- Add **UptimeRobot** for uptime monitoring

---

## 🎉 Next Steps

1. **Update Paystack keys** to production when ready
2. **Set up Cloudflare R2** for file storage
3. **Configure email** for notifications
4. **Add custom domain** for professional look
5. **Set up monitoring** (Sentry, UptimeRobot)

---

**Need Help?** 
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://prisma.io/docs

**Happy Deploying! 🚀**
