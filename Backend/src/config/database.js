// ─────────────────────────────────────────────
// PostgreSQL Connection (Sequelize ORM)
//
// • Connection pooling prevents exhausting DB
//   connections under high concurrency.
// • Automatic retry logic with backoff handles
//   transient startup and container delays.
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

    dialectOptions: {
      useUTC: true
    }
  }
);

/**
 * Authenticate and synchronize models with retry mechanism.
 * @param {number} maxRetries Number of connection attempts before failing
 * @param {number} delayMs Delay between attempts in milliseconds
 */
export const connectDB = async (maxRetries = 5, delayMs = 3000) => {
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      await sequelize.authenticate();
      console.log('✓ PostgreSQL connected successfully');

      // In development, sync models cleanly without alter: true (avoids ENUM collision)
      if (config.nodeEnv !== 'production') {
        await sequelize.sync();
        console.log('✓ Database models synchronised');
      }
      return;
    } catch (error) {
      console.error(`✗ Connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${delayMs / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error('✗ Max database connection retries reached. Exiting.');
        process.exit(1);
      }
    }
  }
};

export default sequelize;
