const express = require('express');
const NodeCache = require('node-cache');
const { validate, quizSubmitSchema } = require('../middleware/validate');
const { saveQuizScore, getLeaderboard, calculatePercentile } = require('../services/firestore');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 });

/** POST /api/quiz/submit — Save score and return percentile */
router.post('/submit', validate(quizSubmitSchema), async (req, res) => {
  try {
    const { sessionId, score, total, answers } = req.validatedBody;
    await saveQuizScore(sessionId, score, total, answers);
    const { percentile, rank } = await calculatePercentile(score);
    cache.del('leaderboard'); // bust cache on new submission
    res.json({ saved: true, percentile, rank });
  } catch (error) {
    console.error('Quiz submit error:', error.message);
    res.status(500).json({ error: 'Failed to save quiz score' });
  }
});

/** GET /api/quiz/leaderboard — Top 10 scores, cached for 60s */
router.get('/leaderboard', async (req, res) => {
  try {
    const cached = cache.get('leaderboard');
    if (cached) return res.json({ leaderboard: cached });

    const leaderboard = await getLeaderboard(10);
    cache.set('leaderboard', leaderboard);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
