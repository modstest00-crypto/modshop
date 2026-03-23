/**
 * Notifications Routes
 * GET    /api/notifications        - Get user notifications
 * GET    /api/notifications/stats  - Get notification stats
 * PUT    /api/notifications/:id/read    - Mark as read
 * PUT    /api/notifications/read-all    - Mark all as read
 * DELETE /api/notifications/:id    - Delete notification
 */

import { Router } from 'express';
import * as notificationController from './controller.js';
import authenticate from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.get('/stats', notificationController.getNotificationStats);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
