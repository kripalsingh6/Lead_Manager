// ─────────────────────────────────────────────
// Server Entry Point
//
// 1. Connects to PostgreSQL
// 2. Starts the HTTP server
// 3. Handles graceful shutdown (SIGTERM / SIGINT)
//    — closes HTTP listener, drains the DB pool
// ─────────────────────────────────────────────
import app from './app.js';
import { config } from './config/environment.js';
import { connectDB } from './config/database.js';
import sequelize from './config/database.js';

const startServer = async () => {
  // Connect to PostgreSQL first
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`\n🚀  Server running in ${config.nodeEnv} mode`);
    console.log(`    http://localhost:${config.port}\n`);
  });

  // ── Graceful shutdown ──────────────────────
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);

    server.close(async () => {
      console.log('✓ HTTP server closed');

      try {
        await sequelize.close();
        console.log('✓ Database connection pool drained');
      } catch (err) {
        console.error('✗ Error closing DB pool:', err.message);
      }

      process.exit(0);
    });

    // Force exit if graceful shutdown stalls
    setTimeout(() => {
      console.error('Forced exit — shutdown timed out');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();
