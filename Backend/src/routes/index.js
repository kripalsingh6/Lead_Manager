// ─────────────────────────────────────────────
// Route Aggregator
//
// Mounts every feature-route under /api:
//   /api/auth/*    — authentication
//   /api/leads/*   — lead management
//   /api/health    — health probe
// ─────────────────────────────────────────────
import express from 'express';
import authRoutes from './authRoutes.js';
import leadRoutes from './leadRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = express.Router();

router.use('/auth',   authRoutes);
router.use('/leads',  leadRoutes);
router.use('/health', healthRoutes);

export default router;
