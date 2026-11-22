// ─────────────────────────────────────────────
// Environment Configuration
// Centralises all env vars with safe defaults.
// ─────────────────────────────────────────────
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // ── Server ──────────────────────────────────
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // ── PostgreSQL ──────────────────────────────
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'lead_manager',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',

    // Connection pool — sized for concurrent users
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      acquire: 30000, // ms to wait for a free connection
      idle: 10000     // ms before an idle connection is released
    }
  },

  // ── JWT ─────────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};
