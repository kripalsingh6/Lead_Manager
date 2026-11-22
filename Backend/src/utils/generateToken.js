// ─────────────────────────────────────────────
// JWT Token Utilities
// ─────────────────────────────────────────────
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';

/**
 * Sign a JWT containing the user's ID.
 * @param {string} userId - UUID of the user
 * @returns {string} Signed JWT
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

/**
 * Verify and decode a JWT.
 * @param {string} token - JWT string
 * @returns {object} Decoded payload ({ id, iat, exp })
 */
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

