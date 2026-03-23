/**
 * User Controller
 * Handles user-related operations
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Get user profile (public)
 */
export const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logo: true,
            banner: true,
            totalSales: true,
            totalRevenue: true,
            subscription: true,
          }
        },
        mods: {
          where: { isPublished: true, status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            images: true,
            downloads: true,
            sales: true,
            rating: true,
          }
        },
        _count: {
          select: {
            mods: { where: { isPublished: true, status: 'APPROVED' } },
            reviews: true,
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search users
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      throw new AppError('Search query required', 400, 'VALIDATION_ERROR');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
        role: 'CREATOR',
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        store: {
          select: {
            name: true,
            slug: true,
            logo: true,
          }
        },
        _count: {
          select: {
            mods: { where: { isPublished: true, status: 'APPROVED' } },
          }
        }
      },
      skip,
      take,
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
        role: 'CREATOR',
      }
    });

    res.json({
      success: true,
      data: {
        users,
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
 * Get creators (featured/top)
 */
export const getCreators = async (req, res, next) => {
  try {
    const { sortBy = 'sales', limit = 12 } = req.query;

    let orderBy = {};
    switch (sortBy) {
      case 'sales':
        orderBy = { store: { totalSales: 'desc' } };
        break;
      case 'revenue':
        orderBy = { store: { totalRevenue: 'desc' } };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { store: { totalSales: 'desc' } };
    }

    const creators = await prisma.user.findMany({
      where: {
        role: 'CREATOR',
        store: {
          isActive: true,
        },
      },
      orderBy,
      take: parseInt(limit),
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        store: {
          select: {
            name: true,
            slug: true,
            logo: true,
            totalSales: true,
            totalRevenue: true,
          }
        },
        _count: {
          select: {
            mods: { where: { isPublished: true, status: 'APPROVED' } },
          }
        }
      }
    });

    res.json({
      success: true,
      data: { creators },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  searchUsers,
  getCreators,
};
