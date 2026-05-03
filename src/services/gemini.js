const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/** System prompt scoping VoteWise to Indian election topics only */
const SYSTEM_PROMPT = `You are VoteWise, an expert on Indian elections, the Representation of the People Act 1951, Election Commission of India processes, and Indian constitutional articles related to elections (324-329). Answer only election-related questions. If asked anything unrelated, politely redirect. Always cite the relevant law or ECI guideline. Keep answers under 150 words unless the user explicitly asks for detail.`;

let model = null;

function getModel() {
  if (model) return model;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
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
  return {
    reply: response.text(),
    tokensUsed: response.usageMetadata?.totalTokenCount || 0,
  };
}

module.exports = { chat, getModel, SYSTEM_PROMPT };
