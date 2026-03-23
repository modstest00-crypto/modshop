# ModShop Deployment Checklist

Use this checklist before deploying to production.

## ✅ Pre-Deployment Checks

### 1. Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Generate strong `JWT_SECRET` (use: `openssl rand -base64 32`)
- [ ] Set up PostgreSQL and update `DATABASE_URL`
- [ ] Add Paystack keys (`PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`)
- [ ] Configure S3/R2 storage credentials
- [ ] Set production URLs (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`)

### 2. Database Setup
- [ ] Install PostgreSQL 15+
- [ ] Create database: `CREATE DATABASE modshop;`
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:migrate`
- [ ] (Optional) Run `npm run db:seed` for demo data

### 3. Code Verification
- [ ] All dependencies installed: `npm install`
- [ ] No TypeScript errors (if using TS)
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`

### 4. Security
- [ ] Change default JWT secret
- [ ] Use production Paystack keys (not test)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domains
- [ ] Set up rate limiting
- [ ] Enable helmet security headers

### 5. Storage Setup
- [ ] Create Cloudflare R2 bucket or AWS S3 bucket
- [ ] Configure CORS for storage bucket
- [ ] Test file upload functionality
- [ ] Set up CDN for static assets (optional)

### 6. Email Configuration
- [ ] Set up SMTP (SendGrid, Mailgun, etc.)
- [ ] Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- [ ] Test email delivery

### 7. Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test mod creation flow
- [ ] Test payment flow (use Paystack test mode first)
- [ ] Test file upload/download
- [ ] Test dashboard analytics

## 🚀 Deployment Steps

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

#### Backend (Railway)
1. Create Railway account
2. Create new PostgreSQL database
3. Deploy backend service
4. Set all environment variables
5. Run migrations: `npx prisma migrate deploy`

#### Storage (Cloudflare R2)
1. Create R2 bucket
2. Generate API credentials
3. Update environment variables

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t modshop .

# Run with docker-compose
docker-compose up -d
```

### Option 3: VPS Deployment

```bash
# Clone repository
git clone <your-repo>
cd modshop

# Install dependencies
npm install

# Build
npm run build

# Run with PM2
pm2 start npm --name "modshop" -- start
pm2 save
pm2 startup
```

## 🔧 Post-Deployment

### Monitoring Setup
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging (Logtail/Papertrail)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure analytics (Google Analytics/Plausible)

### DNS & Domain
- [ ] Point domain to Vercel
- [ ] Configure API subdomain (api.yourdomain.com)
- [ ] Set up SSL certificates
- [ ] Configure custom email domain

### Backup Strategy
- [ ] Enable automatic database backups
- [ ] Set up S3 versioning
- [ ] Document recovery procedures

## 📊 Production URLs

After deployment, update these:

| Service | URL |
|---------|-----|
| Frontend | `https://yourdomain.com` |
| Backend API | `https://api.yourdomain.com` |
| Storage | `https://your-bucket.r2.cloudflarestorage.com` |

## 🆘 Troubleshooting

### Database Connection Failed
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Build Fails
```bash
# Clear cache
rm -rf node_modules .next

# Reinstall
npm ci

# Rebuild
npm run build
```

### Payment Issues
- Verify Paystack keys are correct (test vs live)
- Check webhook URL is publicly accessible
- Review Paystack dashboard for errors

### File Upload Fails
- Check S3/R2 credentials
- Verify bucket CORS configuration
- Check file size limits

## 📞 Support

- Documentation: `/DEPLOYMENT.md`
- Issues: GitHub Issues
- Email: support@modshop.io

---

**Last Updated:** March 2026
**Version:** 1.0.0
