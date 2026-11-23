// ─────────────────────────────────────────────
// JWT Authentication Middleware (Dual Token Defense)
//
// Layer 4 Defense:
//  1. Inspects secure HttpOnly SameSite cookie first
//  2. Falls back to Bearer token in Authorization header
//  3. Verifies signature & expiry
//  4. Hydrates req.user for downstream tenant scoping
// ─────────────────────────────────────────────
import { verifyToken } from '../utils/generateToken.js';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const protect = asyncHandler(async (req, _res, next) => {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fall back to Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Authentication required: please log in or provide a valid token');
  }

  // 3. Verify & decode
  try {
    const decoded = verifyToken(token);

    // 4. Confirm user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('User session invalid: user account no longer exists');
    }

    // 5. Attach user to request for Anti-IDOR scoping
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid or malformed authentication token');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session has expired: please log in again');
    }
    throw error;
  }
});

export default protect;
