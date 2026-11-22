// ─────────────────────────────────────────────
// User Model  (PostgreSQL / Sequelize)
//
// Security:
//  • Passwords hashed with bcrypt (12 salt rounds)
//    via beforeCreate / beforeUpdate hooks.
//  • Default scope EXCLUDES the password column
//    so it never leaks into API responses.
//  • `withPassword` scope used only during login.
// ─────────────────────────────────────────────
import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';

class User extends Model {
  /** Compare a plain-text candidate against the hash. */
  async comparePassword(candidatePassword) {
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
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',

    // ── Hooks: auto-hash passwords ────────────
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
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

