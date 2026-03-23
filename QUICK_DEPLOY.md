# 🚀 Quick Deploy Guide

## Step 1: Push to GitHub

### Create a new repository on GitHub:
1. Go to https://github.com/new
2. Repository name: `modshop`
3. Keep it **Public** or **Private** (your choice)
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Push your code from Termux:
```bash
cd /data/data/com.termux/files/home/modshop

# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/modshop.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `modshop` repository
5. **Framework Preset:** Next.js
6. **Root Directory:** `./` (default)
7. **Build Command:** `npm run build`
8. **Output Directory:** `.next` (default)

### Add Environment Variables in Vercel:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

9. Click "Deploy"

---

## Step 3: Deploy Backend to Railway

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `modshop` repository

### Add PostgreSQL Database:
1. Click "New" → "Database" → "PostgreSQL"
2. Copy the `DATABASE_URL` connection string

### Add Environment Variables in Railway:
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/modshop

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key

# Storage (Cloudflare R2 or AWS S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=auto
S3_BUCKET=modshop-files
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com

# App
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### Deploy:
1. Railway will auto-detect Node.js and deploy
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://modshop-production.up.railway.app`)

---

## Step 4: Update Vercel with Backend URL

1. Go back to Vercel project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with your Railway backend URL
4. Redeploy

---

## Step 5: Run Database Migrations

In Railway, add a new service → "Shell" or use Railway CLI:

```bash
npx prisma migrate deploy
npx prisma generate
```

---

## ✅ Your ModShop is Live!

- **Frontend:** https://your-domain.vercel.app
- **Backend API:** https://your-backend-url.railway.app
- **API Health:** https://your-backend-url.railway.app/api/health

---

## 🆘 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json

### Backend Won't Start on Railway
- Check logs in Railway dashboard
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Prisma Errors
- Run `npx prisma generate` in Railway shell
- Run `npx prisma migrate deploy`

---

**Need Help?** Check DEPLOYMENT_CHECKLIST.md for detailed steps.
