// ─────────────────────────────────────────────
// JWT Authentication Middleware
//
// Protects routes by:
//  1. Extracting the Bearer token from the
//     Authorization header.
//  2. Verifying the JWT signature and expiry.
//  3. Fetching the user from the database.
//  4. Attaching `req.user` for downstream use.
// ─────────────────────────────────────────────
import { verifyToken } from '../utils/generateToken.js';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, _res, next) => {
  // 1. Extract token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify & decode
  try {
    const decoded = verifyToken(token);

    // 3. Confirm user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User belonging to this token no longer exists.');
    }

    // 4. Attach to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired. Please log in again.');
    }
    throw error;
  }
});

export default protect;

