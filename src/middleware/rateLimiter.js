const rateLimit = require('express-rate-limit');

/** 10 req/min — for Gemini chat to control API costs */
const chatLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { error: 'Too many chat requests. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** 30 req/min — for Google Translate */
const translateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  message: { error: 'Too many translation requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});



/** 100 req/min — general API rate limit */
const generalLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const quizGenerateLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  message: { error: 'Too many quiz generation requests, please wait.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { chatLimiter, translateLimiter, generalLimiter, quizGenerateLimiter };
