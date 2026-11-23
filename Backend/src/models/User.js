// ─────────────────────────────────────────────
// User Model  (PostgreSQL / Sequelize)
//
// Security & Authentication:
//  • Local auth: Passwords hashed with bcrypt (12 salt rounds)
//  • Google OAuth: Stores googleId, avatar, authProvider
//  • Default scope EXCLUDES password
// ─────────────────────────────────────────────
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

class User extends Model {
  /** Compare a plain-text candidate against the hash (local auth). */
  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  /** Return a JSON representation WITHOUT the password. */
  toSafeObject() {
    const { password, ...safe } = this.toJSON();
    return safe;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name cannot be empty' }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'Email address already in use' },
      validate: {
        isEmail: { msg: 'Must be a valid email address' }
      },
      // Always store lowercase, trimmed
      set(value) {
        if (value) {
          this.setDataValue('email', value.toLowerCase().trim());
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true // Nullable for OAuth users
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: 'google_id'
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    authProvider: {
      type: DataTypes.STRING(20),
      defaultValue: 'local',
      field: 'auth_provider',
      validate: {
        isIn: [['local', 'google']]
      }
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',

    // ── Hooks: auto-hash passwords if provided ─
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    },

    // ── Scopes: control column visibility ─────
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: { attributes: {} } // include everything
    }
  }
);

export default User;
