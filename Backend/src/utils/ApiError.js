// ─────────────────────────────────────────────
// Custom API Error
//
// Extends Error with an HTTP status code and an
// optional `errors` array for validation details.
// Static factory methods keep controller code
// clean:  throw ApiError.notFound('Lead not found');
// ─────────────────────────────────────────────

class ApiError extends Error {
  /**
   * @param {number} statusCode  - HTTP status code
   * @param {string} message     - Human-readable error message
   * @param {Array}  errors      - Optional field-level validation errors
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguishes from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory helpers ───────────────────────────

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  static tooMany(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

export default ApiError;

