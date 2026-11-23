// ─────────────────────────────────────────────
// Centralised Error Handler
//
// Catches every error (thrown or rejected) and
// sends a uniform JSON response.
//
// Handles:
//  • Our own ApiError instances
//  • Sequelize validation / unique-constraint /
//    foreign-key / general DB errors
//  • PostgreSQL syntax/UUID format error (22P02)
//  • JWT errors (caught in auth middleware)
//  • Unknown / programming errors (500)
// ─────────────────────────────────────────────
import { config } from '../config/environment.js';

// eslint-disable-next-line no-unused-vars -- Express requires 4 params
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message || 'Internal Server Error';
  let errors     = err.errors || [];

  // ── Sequelize-specific error mapping ────────
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate entry';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Referenced resource does not exist';
  }

  if (err.name === 'SequelizeDatabaseError') {
    // Check for PostgreSQL 22P02: invalid input syntax for type uuid / int
    if (err.original && err.original.code === '22P02') {
      statusCode = 400;
      message = 'Invalid input format for identifier';
    } else {
      statusCode = 500;
      message = 'A database error occurred';
    }
  }

  // ── Build response ──────────────────────────
  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors })
  };

  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
    console.error('ERROR →', err);
  }

  res.status(statusCode).json(response);
};
