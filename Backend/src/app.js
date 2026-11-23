// ─────────────────────────────────────────────
// Express Application
//
// Assembles the middleware stack in the correct
// order:
//
//  1. Reverse proxy trust (for accurate rate-limiting)
//  2. Security headers (helmet)
//  3. HTTP parameter pollution protection (hpp)
//  4. CORS (flexible for local development)
//  5. Body parsing (with 10 KB limit)
//  6. Response compression
//  7. Request logging
//  8. Rate limiting
//  9. Routes
//  10. 404 & error handlers
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

// ── 1. Trust Reverse Proxy (Render, Railway, Heroku, Nginx) ─
app.set('trust proxy', 1);

// ── 2. Security headers ──────────────────────
app.use(helmet());

// ── 3. Prevent HTTP parameter pollution ──────
app.use(hpp());

// ── 4. CORS ──────────────────────────────────
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser tools (e.g. Postman, curl) or matched dev origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── 5. Body parsing (limit protects against payload bombs) ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── 6. Compress responses ────────────────────
app.use(compression());

// ── 7. Logging ───────────────────────────────
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// ── 8. Rate limiting on /api ─────────────────
app.use('/api', apiLimiter);

// ── Root endpoint ────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to the Lead Manager API',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/register, POST /api/auth/login, GET /api/auth/me',
      leads: 'GET, POST /api/leads | GET, PUT, DELETE /api/leads/:id | GET /api/leads/dashboard/stats (requires Bearer token)'
    }
  });
});

// ── 9. API routes ────────────────────────────
app.use('/api', routes);

// ── 10. Error handling ───────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
