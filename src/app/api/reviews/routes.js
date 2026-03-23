/**
 * Reviews Routes
 * POST   /api/reviews              - Create review
 * GET    /api/reviews/mod/:modId   - Get mod reviews
 * PUT    /api/reviews/:reviewId    - Update review
 * DELETE /api/reviews/:reviewId    - Delete review
 * POST   /api/reviews/:reviewId/helpful - Mark as helpful
 * POST   /api/reviews/:reviewId/reply   - Reply to review
 */

import { Router } from 'express';
import * as reviewController from './controller.js';
import authenticate from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', reviewController.createReview);
router.get('/mod/:modId', reviewController.getModReviews);
router.put('/:reviewId', reviewController.updateReview);
router.delete('/:reviewId', reviewController.deleteReview);
router.post('/:reviewId/helpful', reviewController.markHelpful);
router.post('/:reviewId/reply', reviewController.replyToReview);

export default router;
