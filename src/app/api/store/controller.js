/**
 * Store Controller
 * Handles creator storefront management
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Create store
 */
export const createStore = async (req, res, next) => {
  try {
    const { name, slug, description, socialLinks } = req.body;

    // Check if user already has a store
    const existingStore = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (existingStore) {
      throw new AppError('You already have a store', 409, 'STORE_EXISTS');
    }

    // Check if slug is taken
    const slugExists = await prisma.store.findUnique({
      where: { slug: slug.toLowerCase() },
    });

    if (slugExists) {
      throw new AppError('Store slug already taken', 409, 'DUPLICATE_ENTRY');
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        userId: req.user.id,
        name,
        slug: slug.toLowerCase(),
        description,
        socialLinks: socialLinks || {},
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

    // Upgrade user to creator role
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'CREATOR' },
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get store by slug (public)
 */
export const getStore = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
            bio: true,
          }
        },
        mods: {
          where: { isPublished: true, status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            currency: true,
            isFree: true,
            images: true,
            downloads: true,
            sales: true,
            rating: true,
            reviewCount: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            mods: true,
          }
        }
      }
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    if (!store.isActive) {
      throw new AppError('Store is not active', 403, 'STORE_INACTIVE');
    }

    res.json({
      success: true,
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's store
 */
export const getMyStore = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
      include: {
        mods: {
          orderBy: { createdAt: 'desc' },
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        }
      }
    });

    if (!store) {
      throw new AppError('Store not found. Create one first.', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update store
 */
export const updateStore = async (req, res, next) => {
  try {
    const { name, description, logo, banner, socialLinks } = req.body;

    const store = await prisma.store.update({
      where: { userId: req.user.id },
      data: {
        name,
        description,
        logo,
        banner,
        socialLinks,
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

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update store subscription
 */
export const updateSubscription = async (req, res, next) => {
  try {
    const { subscription } = req.body;

    if (!['FREE', 'PRO', 'ENTERPRISE'].includes(subscription)) {
      throw new AppError('Invalid subscription tier', 400, 'VALIDATION_ERROR');
    }

    const subscriptionExpires = subscription !== 'FREE'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : null;

    const store = await prisma.store.update({
      where: { userId: req.user.id },
      data: {
        subscription,
        subscriptionExpires,
      },
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get store stats
 */
export const getStoreStats = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
      select: {
        id: true,
        totalSales: true,
        totalRevenue: true,
        subscription: true,
        mods: {
          select: {
            id: true,
            sales: true,
            revenue: true,
            downloads: true,
            rating: true,
          }
        },
        analytics: {
          orderBy: { date: 'desc' },
          take: 30,
        }
      }
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    // Calculate stats
    const totalMods = store.mods.length;
    const totalDownloads = store.mods.reduce((acc, mod) => acc + mod.downloads, 0);
    const avgRating = store.mods.reduce((acc, mod) => acc + mod.rating, 0) / totalMods || 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalSales: store.totalSales,
          totalRevenue: store.totalRevenue,
          totalMods,
          totalDownloads,
          avgRating: avgRating.toFixed(2),
          subscription: store.subscription,
          analytics: store.analytics,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete store
 */
export const deleteStore = async (req, res, next) => {
  try {
    await prisma.store.delete({
      where: { userId: req.user.id },
    });

    res.json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createStore,
  getStore,
  getMyStore,
  updateStore,
  updateSubscription,
  getStoreStats,
  deleteStore,
};
