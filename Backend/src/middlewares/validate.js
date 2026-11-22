// ─────────────────────────────────────────────
// Joi Validation Middleware Factory
//
// Returns an Express middleware that validates
// `req[source]` (body, query, or params) against
// the given Joi schema.
//
// • `abortEarly: false` → returns ALL errors
// • `stripUnknown: true` → drops extra fields
//   (prevents mass-assignment attacks)
// ─────────────────────────────────────────────
import ApiError from '../utils/ApiError.js';

/**
 * @param {import('joi').ObjectSchema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      throw ApiError.badRequest('Validation failed', errors);
    }

    // Replace with sanitised/coerced values
    req[source] = value;
    next();
  };
};

export default validate;

