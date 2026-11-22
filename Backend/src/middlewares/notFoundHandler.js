// ─────────────────────────────────────────────
// 404 Not Found Handler
//
// Catches any request that did not match a
// registered route and returns a helpful JSON
// response instead of Express's default HTML.
// ─────────────────────────────────────────────

export const notFoundHandler = (_req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route ${_req.method} ${_req.originalUrl} not found`
  });
};
