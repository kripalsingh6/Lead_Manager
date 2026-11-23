// ─────────────────────────────────────────────
// Auth Validators  (Joi schemas)
//
// Declarative validation with human-readable
// error messages.
// ─────────────────────────────────────────────
import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password must not exceed 128 characters',
    'any.required': 'Password is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const googleAuthSchema = Joi.object({
  idToken: Joi.string().optional(),
  code: Joi.string().optional()
}).or('idToken', 'code').messages({
  'object.missing': 'Either idToken or authorization code is required'
});
