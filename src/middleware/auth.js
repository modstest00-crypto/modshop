/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler.js';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : req.cookies?.token;

    if (!token) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        store: {
          select: {
            id: true,
            slug: true,
            subscription: true,
            isActive: true,
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require specific role(s)
 * Usage: requireRole('CREATOR'), requireRole(['CREATOR', 'ADMIN'])
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403, 'FORBIDDEN'));
    }

    next();
  };
};

/**
 * Check if user owns a resource
 * Usage: checkOwnership('store', 'storeId')
 */
export const checkOwnership = (model, field) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const id = req.params[field] || req.body[field];
      
      if (!id) {
        throw new AppError('Resource ID required', 400, 'MISSING_ID');
      }

      // Admin can access everything
      if (req.user.role === 'ADMIN') {
        return next();
      }

      let resource;
      switch (model) {
        case 'store':
          resource = await prisma.store.findUnique({ where: { id } });
          break;
        case 'mod':
          resource = await prisma.mod.findUnique({ where: { id } });
          break;
        default:
          throw new AppError('Invalid model', 500, 'INVALID_MODEL');
      }

      if (!resource) {
        throw new AppError('Resource not found', 404, 'NOT_FOUND');
      }

      if (resource.userId !== req.user.id && resource.creatorId !== req.user.id) {
        throw new AppError('You do not own this resource', 403, 'FORBIDDEN');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication - attaches user if token is valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatar: true,
          role: true,
          store: {
            select: {
              id: true,
              slug: true,
              subscription: true,
            }
          }
        }
      });

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  
  next();
};

export default authenticate;
