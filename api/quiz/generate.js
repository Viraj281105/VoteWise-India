const { z } = require('zod');
const { generateQuizQuestions } = require('../../src/services/gemini');
const { getQuestions, saveQuestions } = require('../../src/services/questionBank');

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'AI service temporarily unavailable' });
  }

  try {
    const result = generateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }

    const { difficulty, count } = result.data;
    
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

    res.status(200).json({ questions: finalQuestions, source });
  } catch (error) {
    console.error('Quiz generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
}
