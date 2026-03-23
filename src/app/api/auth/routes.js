/**
 * Auth Routes
 * POST   /api/auth/register     - Register new user
 * POST   /api/auth/login        - Login user
 * GET    /api/auth/me           - Get current user
 * PUT    /api/auth/profile      - Update profile
 * PUT    /api/auth/password     - Change password
 * DELETE /api/auth/delete       - Delete account
 */

import { Router } from 'express';
import * as authController from './controller.js';
import authenticate from '../../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.changePassword);
router.delete('/delete', authenticate, authController.deleteAccount);

export default router;
