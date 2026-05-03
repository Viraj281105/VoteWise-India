const { translateText } = require('../src/services/translate');
const { translateSchema } = require('../src/middleware/validate');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = translateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }

    const { text, targetLang } = result.data;
    const translatedText = await translateText(text, targetLang);
    res.status(200).json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Failed to translate text' });
  }
}
