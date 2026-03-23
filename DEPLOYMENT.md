# ModShop Deployment Guide

This guide covers deploying ModShop to production.

---

## 🚀 Quick Deploy Options

### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel):**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

**Backend (Railway):**
1. Create Railway project
2. Add PostgreSQL database
3. Deploy backend with environment variables
4. Connect to database

**Storage (Cloudflare R2):**
1. Create R2 bucket
2. Generate API credentials
3. Update environment variables

---

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Railway account (or alternative: Render, Fly.io)
- Cloudflare R2 account (or AWS S3)
- Paystack account (for payments)
- Domain name (optional but recommended)

---

## 🔧 Step-by-Step Deployment

### 1. Database Setup (Railway)

```bash
# Create new PostgreSQL database on Railway
# Copy the DATABASE_URL connection string
```

### 2. Storage Setup (Cloudflare R2)

```bash
# Create bucket: modshop-files
# Generate S3-compatible API credentials
# Note: endpoint, access key, secret key
```

### 3. Environment Variables

Create these in your deployment platform:

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="<generate-strong-random-string>"

# Paystack
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."

# Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="auto"
S3_BUCKET="modshop-files"
S3_ENDPOINT="https://your-account.r2.cloudflarestorage.com"

# App URLs
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### 4. Run Migrations

```bash
# On your deployment platform, run:
npx prisma migrate deploy
npx prisma generate
```

### 5. Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 6. Deploy Backend

Backend can be deployed as:
- **Docker container** (recommended)
- **Node.js service** on Railway/Render
- **Serverless function** (requires modifications)

---

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://...
      - JWT_SECRET=...
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: modshop
      POSTGRES_PASSWORD: modshop_secret
      POSTGRES_DB: modshop
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🔒 Production Checklist

- [ ] Generate strong JWT secret
- [ ] Use production Paystack keys (not test)
- [ ] Enable HTTPS
- [ ] Set up custom domain
- [ ] Configure CORS for production URLs
- [ ] Set up error monitoring (Sentry)
- [ ] Set up logging (Logtail/Papertrail)
- [ ] Configure database backups
- [ ] Set up CDN for static assets
- [ ] Enable rate limiting
- [ ] Test payment flow end-to-end
- [ ] Set up email notifications
- [ ] Configure analytics tracking

---

## 📊 Monitoring

### Recommended Tools

- **Error Tracking:** Sentry
- **Logging:** Logtail, Papertrail
- **Uptime:** UptimeRobot, Pingdom
- **Analytics:** Google Analytics, Plausible
- **Performance:** Vercel Analytics, New Relic

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 💰 Cost Estimates

### Monthly Costs (Starting)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | ✓ (100GB) | $20 |
| Railway | $5 credit | ~$10 |
| Cloudflare R2 | 10GB free | ~$5 |
| Paystack | 1.5% + ₦100 | Same |
| **Total** | **~$5** | **~$35** |

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check connection string format
# Ensure SSL is enabled if required
# Verify firewall allows connections
```

### Build Failures
```bash
# Clear cache: rm -rf .next node_modules
# Reinstall: npm ci
# Rebuild: npm run build
```

### Payment Issues
```bash
# Verify Paystack keys are correct (test vs live)
# Check webhook configuration
# Review Paystack dashboard for errors
```

---

## 📞 Support

For deployment issues:
- Check the [README.md](README.md)
- Review [GitHub Issues](https://github.com/yourusername/modshop/issues)
- Email: support@modshop.io

---

**Happy Deploying! 🚀**
