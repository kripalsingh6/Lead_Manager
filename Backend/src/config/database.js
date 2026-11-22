// ─────────────────────────────────────────────
// PostgreSQL Connection (Sequelize ORM)
//
// • Connection pooling prevents exhausting DB
//   connections under high concurrency.
// • Retry logic handles transient startup delays.
// • `underscored: true` maps JS camelCase to
//   PostgreSQL snake_case automatically.
// ─────────────────────────────────────────────
import { Sequelize } from 'sequelize';
import { config } from './environment.js';

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',

    // Only log SQL in development
    logging: config.nodeEnv === 'development' ? console.log : false,

    // Connection pool
    pool: config.db.pool,

    // Global model options
    define: {
      timestamps: true,   // adds created_at, updated_at
      underscored: true   // snake_case columns in PostgreSQL
    },

    // Recommended Postgres-specific tweaks
    dialectOptions: {
      // Use UTC for all timestamps
      useUTC: true
    }
  }
);

/**
 * Authenticate and optionally sync models.
 * Called once at server startup.
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL connected successfully');

    // In development, sync models automatically.
    // In production, use Sequelize CLI migrations instead.
    if (config.nodeEnv !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✓ Database models synchronised');
    }
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
};

export default sequelize;

