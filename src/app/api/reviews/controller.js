/**
 * Reviews Controller
 * Handles mod reviews and ratings
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Create review
 */
export const createReview = async (req, res, next) => {
  try {
    const { modId, rating, title, content } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400, 'VALIDATION_ERROR');
    }

    // Verify purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        modId,
        userId: req.user.id,
        paymentStatus: 'COMPLETED',
      },
    });

    const isVerified = !!purchase;

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        modId_userId: {
          modId,
          userId: req.user.id,
        }
      }
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this mod', 409, 'DUPLICATE_ENTRY');
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        modId,
        userId: req.user.id,
        rating,
        title,
        content,
        isVerified,
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    });

    // Update mod rating
    const allReviews = await prisma.review.findMany({
      where: { modId },
      select: { rating: true }
    });

    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.mod.update({
      where: { id: modId },
      data: {
        rating: avgRating,
        reviewCount: { increment: 1 },
      }
    });

    // Notify creator
    const mod = await prisma.mod.findUnique({
      where: { id: modId },
      select: {
        title: true,
        store: {
          select: {
            userId: true,
          }
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: mod.store.userId,
        type: 'REVIEW',
        title: 'New Review',
        message: `You received a ${rating}-star review on "${mod.title}"`,
        data: {
          reviewId: review.id,
          modId,
          modTitle: mod.title,
          rating,
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get mod reviews
 */
export const getModReviews = async (req, res, next) => {
  try {
    const { modId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { modId };
    if (rating) {
      where.rating = parseInt(rating);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              username: true,
              displayName: true,
              avatar: true,
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  username: true,
                  displayName: true,
                  avatar: true,
                }
              }
            }
          }
        }
      }),
      prisma.review.count({ where }),
    ]);

    // Get rating breakdown
    const allReviews = await prisma.review.findMany({
      where: { modId },
      select: { rating: true }
    });

    const breakdown = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
    };

    res.json({
      success: true,
      data: {
        reviews,
        breakdown,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review
 */
export const updateReview = async (req, res, next) => {
  try {
    const { rating, title, content } = req.body;
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    if (review.userId !== req.user.id) {
      throw new AppError('You can only edit your own reviews', 403, 'FORBIDDEN');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || review.rating,
        title: title || review.title,
        content: content || review.content,
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    });

    // Recalculate mod rating
    const allReviews = await prisma.review.findMany({
      where: { modId: review.modId },
      select: { rating: true }
    });

    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.mod.update({
      where: { id: review.modId },
      data: { rating: avgRating }
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new AppError('You can only delete your own reviews', 403, 'FORBIDDEN');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Recalculate mod rating
    const allReviews = await prisma.review.findMany({
      where: { modId: review.modId },
      select: { rating: true }
    });

    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length 
      : 0;

    await prisma.mod.update({
      where: { id: review.modId },
      data: {
        rating: avgRating,
        reviewCount: { decrement: 1 },
      }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark review as helpful
 */
export const markHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: { increment: 1 },
      }
    });

    res.json({
      success: true,
      message: 'Marked as helpful',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to review (creator only)
 */
export const replyToReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        mod: {
          include: {
            store: true,
          }
        }
      }
    });

    if (!review) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    // Only mod creator can reply
    if (review.mod.store.userId !== req.user.id) {
      throw new AppError('Only the mod creator can reply to reviews', 403, 'FORBIDDEN');
    }

    const reply = await prisma.reviewReply.create({
      data: {
        reviewId,
        userId: req.user.id,
        content,
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createReview,
  getModReviews,
  updateReview,
  deleteReview,
  markHelpful,
  replyToReview,
};
