/**
 * Notifications Controller
 * Handles user notifications
 */

import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Get user notifications
 */
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId: req.user.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
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
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    if (notification.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    if (notification.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification stats
 */
export const getNotificationStats = async (req, res, next) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      }
    });

    const totalCount = await prisma.notification.count({
      where: { userId: req.user.id }
    });

    // Get breakdown by type
    const typeBreakdown = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        userId: req.user.id,
        isRead: false,
      },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        unreadCount,
        totalCount,
        typeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
};
