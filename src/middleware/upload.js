/**
 * Upload Middleware
 * Handles file uploads with multer and S3/R2 storage
 */

import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

// Memory storage for S3 upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (config.platform.allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${ext} not allowed. Allowed types: ${config.platform.allowedFileTypes.join(', ')}`, 400, 'INVALID_FILE_TYPE'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.platform.maxFileSize,
    files: 10, // Max 10 files per request
  },
});

/**
 * Generate unique filename for S3
 */
export const generateS3Key = (userId, file) => {
  const ext = path.extname(file.originalname);
  const filename = `${uuidv4()}${ext}`;
  const date = new Date().toISOString().split('T')[0];
  
  return `uploads/${userId}/${date}/${filename}`;
};

/**
 * Validate file upload
 */
export const validateUpload = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('No file uploaded', 400, 'NO_FILE'));
  }

  // Check total size
  const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
  if (totalSize > config.platform.maxFileSize * 10) {
    return next(new AppError(`Total file size exceeds limit of ${config.platform.maxFileSize / 1024 / 1024}MB`, 400, 'FILE_TOO_LARGE'));
  }

  next();
};

export default upload;
