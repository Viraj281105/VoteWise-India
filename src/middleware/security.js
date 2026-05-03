const helmet = require('helmet');
const cors = require('cors');

/**
 * Returns an array of security middleware to apply globally.
 * Includes Helmet (CSP, HSTS, X-Frame-Options) and CORS.
 */
function securityMiddleware() {
  return [
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://www.gstatic.com", "https://fonts.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'"],
          imgSrc: ["'self'", "data:"],
          mediaSrc: ["'self'", "blob:", "data:"],
        },
      },
    }),
    cors({
      origin: process.env.ALLOWED_ORIGIN || '*',
      methods: ['GET', 'POST'],
    }),
  ];
}

module.exports = { securityMiddleware };
