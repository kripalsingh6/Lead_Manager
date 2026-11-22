// ─────────────────────────────────────────────
// Rate Limiting Middleware
//
// Two tiers prevent abuse while keeping the API
// usable for legitimate traffic.
//
// Auth routes are stricter to slow down
// brute-force login/signup attempts.
// ─────────────────────────────────────────────
import rateLimit from 'express-rate-limit';

/** General API — 100 requests per 15-minute window per IP. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/** Auth routes — 20 requests per 15-minute window per IP. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

