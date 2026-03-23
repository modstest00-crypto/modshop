/**
 * Analytics Controller
 * Handles store and mod analytics
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Get store analytics dashboard
 */
export const getStoreAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);

    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics data
    const analytics = await prisma.storeAnalytics.findMany({
      where: {
        storeId: store.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get top mods
    const topMods = await prisma.mod.findMany({
      where: { storeId: store.id },
      orderBy: { sales: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        sales: true,
        revenue: true,
        downloads: true,
        rating: true,
        images: true,
      }
    });

    // Get recent sales
    const recentSales = await prisma.purchase.findMany({
      where: {
        mod: { storeId: store.id },
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        mod: {
          select: {
            title: true,
            slug: true,
          }
        },
        user: {
          select: {
            username: true,
          }
        }
      }
    });

    // Calculate totals
    const totalViews = analytics.reduce((acc, a) => acc + a.views, 0);
    const totalVisitors = analytics.reduce((acc, a) => acc + a.visitors, 0);
    const totalSales = analytics.reduce((acc, a) => acc + a.sales, 0);
    const totalRevenue = analytics.reduce((acc, a) => acc + parseFloat(a.revenue), 0);

    res.json({
      success: true,
      data: {
        overview: {
          totalViews,
          totalVisitors,
          totalSales,
          totalRevenue,
          period: days,
        },
        trends: analytics,
        topMods,
        recentSales,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get mod analytics
 */
export const getModAnalytics = async (req, res, next) => {
  try {
    const { modId } = req.params;
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    const mod = await prisma.mod.findFirst({
      where: {
        id: modId,
        storeId: store.id,
      },
    });

    if (!mod) {
      throw new AppError('Mod not found', 404, 'NOT_FOUND');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await prisma.modAnalytics.findMany({
      where: {
        modId: mod.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get version stats
    const versions = await prisma.modVersion.findMany({
      where: { modId: mod.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get reviews breakdown
    const reviews = await prisma.review.findMany({
      where: { modId: mod.id },
      select: {
        rating: true,
        createdAt: true,
      }
    });

    const ratingBreakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    res.json({
      success: true,
      data: {
        mod: {
          id: mod.id,
          title: mod.title,
          currentVersion: mod.currentVersion,
        },
        overview: {
          totalViews: mod.viewCount,
          totalDownloads: mod.downloads,
          totalSales: mod.sales,
          totalRevenue: parseFloat(mod.revenue),
          avgRating: mod.rating,
          reviewCount: mod.reviewCount,
        },
        trends: analytics,
        versions,
        ratingBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Track page view
 */
export const trackView = async (req, res, next) => {
  try {
    const { type, id } = req.body; // type: 'store' or 'mod'

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (type === 'store') {
      const store = await prisma.store.findUnique({
        where: { id },
      });

      if (store) {
        await prisma.storeAnalytics.upsert({
          where: {
            storeId_date: {
              storeId: id,
              date: today,
            }
          },
          update: {
            views: { increment: 1 },
            visitors: { increment: 1 },
          },
          create: {
            storeId: id,
            date: today,
            views: 1,
            visitors: 1,
          }
        });
      }
    } else if (type === 'mod') {
      const mod = await prisma.mod.findUnique({
        where: { id },
      });

      if (mod) {
        await prisma.modAnalytics.upsert({
          where: {
            modId_date: {
              modId: id,
              date: today,
            }
          },
          update: {
            views: { increment: 1 },
          },
          create: {
            modId: id,
            date: today,
            views: 1,
          }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue report
 */
export const getRevenueReport = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all sales in period
    const sales = await prisma.purchase.findMany({
      where: {
        mod: { storeId: store.id },
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        platformFee: true,
        creatorPayout: true,
        createdAt: true,
      }
    });

    // Group by date
    const dailyRevenue = {};
    sales.forEach(sale => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = {
          gross: 0,
          fees: 0,
          net: 0,
        };
      }
      dailyRevenue[date].gross += parseFloat(sale.amount);
      dailyRevenue[date].fees += parseFloat(sale.platformFee);
      dailyRevenue[date].net += parseFloat(sale.creatorPayout);
    });

    const totals = sales.reduce((acc, sale) => ({
      gross: acc.gross + parseFloat(sale.amount),
      fees: acc.fees + parseFloat(sale.platformFee),
      net: acc.net + parseFloat(sale.creatorPayout),
    }), { gross: 0, fees: 0, net: 0 });

    res.json({
      success: true,
      data: {
        period: days,
        totals,
        dailyRevenue: Object.entries(dailyRevenue).map(([date, data]) => ({
          date,
          ...data,
        })),
        transactionCount: sales.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStoreAnalytics,
  getModAnalytics,
  trackView,
  getRevenueReport,
};
