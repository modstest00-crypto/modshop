/**
 * User Routes
 * GET    /api/user/:username       - Get user profile (public)
 * GET    /api/user/search          - Search users
 * GET    /api/user/creators        - Get top creators
 */

import { Router } from 'express';
import * as userController from './controller.js';

const router = Router();

router.get('/:username', userController.getProfile);
router.get('/search', userController.searchUsers);
router.get('/creators', userController.getCreators);

export default router;
