const express = require('express');
const { validate, translateSchema } = require('../middleware/validate');
const { translateLimiter } = require('../middleware/rateLimiter');
const { translateText } = require('../services/translate');

const router = express.Router();

/** POST /api/translate — Translate text to an Indian language */
router.post('/', translateLimiter, validate(translateSchema), async (req, res) => {
  try {
    const { text, targetLang } = req.validatedBody;
    const translatedText = await translateText(text, targetLang);
    res.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

module.exports = router;
