const { chat } = require('../src/services/gemini');
const { saveChatSession } = require('../src/services/firestore');
const { chatSchema } = require('../src/middleware/validate');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate environment
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'AI service temporarily unavailable' });
  }

  try {
    const result = chatSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }

    const { message, sessionId } = result.data;
    const { reply, tokensUsed } = await chat(message);

    // Fire-and-forget: log conversation to Firestore
    saveChatSession(sessionId, message, reply).catch((err) => {
      console.error('Failed to save chat session:', err.message);
    });

    res.status(200).json({ reply, tokensUsed });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
