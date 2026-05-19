import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest, ApiResponse, JwtPayload } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError, AuthError, NotFoundError } from '../utils/AppError';

/**
 * Generate JWT token for a user.
 */
const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with this email already exists', 409);
  }

  const user = await User.create({ name, email, password, role });

  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return token
 * @access  Public
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AuthError('Invalid email or password');
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthError('Invalid email or password');
  }

  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  if (!req.user) {
    throw new AuthError('Authentication required');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});
