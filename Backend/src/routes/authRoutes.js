// ─────────────────────────────────────────────
// Auth Routes  —  /api/auth/*
// ─────────────────────────────────────────────
import express from 'express';
import {
  register,
  login,
  getMe,
  googleAuth,
  getGoogleAuthUrl,
  googleAuthCallback
} from '../controllers/authController.js';
import protect from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  googleAuthSchema
} from '../validators/authValidator.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// ── Local Authentication ───────────────────────
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.get('/me',        protect,                               getMe);

// ── Google OAuth 2.0 ───────────────────────────
// POST /api/auth/google — authenticate with idToken / code (Single Page App / React Google Button)
router.post('/google', authLimiter, validate(googleAuthSchema), googleAuth);

// GET /api/auth/google — get Google OAuth authorization URL for redirect flow
router.get('/google', getGoogleAuthUrl);

// GET /api/auth/google/callback — Google OAuth redirect callback
router.get('/google/callback', googleAuthCallback);

export default router;
