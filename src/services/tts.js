const textToSpeech = require('@google-cloud/text-to-speech');
require('dotenv').config();

let ttsClient = null;

/** Voice presets for supported Indian languages */
const LANGUAGE_MAP = {
  en: { languageCode: 'en-IN', name: 'en-IN-Standard-A' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Standard-A' },
  ta: { languageCode: 'ta-IN', name: 'ta-IN-Standard-A' },
  te: { languageCode: 'te-IN', name: 'te-IN-Standard-A' },
  bn: { languageCode: 'bn-IN', name: 'bn-IN-Standard-A' },
};

function getTTSClient() {
  if (ttsClient) return ttsClient;
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_TTS_API_KEY is not configured');
  ttsClient = new textToSpeech.TextToSpeechClient({ apiKey });
  return ttsClient;
}

/**
 * Convert text to speech and return base64-encoded MP3.
 * @param {string} text - Text to synthesize
 * @param {string} lang - Language code (en, hi, ta, te, bn)
 * @returns {string} Base64-encoded MP3 audio
 */
async function synthesizeSpeech(text, lang = 'en') {
  const client = getTTSClient();
  const voice = LANGUAGE_MAP[lang] || LANGUAGE_MAP.en;

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: voice.languageCode, name: voice.name },
    audioConfig: { audioEncoding: 'MP3' },
  });

  return response.audioContent.toString('base64');
}

module.exports = { synthesizeSpeech, getTTSClient, LANGUAGE_MAP };
