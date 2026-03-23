/**
 * Error Handler Middleware
 * Centralized error handling for the API
 */

import { config } from '../config/index.js';

export class AppError extends Error {
  constructor(message, statusCode, code = 'APPLICATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists';
    code = 'DUPLICATE_ENTRY';
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    code = 'NOT_FOUND';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
  }

  // Don't leak error details in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred';
  }

  res.status(statusCode).json({
    error: true,
    code,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
