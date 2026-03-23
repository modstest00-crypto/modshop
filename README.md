# ModShop - The Stripe for Mod Creators

Instant storefront platform for selling game mods. Handle payments, delivery, updates, and fraud protection with ease.

![ModShop](public/logo.svg)

## 🚀 Features

- **Instant Storefront** - Set up your professional store in minutes
- **Split Payments** - Automatic payment splitting via Paystack
- **Auto Delivery** - Customers receive download links instantly
- **Analytics Dashboard** - Track sales, views, and customer behavior
- **Version Management** - Push updates to all buyers automatically
- **Fraud Protection** - Advanced fraud detection and secure file delivery

## 📋 Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** PostgreSQL with Prisma ORM
- **Storage:** Cloudflare R2 / AWS S3
- **Payments:** Paystack
- **Authentication:** JWT

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd modshop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
modshop/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── auth/         # Auth pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── layout.js     # Root layout
│   │   └── page.js       # Home page
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   │   ├── api.js        # API client
│   │   ├── utils.js      # Helper functions
│   │   └── validation.js # Form validation
│   ├── styles/           # Global styles
│   └── server.js         # Express server
├── public/               # Static assets
├── prisma/               # Database schema
├── .env                  # Environment variables
├── .env.example          # Environment template
├── next.config.js        # Next.js config
├── tailwind.config.js    # Tailwind config
└── package.json          # Dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Yes |
| `AWS_ACCESS_KEY_ID` | S3/R2 access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | S3/R2 secret key | Yes |
| `S3_BUCKET` | Storage bucket name | Yes |
| `S3_ENDPOINT` | S3/R2 endpoint URL | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SITE_URL` | Frontend site URL | Yes |

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Frontend (Vercel)**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Backend (Railway/Render)**
   - Push to GitHub
   - Connect to Railway/Render
   - Set environment variables

3. **Database**
   - Use Railway PostgreSQL or similar
   - Run `npx prisma migrate deploy`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Mods
- `GET /api/mods` - List all mods
- `GET /api/mods/featured` - Get featured mods
- `GET /api/mods/:id` - Get mod by ID
- `POST /api/mods` - Create mod (auth required)
- `PUT /api/mods/:id` - Update mod (auth required)
- `DELETE /api/mods/:id` - Delete mod (auth required)

### Store
- `GET /api/store/:slug` - Get store by slug
- `PUT /api/store/settings` - Update store settings

### Payments
- `POST /api/payment/initialize` - Initialize payment
- `POST /api/payment/webhook` - Paystack webhook
- `POST /api/payment/verify/:reference` - Verify payment

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/creators` - Get top creators

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature

Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- **Email:** support@modshop.io
- **Documentation:** https://docs.modshop.io
- **Issues:** https://github.com/modshop/modshop/issues

## 🙏 Acknowledgments

- Built with ❤️ by the ModShop Team
- Powered by Next.js, Express, and Prisma
- Payment processing by Paystack

---

**Happy Modding! 🎮**
