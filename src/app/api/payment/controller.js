/**
 * Payment Controller
 * Handles Paystack payment integration with split payments
 */

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/errorHandler.js';
import { config } from '../../config/index.js';

const prisma = new PrismaClient();

/**
 * Initialize Paystack payment
 */
export const initializePayment = async (req, res, next) => {
  try {
    const { modId, email } = req.body;

    // Get mod details
    const mod = await prisma.mod.findUnique({
      where: { id: modId },
      include: {
        store: {
          include: {
            user: true,
          }
        }
      }
    });

    if (!mod) {
      throw new AppError('Mod not found', 404, 'NOT_FOUND');
    }

    if (!mod.isPublished || mod.status !== 'APPROVED') {
      throw new AppError('Mod is not available for purchase', 403, 'MOD_UNAVAILABLE');
    }

    if (mod.isFree) {
      throw new AppError('This mod is free. Use the free download endpoint.', 400, 'FREE_MOD');
    }

    // Calculate amounts
    const amountInKobo = Math.round(parseFloat(mod.price) * 100); // Convert to kobo
    const commissionRate = mod.store.subscription === 'PRO' 
      ? config.platform.commissionPro 
      : config.platform.commissionFree;
    const platformFee = Math.round(amountInKobo * (commissionRate / 100));
    const creatorPayout = amountInKobo - platformFee;

    // Create order
    const orderId = uuidv4();
    const order = await prisma.purchase.create({
      data: {
        userId: req.user.id,
        modId: mod.id,
        orderId,
        amount: mod.price,
        currency: mod.currency,
        platformFee: platformFee / 100,
        creatorPayout: creatorPayout / 100,
        paymentStatus: 'PENDING',
      },
    });

    // Initialize Paystack transaction
    const paystackResponse = await axios.post(
      `${config.paystack.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        currency: mod.currency.toLowerCase(),
        reference: orderId,
        callback_url: `${config.siteUrl}/payment/callback?order=${orderId}`,
        metadata: {
          modId: mod.id,
          modTitle: mod.title,
          storeId: mod.store.id,
          creatorId: mod.store.userId,
          platformFee,
          creatorPayout,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!paystackResponse.data.status) {
      throw new AppError('Failed to initialize payment', 500, 'PAYMENT_INIT_FAILED');
    }

    res.json({
      success: true,
      data: {
        authorizationUrl: paystackResponse.data.data.authorization_url,
        accessCode: paystackResponse.data.data.access_code,
        reference: paystackResponse.data.data.reference,
        orderId,
        amount: mod.price,
        currency: mod.currency,
      },
    });
  } catch (error) {
    if (error.response?.data) {
      console.error('Paystack error:', error.response.data);
    }
    next(error);
  }
};

/**
 * Verify payment callback
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { reference, order } = req.query;

    if (!reference && !order) {
      throw new AppError('Reference or order ID required', 400, 'VALIDATION_ERROR');
    }

    const ref = reference || order;

    // Verify with Paystack
    const paystackResponse = await axios.get(
      `${config.paystack.baseUrl}/transaction/verify/${ref}`,
      {
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
        },
      }
    );

    if (!paystackResponse.data.status) {
      throw new AppError('Failed to verify payment', 500, 'PAYMENT_VERIFY_FAILED');
    }

    const transaction = paystackResponse.data.data;

    // Get order
    let purchase = await prisma.purchase.findUnique({
      where: { orderId: ref },
      include: {
        mod: {
          include: {
            store: true,
          }
        },
        user: true,
      }
    });

    if (!purchase) {
      throw new AppError('Order not found', 404, 'NOT_FOUND');
    }

    // Check if already processed
    if (purchase.paymentStatus === 'COMPLETED') {
      return res.json({
        success: true,
        message: 'Payment already processed',
        data: { purchase },
      });
    }

    if (transaction.status === 'success') {
      // Update purchase status
      purchase = await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          paymentStatus: 'COMPLETED',
          paymentMethod: transaction.channel,
          paystackRef: transaction.reference,
          isDelivered: true,
          downloadUrl: `/api/mods/${purchase.mod.id}/download?token=${uuidv4()}`,
          downloadExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Update mod sales
      await prisma.mod.update({
        where: { id: purchase.mod.id },
        data: {
          sales: { increment: 1 },
          revenue: { increment: purchase.mod.price },
        },
      });

      // Update store stats
      await prisma.store.update({
        where: { id: purchase.mod.storeId },
        data: {
          totalSales: { increment: 1 },
          totalRevenue: { increment: purchase.mod.price },
        },
      });

      // Create notification for creator
      await prisma.notification.create({
        data: {
          userId: purchase.mod.store.userId,
          type: 'SALE',
          title: 'New Sale!',
          message: `Your mod "${purchase.mod.title}" was sold for $${purchase.amount}`,
          data: {
            purchaseId: purchase.id,
            amount: purchase.amount,
            modTitle: purchase.mod.title,
          }
        }
      });

      // Create notification for buyer
      await prisma.notification.create({
        data: {
          userId: purchase.userId,
          type: 'PURCHASE',
          title: 'Purchase Successful!',
          message: `You successfully purchased "${purchase.mod.title}". Download is now available.`,
          data: {
            purchaseId: purchase.id,
            modId: purchase.mod.id,
          }
        }
      });

      // TODO: Process split payment to creator via Paystack Transfer API
      // This would use Paystack's Transfer API to send creatorPayout to creator's account

      res.json({
        success: true,
        message: 'Payment successful',
        data: { 
          purchase,
          downloadUrl: purchase.downloadUrl,
        },
      });
    } else {
      // Payment failed
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          paymentStatus: 'FAILED',
          paystackRef: transaction.reference,
        },
      });

      throw new AppError('Payment failed', 400, 'PAYMENT_FAILED');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's purchase history
 */
export const getPurchaseHistory = async (req, res, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        mod: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            isFree: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: { purchases },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get purchase details
 */
export const getPurchase = async (req, res, next) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: req.params.id },
      include: {
        mod: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            images: true,
            currentVersion: true,
          }
        }
      }
    });

    if (!purchase) {
      throw new AppError('Purchase not found', 404, 'NOT_FOUND');
    }

    if (purchase.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    }

    res.json({
      success: true,
      data: { purchase },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download purchased mod
 */
export const downloadMod = async (req, res, next) => {
  try {
    const { modId } = req.params;

    // Verify purchase
    const purchase = await prisma.purchase.findFirst({
      where: {
        modId,
        userId: req.user.id,
        paymentStatus: 'COMPLETED',
      },
      include: {
        mod: {
          include: {
            versions: {
              where: { isCurrent: true },
            }
          }
        }
      }
    });

    if (!purchase) {
      throw new AppError('Purchase not found or payment not completed', 404, 'NOT_FOUND');
    }

    // Increment download count
    await Promise.all([
      prisma.mod.update({
        where: { id: modId },
        data: { downloads: { increment: 1 } },
      }),
      prisma.modVersion.updateMany({
        where: { modId, isCurrent: true },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    // Return download URL (in production, this would be a signed S3 URL)
    const version = purchase.mod.versions[0];
    
    res.json({
      success: true,
      data: {
        downloadUrl: version?.fileUrl,
        expiresAt: purchase.downloadExpires,
        mod: {
          title: purchase.mod.title,
          version: purchase.mod.currentVersion,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process payout to creator
 */
export const processPayout = async (req, res, next) => {
  try {
    // Admin only endpoint
    if (req.user.role !== 'ADMIN') {
      throw new AppError('Admin access required', 403, 'FORBIDDEN');
    }

    const { storeId, amount } = req.body;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { user: true }
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        storeId,
        amount,
        currency: 'USD',
        status: 'PROCESSING',
        method: 'paystack_transfer',
        accountInfo: {
          email: store.user.email,
        }
      }
    });

    // TODO: Initiate Paystack transfer
    // const transferResponse = await axios.post(
    //   `${config.paystack.baseUrl}/transfer`,
    //   { ... }
    // );

    res.json({
      success: true,
      message: 'Payout initiated',
      data: { payout },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  initializePayment,
  verifyPayment,
  getPurchaseHistory,
  getPurchase,
  downloadMod,
  processPayout,
};
