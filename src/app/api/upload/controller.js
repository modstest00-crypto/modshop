/**
 * Upload Controller
 * Handles file uploads to S3/R2 storage
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { AppError } from '../../middleware/errorHandler.js';
import { config } from '../../config/index.js';

const prisma = new PrismaClient();

// Initialize S3 client
const s3Client = new S3Client({
  region: config.storage.region,
  endpoint: config.storage.endpoint,
  credentials: {
    accessKeyId: config.storage.accessKeyId,
    secretAccessKey: config.storage.secretAccessKey,
  },
  forcePathStyle: true, // Required for Cloudflare R2
});

/**
 * Upload mod file
 */
export const uploadModFile = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const file = req.files[0];
    const { modId } = req.body;
    const { version, changelog } = req.body;

    // Get mod and verify ownership
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

    // Generate file key
    const fileExt = file.originalname.split('.').pop();
    const fileKey = `mods/${store.slug}/${mod.slug}/${uuidv4()}.${fileExt}`;

    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Upload to S3/R2
    const uploadCommand = new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        modId: mod.id,
        version: version || '1.0.0',
        uploader: req.user.id,
      },
    });

    await s3Client.send(uploadCommand);

    // Set previous versions to not current
    await prisma.modVersion.updateMany({
      where: { modId: mod.id, isCurrent: true },
      data: { isCurrent: false },
    });

    // Create version record
    const modVersion = await prisma.modVersion.create({
      data: {
        modId: mod.id,
        version: version || mod.currentVersion,
        changelog,
        fileUrl: fileKey,
        fileHash,
        fileSize: BigInt(file.size),
        isCurrent: true,
        isPublished: true,
      },
    });

    // Update mod current version
    await prisma.mod.update({
      where: { id: mod.id },
      data: {
        currentVersion: version || mod.currentVersion,
      },
    });

    // Notify buyers of update
    const purchases = await prisma.purchase.findMany({
      where: { modId: mod.id },
      select: { userId: true }
    });

    const notifications = purchases.map(purchase => ({
      userId: purchase.userId,
      type: 'UPDATE',
      title: 'Mod Updated',
      message: `"${mod.title}" has been updated to version ${version || mod.currentVersion}`,
      data: {
        modId: mod.id,
        modTitle: mod.title,
        version: version || mod.currentVersion,
        changelog,
      }
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        version: modVersion,
        fileKey,
        fileSize: file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload store images (logo, banner)
 */
export const uploadStoreImage = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const file = req.files[0];
    const { type } = req.body; // 'logo' or 'banner'

    const store = await prisma.store.findUnique({
      where: { userId: req.user.id },
    });

    if (!store) {
      throw new AppError('Store not found', 404, 'NOT_FOUND');
    }

    // Generate file key
    const fileExt = file.originalname.split('.').pop();
    const imageType = type === 'banner' ? 'banners' : 'logos';
    const fileKey = `stores/${store.slug}/${imageType}/${uuidv4()}.${fileExt}`;

    // Upload to S3/R2
    const uploadCommand = new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const publicUrl = `${config.storage.endpoint}/${config.storage.bucket}/${fileKey}`;

    // Update store
    const updateField = type === 'banner' ? 'banner' : 'logo';
    await prisma.store.update({
      where: { id: store.id },
      data: { [updateField]: publicUrl },
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: publicUrl,
        type: updateField,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload mod images
 */
export const uploadModImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No file uploaded', 400, 'NO_FILE');
    }

    const { modId } = req.body;

    // Get mod and verify ownership
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

    // Upload all images
    const uploadedUrls = [];
    
    for (const file of req.files) {
      const fileExt = file.originalname.split('.').pop();
      const fileKey = `mods/${store.slug}/${mod.slug}/images/${uuidv4()}.${fileExt}`;

      const uploadCommand = new PutObjectCommand({
        Bucket: config.storage.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(uploadCommand);

      const publicUrl = `${config.storage.endpoint}/${config.storage.bucket}/${fileKey}`;
      uploadedUrls.push(publicUrl);
    }

    // Update mod images
    const updatedMod = await prisma.mod.update({
      where: { id: mod.id },
      data: {
        images: {
          push: uploadedUrls,
        },
      },
    });

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        urls: uploadedUrls,
        totalImages: updatedMod.images.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate signed download URL
 */
export const generateSignedUrl = async (req, res, next) => {
  try {
    const { fileKey } = req.body;

    if (!fileKey) {
      throw new AppError('File key required', 400, 'VALIDATION_ERROR');
    }

    // Verify user has access to this file
    const file = await prisma.modVersion.findFirst({
      where: { fileUrl: fileKey },
      include: {
        mod: {
          include: {
            purchases: {
              where: { userId: req.user.id, paymentStatus: 'COMPLETED' },
            }
          }
        }
      }
    });

    if (!file) {
      throw new AppError('File not found', 404, 'NOT_FOUND');
    }

    if (file.mod.purchases.length === 0 && req.user.role !== 'ADMIN') {
      throw new AppError('You do not have access to this file', 403, 'FORBIDDEN');
    }

    // Generate signed URL (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: config.storage.bucket,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    res.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete file
 */
export const deleteFile = async (req, res, next) => {
  try {
    const { fileKey } = req.body;

    if (!fileKey) {
      throw new AppError('File key required', 400, 'VALIDATION_ERROR');
    }

    // Delete from S3/R2
    const command = new DeleteObjectCommand({
      Bucket: config.storage.bucket,
      Key: fileKey,
    });

    await s3Client.send(command);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadModFile,
  uploadStoreImage,
  uploadModImages,
  generateSignedUrl,
  deleteFile,
};
