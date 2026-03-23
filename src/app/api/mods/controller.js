/**
 * Mods Controller
 * Handles mod listing, creation, and management
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Generate unique slug from title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Create mod
 */
export const createMod = async (req, res, next) => {
  try {
    const {
      title,
      description,
      longDescription,
      price,
      currency,
      isFree,
      categoryId,
      tags,
      gameTitle,
      gameCategory,
      platform,
      requirements,
      images,
      videoUrl,
    } = req.body;

    // Get user's store
    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('You need to create a store first', 400, 'NO_STORE');
    }

    if (!store.isActive) {
      throw new AppError('Your store is not active', 403, 'STORE_INACTIVE');
    }

    // Check subscription limits
    const modCount = await prisma.mod.count({
      where: { storeId: store.id },
    });

    if (store.subscription === 'FREE' && modCount >= 3) {
      throw new AppError('Free plan limited to 3 mods. Upgrade to Pro for unlimited.', 403, 'LIMIT_REACHED');
    }

    // Generate slug
    let slug = generateSlug(title);
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const exists = await prisma.mod.findUnique({
        where: { storeId_slug: { storeId: store.id, slug: uniqueSlug } },
      });

      if (!exists) break;
      uniqueSlug = `${slug}-${counter++}`;
    }

    // Create mod
    const mod = await prisma.mod.create({
      data: {
        storeId: store.id,
        creatorId: req.user.id,
        title,
        slug: uniqueSlug,
        description,
        longDescription,
        price: isFree ? 0 : parseFloat(price) || 0,
        currency: currency || 'USD',
        isFree: isFree || false,
        categoryId,
        tags: tags || [],
        gameTitle,
        gameCategory,
        platform: platform || [],
        requirements,
        images: images || [],
        videoUrl,
        status: 'PENDING',
      },
      include: {
        store: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mod created successfully. Pending review.',
      data: { mod },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all mods (public)
 */
export const getMods = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      game,
      sort = 'newest',
      minPrice,
      maxPrice,
      freeOnly,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      isPublished: true,
      status: 'APPROVED',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { gameTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (game) {
      where.gameTitle = { contains: game, mode: 'insensitive' };
    }

    if (freeOnly) {
      where.isFree = true;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Sorting
    let orderBy = {};
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'popular':
        orderBy = { downloads: 'desc' };
        break;
      case 'bestselling':
        orderBy = { sales: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [mods, total] = await Promise.all([
      prisma.mod.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          store: {
            select: {
              name: true,
              slug: true,
              logo: true,
            }
          },
          category: {
            select: {
              name: true,
              slug: true,
            }
          },
        }
      }),
      prisma.mod.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        mods,
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
 * Get mod by slug (public)
 */
export const getMod = async (req, res, next) => {
  try {
    const { storeSlug, modSlug } = req.params;

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    const mod = await prisma.mod.findUnique({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug: modSlug,
        }
      },
      include: {
        store: {
          select: {
            name: true,
            slug: true,
            logo: true,
            banner: true,
            user: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
              }
            }
          }
        },
        category: true,
        versions: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                username: true,
                displayName: true,
                avatar: true,
              }
            },
          }
        },
      }
    });

    if (!mod) {
      throw new AppError('Mod not found', 404, 'NOT_FOUND');
    }

    if (!mod.isPublished || mod.status !== 'APPROVED') {
      throw new AppError('Mod not available', 403, 'MOD_UNAVAILABLE');
    }

    // Increment view count
    await prisma.mod.update({
      where: { id: mod.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({
      success: true,
      data: { mod },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's mods
 */
export const getMyMods = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    const mods = await prisma.mod.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            purchases: true,
            reviews: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: { mods },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update mod
 */
export const updateMod = async (req, res, next) => {
  try {
    const {
      title,
      description,
      longDescription,
      price,
      isFree,
      categoryId,
      tags,
      gameTitle,
      platform,
      requirements,
      images,
      videoUrl,
    } = req.body;

    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    const mod = await prisma.mod.findFirst({
      where: {
        id: req.params.id,
        storeId: store.id,
      },
    });

    if (!mod) {
      throw new AppError('Mod not found', 404, 'NOT_FOUND');
    }

    const updatedMod = await prisma.mod.update({
      where: { id: mod.id },
      data: {
        title,
        description,
        longDescription,
        price: isFree ? 0 : parseFloat(price) || mod.price,
        isFree: isFree !== undefined ? isFree : mod.isFree,
        categoryId,
        tags,
        gameTitle,
        platform,
        requirements,
        images,
        videoUrl,
        status: 'PENDING', // Re-review on update
      },
    });

    res.json({
      success: true,
      message: 'Mod updated successfully. Pending review.',
      data: { mod: updatedMod },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete mod
 */
export const deleteMod = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    const mod = await prisma.mod.findFirst({
      where: {
        id: req.params.id,
        storeId: store.id,
      },
    });

    if (!mod) {
      throw new AppError('Mod not found', 404, 'NOT_FOUND');
    }

    await prisma.mod.delete({
      where: { id: mod.id },
    });

    res.json({
      success: true,
      message: 'Mod deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured mods
 */
export const getFeaturedMods = async (req, res, next) => {
  try {
    const mods = await prisma.mod.findMany({
      where: {
        isPublished: true,
        status: 'APPROVED',
        isFeatured: true,
      },
      orderBy: { sales: 'desc' },
      take: 8,
      include: {
        store: {
          select: {
            name: true,
            slug: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: { mods },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createMod,
  getMods,
  getMod,
  getMyMods,
  updateMod,
  deleteMod,
  getFeaturedMods,
};
