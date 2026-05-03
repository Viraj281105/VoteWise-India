const { z } = require('zod');
const { flagQuestion, incrementUsage } = require('../../src/services/questionBank');

const feedbackSchema = z.object({
  questionId: z.string(),
  wasHelpful: z.boolean(),
  sessionId: z.string().optional()
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = feedbackSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }

    const { questionId, wasHelpful } = result.data;
    
    if (wasHelpful === false) {
      await flagQuestion(questionId);
    } else if (wasHelpful === true) {
      await incrementUsage(questionId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Feedback error:', error.message);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
}
