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

          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://cdnjs.cloudflare.com"
          ],

          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com"
          ],

          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com"
          ],

          imgSrc: [
            "'self'",
            "data:",
            "blob:"
          ],

          connectSrc: [
            "'self'",
            "https:",
            "http://localhost:8080"
          ],

          workerSrc: ["'self'", "blob:"],
          manifestSrc: ["'self'"],

          objectSrc: ["'none'"],
          frameAncestors: ["'none'"]
        }
      }
    }),
    cors({
      origin: process.env.ALLOWED_ORIGIN || '*',
      methods: ['GET', 'POST'],
    }),
  ];
}

module.exports = { securityMiddleware };
