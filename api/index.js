const app = require('../server/server');

module.exports = (req, res) => {
  // Ensure route starts with /api so Express routes match correctly in Vercel serverless
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};
