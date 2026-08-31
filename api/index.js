let app;
let initError = null;

try {
  app = require('../server/server');
} catch (err) {
  initError = err;
  console.error('Failed to load Express app in api/index.js:', err);
}

module.exports = (req, res) => {
  if (initError || !app) {
    return res.status(500).json({
      success: false,
      error: 'Server failed to initialize',
      message: initError ? initError.message : 'App not initialized',
      stack: initError ? initError.stack : null,
    });
  }

  // Ensure route starts with /api so Express routes match correctly in Vercel serverless
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('Unhandled request error in api/index.js:', err);
    return res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
};
