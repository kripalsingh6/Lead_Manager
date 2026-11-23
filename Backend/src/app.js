// ─────────────────────────────────────────────
// Express Application — 7-Layer Defense-in-Depth
//
// 1. Network & HTTP Layer  ──► Helmet (HSTS, CSP, No-Sniff, Clickjacking)
// 2. Traffic Defense       ──► Tiered Rate Limiting
// 3. Origin Control        ──► Strict Whitelist CORS (No '*')
// 4. Auth & Session        ──► HttpOnly SameSite Cookie + JWT
// 5. Payload Defense       ──► Mass-Assignment Rejection + XSS Sanitizer
// 6. Access Control        ──► Anti-IDOR Scoping (Database-level Tenant Check)
// 7. Logging & Auditing    ──► PII Masking & Centralized Safe Error Handler
// ─────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { config } from './config/environment.js';
import routes from './routes/index.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { maskPII } from './utils/sanitizer.js';

const app = express();

// ── Reverse Proxy Trust ───────────────────────
app.set('trust proxy', 1);

// ── 1. Network & HTTP Layer (Strict Helmet) ───
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://accounts.google.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' }
  })
);

// ── 2. Parameter Pollution Protection ─────────
app.use(hpp());

// ── 3. Origin Control (Strict Whitelist CORS) ─
const configuredOrigins = (config.clientUrl || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile/CLI tools or requests without origin
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit whitelist or vercel.app preview/production subdomains
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(new Error(`Strict CORS: Origin ${origin} rejected`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// ── 4. Body & Cookie Parsing ──────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── 5. Compression ────────────────────────────
app.use(compression());

// ── 6. Traffic Defense (Rate Limiting) ────────
app.use('/api', apiLimiter);

// ── 7. Logging & Auditing (PII Masking) ───────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  // Production logging: safe PII-masked format
  morgan.token('masked-body', (req) => {
    return req.body ? JSON.stringify(maskPII(req.body)) : '-';
  });
  app.use(
    morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :masked-body')
  );
}

// ── Root Endpoint ─────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to the Lead Manager API',
    security: '7-Layer Defense-in-Depth Active',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, POST /api/auth/google, GET /api/auth/me',
      leads: 'GET, POST /api/leads | GET, PUT, DELETE /api/leads/:id | GET /api/leads/dashboard/stats'
    }
  });
});

// ── API Routes (Anti-IDOR Scoping inside) ─────
app.use('/api', routes);

// ── Centralized Error & 404 Handlers ──────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
