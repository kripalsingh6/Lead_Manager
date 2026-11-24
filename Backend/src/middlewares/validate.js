// ─────────────────────────────────────────────
// Joi Validation Middleware Factory (Strict Mode)
//
// Implements Layer 5 Payload Defense:
//  • Strict mass-assignment protection (rejects unknown fields)
//  • Express 5 getter-safe property definition
// ─────────────────────────────────────────────
import ApiError from '../utils/ApiError.js';

/**
 * @param {import('joi').ObjectSchema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    // stripUnknown: false + allowUnknown: false ensures strict schema compliance
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: false,
      allowUnknown: false
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      const primaryMsg = errors[0]?.message || 'Validation failed: strict payload verification';
      throw ApiError.badRequest(primaryMsg, errors);
    }

    // Safely replace validated and coerced values in Express 5
    Object.defineProperty(req, source, {
      value,
      writable: true,
      configurable: true,
      enumerable: true
    });

    next();
  };
};

export default validate;
