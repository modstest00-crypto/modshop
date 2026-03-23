/**
 * Mods Routes
 * GET    /api/mods              - Get all mods (public)
 * GET    /api/mods/featured     - Get featured mods
 * GET    /api/mods/my-mods      - Get current user's mods
 * POST   /api/mods              - Create mod
 * GET    /api/mods/:id          - Get mod by ID
 * PUT    /api/mods/:id          - Update mod
 * DELETE /api/mods/:id          - Delete mod
 * GET    /:storeSlug/:modSlug   - Get mod by store and slug (public)
 */

import { Router } from 'express';
import * as modController from './controller.js';
import authenticate, { optionalAuth } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', modController.getMods);
router.get('/featured', modController.getFeaturedMods);
router.get('/:storeSlug/:modSlug', modController.getMod);

// Protected routes
router.use(authenticate);
router.get('/my-mods', modController.getMyMods);
router.post('/', modController.createMod);
router.put('/:id', modController.updateMod);
router.delete('/:id', modController.deleteMod);

export default router;
