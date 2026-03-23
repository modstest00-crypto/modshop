/**
 * Store Routes
 * POST   /api/store              - Create store
 * GET    /api/store              - Get my store
 * GET    /api/store/:slug        - Get store by slug (public)
 * PUT    /api/store              - Update store
 * PUT    /api/store/subscription - Update subscription
 * GET    /api/store/stats        - Get store statistics
 * DELETE /api/store              - Delete store
 */

import { Router } from 'express';
import * as storeController from './controller.js';
import authenticate, { requireRole } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(requireRole('CREATOR', 'ADMIN'));

router.post('/', storeController.createStore);
router.get('/', storeController.getMyStore);
router.get('/:slug', storeController.getStore);
router.put('/', storeController.updateStore);
router.put('/subscription', storeController.updateSubscription);
router.get('/stats/overview', storeController.getStoreStats);
router.delete('/', storeController.deleteStore);

export default router;
