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

const dialectOptions = {
  useUTC: true,
  ...(config.dbUrl || process.env.DB_SSL === 'true'
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {})
};

const sequelize = config.dbUrl
  ? new Sequelize(config.dbUrl, {
      dialect: 'postgres',
      logging: config.nodeEnv === 'development' ? console.log : false,
      pool: config.db.pool,
      define: {
        timestamps: true,
        underscored: true
      },
      dialectOptions
    })
  : new Sequelize(
      config.db.name,
      config.db.user,
      config.db.password,
      {
        host: config.db.host,
        port: config.db.port,
        dialect: 'postgres',
        logging: config.nodeEnv === 'development' ? console.log : false,
        pool: config.db.pool,
        define: {
          timestamps: true,
          underscored: true
        },
        dialectOptions
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

      // Synchronize database tables (creates users and leads tables if not exist)
      await sequelize.sync();
      console.log('✓ Database models synchronised');
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
