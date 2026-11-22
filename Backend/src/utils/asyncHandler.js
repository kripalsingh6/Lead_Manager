// ─────────────────────────────────────────────
// Async Handler Wrapper
//
// Wraps an async route handler so that any
// rejected promise is forwarded to Express's
// error-handling middleware automatically.
//
// Usage:  router.get('/', asyncHandler(async (req, res) => { ... }));
// ─────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;

