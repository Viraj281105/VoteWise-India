require('dotenv').config();
const express = require('express');
const path = require('path');
const { securityMiddleware } = require('./middleware/security');
const { generalLimiter } = require('./middleware/rateLimiter');
const { initializeFirebase } = require('./config/firebase');

// Route modules
const chatRoutes = require('./routes/chat');
const quizRouter = require('./routes/quiz');
const quizGenerateRouter = require('./routes/quiz-generate');
const translateRouter = require('./routes/translate');


const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Firebase (graceful fallback if creds missing)
initializeFirebase();

// Global security middleware (Helmet + CORS)
securityMiddleware().forEach((mw) => app.use(mw));

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));

// General rate limiter on all API routes
app.use('/api', generalLimiter);

// ── API Routes ──────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRouter);
app.use('/api/quiz', quizGenerateRouter);
app.use('/api/translate', translateRouter);


// ── Health Check (no auth, no rate limit) ───────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Static Files ────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, '../public/manifest.json')));
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(__dirname, '../public/sw.js'));
});

// SPA fallback — serve index.html for all non-API routes
app.get(/^((?!\/(api|data)).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Global Error Handler ────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal server error',
  });
});

// Start server (skip in test mode so Supertest can manage lifecycle)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🗳️  VoteWise India running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
