import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-dev-secret-change-me',
  jwtExpiresIn: '7d',
  
  // Paystack
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    baseUrl: 'https://api.paystack.co',
  },
  
  // Storage (S3/R2)
  storage: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'auto',
    bucket: process.env.S3_BUCKET || 'modshop-files',
    endpoint: process.env.S3_ENDPOINT,
  },
  
  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'ModShop <noreply@modshop.io>',
  },
  
  // Platform
  platform: {
    commissionFree: parseInt(process.env.PLATFORM_COMMISSION_FREE || '15'),
    commissionPro: parseInt(process.env.PLATFORM_COMMISSION_PRO || '10'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '1024') * 1024 * 1024,
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || '.zip,.rar,.7z,.tar.gz,.mod,.dll,.exe').split(','),
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  // URLs
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export default config;
