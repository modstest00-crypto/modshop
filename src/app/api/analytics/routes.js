/**
 * Analytics Routes
 * GET    /api/analytics/store      - Get store analytics
 * GET    /api/analytics/mod/:id    - Get mod analytics
 * GET    /api/analytics/revenue    - Get revenue report
 * POST   /api/analytics/track      - Track page view
 */

import { Router } from 'express';
import * as analyticsController from './controller.js';
import authenticate from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/store', analyticsController.getStoreAnalytics);
router.get('/mod/:id', analyticsController.getModAnalytics);
router.get('/revenue', analyticsController.getRevenueReport);
router.post('/track', analyticsController.trackView);

export default router;
