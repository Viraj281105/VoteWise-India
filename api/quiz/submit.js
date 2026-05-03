const { quizSubmitSchema } = require('../../src/middleware/validate');
const { saveQuizScore, calculatePercentile } = require('../../src/services/firestore');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = quizSubmitSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }

    const { sessionId, score, total, answers } = result.data;
    await saveQuizScore(sessionId, score, total, answers);
    const { percentile, rank } = await calculatePercentile(score);
    
    res.status(200).json({ saved: true, percentile, rank });
  } catch (error) {
    console.error('Quiz submit error:', error.message);
    res.status(500).json({ error: 'Failed to save quiz score' });
  }
}
