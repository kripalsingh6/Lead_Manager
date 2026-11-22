// ─────────────────────────────────────────────
// Lead Model  (PostgreSQL / Sequelize)
//
// Schema maps directly to the assignment:
//   name, email, phone, company, source, status
//
// Performance indexes:
//   • (user_id, status)       — fast filter by status per user
//   • (user_id, created_at)   — fast default sort (newest first)
//   • (user_id, email)        — fast duplicate-email checks per user
//
// ENUMs enforce valid values at the database layer,
// providing a second barrier after Joi validation.
// ─────────────────────────────────────────────
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

// ── Allowed values (shared with validators) ───
export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
export const LEAD_SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Advertisement', 'Other'];

class Lead extends Model {}

Lead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: { model: 'users', key: 'id' }
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Lead name cannot be empty' }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: { msg: 'Must be a valid email address' }
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: ''
    },
    company: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    source: {
      type: DataTypes.ENUM(...LEAD_SOURCES),
      defaultValue: 'Other',
      validate: { isIn: [LEAD_SOURCES] }
    },
    status: {
      type: DataTypes.ENUM(...LEAD_STATUSES),
      defaultValue: 'New',
      validate: { isIn: [LEAD_STATUSES] }
    }
  },
  {
    sequelize,
    modelName: 'Lead',
    tableName: 'leads',

    // ── Performance indexes ────────────────────
    indexes: [
      {
        name: 'idx_leads_user_status',
        fields: ['user_id', 'status']
      },
      {
        name: 'idx_leads_user_created',
        fields: ['user_id', { attribute: 'created_at', order: 'DESC' }]
      },
      {
        name: 'idx_leads_user_email',
        fields: ['user_id', 'email']
      }
    ]
  }
);

export default Lead;

