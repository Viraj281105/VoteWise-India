const express = require('express');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { generateQuizQuestions } = require('../services/gemini');
const { getQuestions, saveQuestions, flagQuestion, incrementUsage } = require('../services/questionBank');
const { quizGenerateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const TOPICS = {
  easy: ["voter registration", "basic voting rights", "ECI role", "NOTA", "Lok Sabha basics"],
  medium: ["Model Code of Conduct", "EVM and VVPAT", "candidate nomination", "Rajya Sabha elections", "electoral rolls"],
  hard: ["Articles 324-329", "RPA 1951 provisions", "election disputes", "anti-defection law", "by-elections"],
  expert: ["D'Hondt method", "hung parliament process", "coalition politics", "proportional representation", "President's rule and elections"],
  history: ["1952 first election", "1977 Emergency election", "1984 sympathy wave", "2014 BJP majority", "2024 election results"]
};

const generateSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert', 'history']),
  count: z.number().int().min(1).max(10),
  sessionId: z.string().optional()
});

const feedbackSchema = z.object({
  questionId: z.string(),
  wasHelpful: z.boolean(),
  sessionId: z.string().optional()
});

router.post('/generate', quizGenerateLimiter, validate(generateSchema), async (req, res, next) => {
  try {
    const { difficulty, count } = req.validatedBody;
    
    // 1. Try to get questions from cache
    let finalQuestions = await getQuestions(difficulty, count);
    
    // 2. If short, generate the rest
    if (finalQuestions.length < count) {
      const shortfall = count - finalQuestions.length;
      const topicsList = TOPICS[difficulty];
      const topic = topicsList[Math.floor(Math.random() * topicsList.length)];
      
      const generated = await generateQuizQuestions(difficulty, topic, shortfall);
      
      // Save new generated questions asynchronously
      saveQuestions(generated).catch(err => console.error('Error saving generated questions:', err));
      
      finalQuestions = [...finalQuestions, ...generated];
    }

    // 3. Shuffle
    for (let i = finalQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
    }

    // Assign source label
    const source = (finalQuestions.length === count && finalQuestions.every(q => q._docId)) ? 'cached' 
                 : (finalQuestions.every(q => !q._docId)) ? 'generated' 
                 : 'mixed';

    res.json({ questions: finalQuestions, source });
  } catch (error) {
    next(error);
  }
});

router.post('/feedback', validate(feedbackSchema), async (req, res, next) => {
  try {
    const { questionId, wasHelpful } = req.validatedBody;
    
    if (wasHelpful === false) {
      await flagQuestion(questionId);
    } else if (wasHelpful === true) {
      await incrementUsage(questionId);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
