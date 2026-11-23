// ─────────────────────────────────────────────
// Lead Validators  (Joi schemas)
//
// Schemas:
//  • createLeadSchema — POST (name + email required)
//  • updateLeadSchema — PUT  (at least one field)
//  • queryLeadsSchema — GET  (pagination, search, filter, sort)
//  • idParamSchema    — :id  (validates UUID format)
// ─────────────────────────────────────────────
import Joi from 'joi';
import { LEAD_STATUSES, LEAD_SOURCES } from '../models/Lead.js';

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid lead ID format: must be a valid UUID',
    'any.required': 'Lead ID is required'
  })
});

export const createLeadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).required().messages({
    'string.empty': 'Lead name is required',
    'any.required': 'Lead name is required'
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().trim().max(20).allow('').optional(),
  company: Joi.string().trim().max(200).allow('').optional(),
  source: Joi.string()
    .valid(...LEAD_SOURCES)
    .optional()
    .messages({ 'any.only': `Source must be one of: ${LEAD_SOURCES.join(', ')}` }),
  status: Joi.string()
    .valid(...LEAD_STATUSES)
    .optional()
    .messages({ 'any.only': `Status must be one of: ${LEAD_STATUSES.join(', ')}` })
});

export const updateLeadSchema = Joi.object({
  name: Joi.string().trim().min(1).max(150).optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string().trim().max(20).allow('').optional(),
  company: Joi.string().trim().max(200).allow('').optional(),
  source: Joi.string()
    .valid(...LEAD_SOURCES)
    .optional()
    .messages({ 'any.only': `Source must be one of: ${LEAD_SOURCES.join(', ')}` }),
  status: Joi.string()
    .valid(...LEAD_STATUSES)
    .optional()
    .messages({ 'any.only': `Status must be one of: ${LEAD_STATUSES.join(', ')}` })
}).min(1).messages({
  'object.min': 'At least one field is required for update'
});

export const queryLeadsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).allow('').optional(),
  status: Joi.string().valid(...LEAD_STATUSES).optional(),
  source: Joi.string().valid(...LEAD_SOURCES).optional(),
  timeRange: Joi.string().valid('all', 'today', '7d', '30d').default('all'),
  sortBy: Joi.string()
    .valid('createdAt', 'name', 'email', 'company', 'status', 'source')
    .default('createdAt'),
  order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC')
});
