// ─────────────────────────────────────────────
// Health Controller
//
// Reports server uptime and PostgreSQL connectivity.
// Useful for load-balancer health probes.
// ─────────────────────────────────────────────
import sequelize from '../config/database.js';

export const getHealthStatus = async (_req, res) => {
  let dbStatus = 'disconnected';

  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  res.status(dbStatus === 'connected' ? 200 : 503).json({
    success: dbStatus === 'connected',
    message: 'Lead Manager API',
    environment: process.env.NODE_ENV,
    database: dbStatus,
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString()
  });
};
