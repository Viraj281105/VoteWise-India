const { z } = require('zod');

/** Schema for POST /api/chat */
const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(500, 'Message too long (max 500 chars)'),
  sessionId: z.string().uuid('Invalid session ID format'),
});

/** Schema for POST /api/quiz/submit */
const quizSubmitSchema = z.object({
  sessionId: z.string().uuid({ message: 'Invalid session ID format' }),
  score: z.number().int().min(0).max(30, 'Score cannot exceed 30'),
  total: z.number().int().min(1).max(30),
  answers: z.array(
    z.object({
      questionId: z.number().int(),
      selected: z.number().int(),
      correct: z.boolean(),
    })
  ).max(30),
});

/** Schema for POST /api/translate */
const translateSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text too long (max 5000 chars)'),
  targetLang: z.enum(['hi', 'ta', 'te', 'bn'], { message: 'Unsupported language' }),
});



/**
 * Express middleware factory that validates req.body against a Zod schema.
 * Sets req.validatedBody on success; returns 400 with details on failure.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = { chatSchema, quizSubmitSchema, translateSchema, validate };
