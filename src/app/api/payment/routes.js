/**
 * Payment Routes
 * POST   /api/payment/initialize     - Initialize payment
 * GET    /api/payment/verify         - Verify payment
 * GET    /api/payment/history        - Get purchase history
 * GET    /api/payment/:id            - Get purchase details
 * GET    /api/payment/download/:modId - Download purchased mod
 * POST   /api/payment/payout         - Process payout (admin)
 */

import { Router } from 'express';
import * as paymentController from './controller.js';
import authenticate from '../../middleware/auth.js';

const router = Router();

// Public route for callback
router.get('/verify', paymentController.verifyPayment);

// Protected routes
router.use(authenticate);
router.post('/initialize', paymentController.initializePayment);
router.get('/history', paymentController.getPurchaseHistory);
router.get('/:id', paymentController.getPurchase);
router.get('/download/:modId', paymentController.downloadMod);
router.post('/payout', paymentController.processPayout);

export default router;
