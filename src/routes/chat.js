const express = require('express');
const { validate, chatSchema } = require('../middleware/validate');
const { chatLimiter } = require('../middleware/rateLimiter');
const { chat } = require('../services/gemini');
const { saveChatSession } = require('../services/firestore');

const router = express.Router();

/** POST /api/chat — Send a message to Gemini, log to Firestore */
router.post('/', chatLimiter, validate(chatSchema), async (req, res) => {
  try {
    const { message, sessionId } = req.validatedBody;
    const { reply, tokensUsed } = await chat(message);

    // Fire-and-forget: log conversation to Firestore
    saveChatSession(sessionId, message, reply).catch((err) => {
      console.error('Failed to save chat session:', err.message);
    });

    res.json({ reply, tokensUsed });
  } catch (error) {
    console.error('Chat error:', error.message);
    if (error.message?.includes('API key') || error.message?.includes('not configured')) {
      return res.status(503).json({ error: 'AI service temporarily unavailable' });
    }
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router;
