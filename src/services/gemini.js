const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/** System prompt scoping VoteWise to Indian election topics only */
const SYSTEM_PROMPT = `You are VoteWise, an expert on Indian elections, the Representation of the People Act 1951, Election Commission of India processes, and Indian constitutional articles related to elections (324-329). 
Answer only election-related questions. If asked anything unrelated, politely redirect. 
Always cite the relevant law, Article numbers, or RPA 1951 sections when relevant. 
Keep answers under 150 words unless the user explicitly asks for detail.
Historical Context to use:
- 1951-52: First General Election, INC wins 364/489, Nehru becomes PM.
- 1971: Indira Gandhi landslide, 'Garibi Hatao'.
- 1977: First non-Congress government (Janata Party) after Emergency.
- 1984: Rajiv Gandhi 414/542 seats (highest ever) after Indira's assassination.
- 1989-1999: Coalition era, 3 elections in 3 years.
- 2014: BJP 282/543, first single majority in 30 years.
- 2024: BJP 240 seats (below majority), NDA coalition, Modi third term.
EVM Context to use:
- EVMs are standalone machines with one-time programmable chips (no internet/wireless).
- They use VVPAT (Voter Verifiable Paper Audit Trail) printing a slip visible for 7 seconds.
- 5.5 million EVMs used, manufactured only by BEL and ECIL.
- Security involves tamper-proof seals, 2-stage randomisation, and mock polls on election day.`;

let model = null;

function getModel() {
  if (model) return model;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
  return model;
}

/**
 * Send a single message to Gemini and return the reply.
 * @param {string} message - User's election-related question
 * @returns {{ reply: string, tokensUsed: number }}
 */
async function chat(message) {
  const genModel = getModel();
  const result = await genModel.generateContent(message);
  const response = result.response;
  const text = response.text();
  const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
  return { reply: text, tokensUsed };
}

/**
 * Generate multiple choice quiz questions using Gemini
 * @param {string} difficulty
 * @param {string} topic
 * @param {number} count
 */
async function generateQuizQuestions(difficulty, topic, count) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const systemInstruction = `You are an expert on Indian elections, constitutional law, and the Representation of the People Act 1951. Generate exactly ${count} multiple choice questions about Indian elections, focusing on: ${topic}. Difficulty: ${difficulty}.
Return ONLY a valid JSON array with no markdown, no explanation, no code fences:
[{"id":"q1","question":"...","options":["A","B","C","D"],"correct":0,"explanation":"cite Article X or RPA Section Y","difficulty":"${difficulty}","topic":"${topic}","source":"AI Generated"}]
The correct field is the 0-based index of the correct option. Every explanation must cite a specific law, article, or ECI guideline.`;

  const quizModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const result = await quizModel.generateContent(`Generate ${count} questions.`);
  const text = result.response.text();
  
  try {
    const questions = JSON.parse(text);
    return questions;
  } catch (error) {
    throw new Error('Failed to parse Gemini JSON response: ' + error.message);
  }
}

module.exports = {
  chat,
  getModel,
  generateQuizQuestions,
  SYSTEM_PROMPT,
};
