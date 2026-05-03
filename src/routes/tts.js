const express = require('express');
const { validate, ttsSchema } = require('../middleware/validate');
const { ttsLimiter } = require('../middleware/rateLimiter');
const { synthesizeSpeech } = require('../services/tts');

const router = express.Router();

/** POST /api/tts — Convert text to speech, return base64 MP3 */
router.post('/', ttsLimiter, validate(ttsSchema), async (req, res) => {
  try {
    const { text, lang } = req.validatedBody;
    const audioContent = await synthesizeSpeech(text, lang);
    res.json({ audioContent });
  } catch (error) {
    console.error('TTS error:', error.message);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

module.exports = router;
