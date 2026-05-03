/**
 * Translation service using MyMemory free REST API.
 * No API key required.
 * Endpoint: https://api.mymemory.translated.net/get?q={text}&langpair=en|{targetLang}
 */

/** Map of supported target language codes to MyMemory langpair codes */
const LANG_MAP = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
};

/**
 * Translate text to the specified Indian language via MyMemory API.
 * @param {string} text - Source text (English)
 * @param {string} targetLang - ISO code: hi, ta, te, bn
 * @returns {string} Translated text
 */
async function translateText(text, targetLang) {
  const langCode = LANG_MAP[targetLang] || targetLang;
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `en|${langCode}`);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`MyMemory API returned status ${response.status}`);
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || 'Translation failed');
  }

  return data.responseData.translatedText;
}

module.exports = { translateText, LANG_MAP };
