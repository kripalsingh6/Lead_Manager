// ─────────────────────────────────────────────
// Security Sanitizer & PII Masking Utilities
// ─────────────────────────────────────────────

/**
 * Sanitizes input strings by escaping dangerous HTML characters to prevent XSS.
 * @param {any} input
 * @returns {any}
 */
export const sanitizeXSS = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeXSS);
  }
  if (input !== null && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeXSS(value);
    }
    return sanitized;
  }
  return input;
};

/**
 * Masks sensitive PII fields (passwords, tokens, secrets) before logging.
 * @param {object} body
 * @returns {object}
 */
export const maskPII = (body) => {
  if (!body || typeof body !== 'object') return body;

  const SENSITIVE_KEYS = [
    'password',
    'token',
    'idtoken',
    'id_token',
    'secret',
    'clientsecret',
    'client_secret',
    'authorization'
  ];

  const masked = { ...body };
  for (const key of Object.keys(masked)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object' && masked[key] !== null) {
      masked[key] = maskPII(masked[key]);
    }
  }
  return masked;
};

