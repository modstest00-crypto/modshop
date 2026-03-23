/**
 * ModShop Server
 * The Stripe for Mod Creators
 * 
 * Main Express server with API routes, middleware, and Next.js integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';

// Import routes
import authRoutes from './app/api/auth/routes.js';
import userRoutes from './app/api/user/routes.js';
import storeRoutes from './app/api/store/routes.js';
import modRoutes from './app/api/mods/routes.js';
import paymentRoutes from './app/api/payment/routes.js';
import uploadRoutes from './app/api/upload/routes.js';
import analyticsRoutes from './app/api/analytics/routes.js';
import reviewRoutes from './app/api/reviews/routes.js';
import notificationRoutes from './app/api/notifications/routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.siteUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/mods', modRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'ModShop API',
    version: '1.0.0',
    description: 'The Stripe for Mod Creators - Instant storefront platform',
    endpoints: {
      auth: '/api/auth',
      users: '/api/user',
      stores: '/api/store',
      mods: '/api/mods',
      payments: '/api/payment',
      uploads: '/api/upload',
      analytics: '/api/analytics',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
    },
    documentation: '/api/docs',
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ███╗   ██╗███████╗██╗    ██╗██╗███╗   ███╗            ║
║   ████╗  ██║██╔════╝██║    ██║██║████╗ ████║            ║
║   ██╔██╗ ██║█████╗  ██║ █╗ ██║██║██╔████╔██║            ║
║   ██║╚██╗██║██╔══╝  ██║███╗██║██║██║╚██╔╝██║            ║
║   ██║ ╚████║███████╗╚███╔███╔╝██║██║ ╚═╝ ██║            ║
║   ╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ ╚═╝╚═╝     ╚═╝            ║
║                                                          ║
║   ███████╗██╗  ██╗██████╗ ███████╗                       ║
║   ██╔════╝╚██╗██╔╝██╔══██╗██╔════╝                       ║
║   █████╗   ╚███╔╝ ██████╔╝█████╗                         ║
║   ██╔══╝   ██╔██╗ ██╔═══╝ ██╔══╝                         ║
║   ███████╗██╔╝ ██╗██║     ███████╗                       ║
║   ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝                       ║
║                                                          ║
║   The Stripe for Mod Creators                            ║
║   v1.0.0                                                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

  Server running on port ${PORT}
  Environment: ${config.nodeEnv}
  API: ${config.apiUrl}/api
  `);
});

export default app;
