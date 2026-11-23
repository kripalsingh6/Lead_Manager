// ─────────────────────────────────────────────
// Auth Routes  —  /api/auth/*
// ─────────────────────────────────────────────
import express from 'express';
import {
  register,
  login,
  logout,
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
router.post('/logout',   logout);
router.get('/me',        protect,                               getMe);

// ── Google OAuth 2.0 ───────────────────────────
router.post('/google',   authLimiter, validate(googleAuthSchema), googleAuth);
router.get('/google',    getGoogleAuthUrl);
router.get('/google/callback', googleAuthCallback);

export default router;
