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
  clientUrl: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',

  // ── PostgreSQL ──────────────────────────────
  dbUrl: process.env.DATABASE_URL || '',
  db: {
    host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.PGPORT, 10) || 5432,
    name: process.env.DB_NAME || process.env.PGDATABASE || 'lead_manager',
    user: process.env.DB_USER || process.env.PGUSER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',

    // Connection pool — sized for concurrent users
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,
      acquire: 30000, // ms to wait for a free connection
      idle: 10000     // ms before an idle connection is released
    }
  },

  // ── JWT (Short-lived Access Token - Layer 4) 
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    cookieMaxAgeMs: parseInt(process.env.JWT_COOKIE_MAX_AGE_MS, 10) || 15 * 60 * 1000 // 15 minutes default
  },

  // ── Google OAuth ────────────────────────────
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  }
};
