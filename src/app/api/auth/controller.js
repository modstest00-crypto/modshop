/**
 * Auth Controller
 * Handles user registration, login, and authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Validate input
    if (!email || !password || !username) {
      throw new AppError('Email, password, and username are required', 400, 'VALIDATION_ERROR');
    }

    // Check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      throw new AppError('Email or username already exists', 409, 'DUPLICATE_ENTRY');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username: username.toLowerCase(),
        displayName: displayName || username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate token
    const token = generateToken(user.id);

    // Get user data with store info
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
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
            name: true,
            subscription: true,
            isActive: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            logo: true,
            banner: true,
            subscription: true,
            isActive: true,
            totalSales: true,
            totalRevenue: true,
          }
        },
        _count: {
          select: {
            mods: true,
            purchases: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        displayName,
        bio,
        avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new password are required', 400, 'VALIDATION_ERROR');
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete account
 */
export const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  me,
  updateProfile,
  changePassword,
  deleteAccount,
};
