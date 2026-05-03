/**
 * VoteWise India — Text-to-Speech (Browser Web Speech API)
 * Uses window.speechSynthesis + SpeechSynthesisUtterance — no backend needed.
 */

let currentPlayingBtn = null;

/** Map app language codes to BCP-47 speech synthesis language tags */
const TTS_LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
};

function initTTS() {
  // Delegate click on TTS buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.tts-btn');
    if (!btn) return;

    const text = btn.dataset.ttsText;
    if (!text) return;

    // If same button clicked while speaking, stop
    if (currentPlayingBtn === btn && window.speechSynthesis.speaking) {
      stopSpeech();
      return;
    }

    speakText(text, btn);
  });
}

/**
 * Speak text using the browser's built-in SpeechSynthesis API.
 * @param {string} text - Text to read aloud
 * @param {HTMLElement} btn - The TTS button element (for visual feedback)
 */
function speakText(text, btn) {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API not supported in this browser.');
    return;
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = typeof getCurrentLang === 'function' ? getCurrentLang() : 'en';
  utterance.lang = TTS_LANG_MAP[lang] || TTS_LANG_MAP.en;
  utterance.rate = 0.95;
  utterance.pitch = 1;

  btn.classList.add('playing');
  currentPlayingBtn = btn;

  utterance.onend = () => {
    btn.classList.remove('playing');
    currentPlayingBtn = null;
  };

  utterance.onerror = () => {
    btn.classList.remove('playing');
    currentPlayingBtn = null;
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  window.speechSynthesis.cancel();
  if (currentPlayingBtn) {
    currentPlayingBtn.classList.remove('playing');
    currentPlayingBtn = null;
  }
}

document.addEventListener('DOMContentLoaded', initTTS);
