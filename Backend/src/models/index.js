// ─────────────────────────────────────────────
// Model Registry & Associations
//
// Imports every model, defines foreign-key
// relationships, and re-exports them alongside
// the Sequelize instance for use across the app.
// ─────────────────────────────────────────────
import sequelize from '../config/database.js';
import User from './User.js';
import Lead from './Lead.js';

// ── Associations ──────────────────────────────
// A user has many leads; deleting a user cascades
// to all their leads (data isolation).
User.hasMany(Lead, {
  foreignKey: 'userId',
  as: 'leads',
  onDelete: 'CASCADE',
  hooks: true
});

Lead.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export { sequelize, User, Lead };

