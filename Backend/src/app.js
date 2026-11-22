// ─────────────────────────────────────────────
// Express Application
//
// Assembles the middleware stack in the correct
// order:
//
//  1. Security headers (helmet)
//  2. HTTP parameter pollution protection (hpp)
//  3. CORS
//  4. Body parsing (with 10 KB limit)
//  5. Response compression
//  6. Request logging
//  7. Rate limiting
//  8. Routes
//  9. 404 & error handlers
// ─────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import { config } from './config/environment.js';
import routes from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// ── 1. Security headers ──────────────────────
app.use(helmet());

// ── 2. Prevent HTTP parameter pollution ──────
app.use(hpp());

// ── 3. CORS ──────────────────────────────────
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── 4. Body parsing (limit protects against payload bombs) ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 5. Compress responses ────────────────────
app.use(compression());

// ── 6. Logging ───────────────────────────────
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// ── 7. Rate limiting on /api ─────────────────
app.use('/api', apiLimiter);

// ── Root endpoint ────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to the Lead Manager API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      leads: '/api/leads'
    }
  });
});

// ── 8. API routes ────────────────────────────
app.use('/api', routes);

// ── 9. Error handling ────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
