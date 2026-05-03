/**
 * VoteWise India — Language Switching (Google Translate API)
 * Translates page content to Hindi, Tamil, Telugu, or Bengali.
 */

let currentLang = 'en';
const translationCache = {};

function initTranslate() {
  const langBtns = document.querySelectorAll('.lang-btn');

  langBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (lang === currentLang) return;

      // Update button states
      langBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      currentLang = lang;
      document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : lang);

      if (lang === 'en') {
        restoreOriginalText();
      } else {
        translatePage(lang);
      }
    });
  });
}

async function translatePage(targetLang) {
  const elements = document.querySelectorAll('[data-translate]');

  for (const el of elements) {
    const key = el.getAttribute('data-translate');

    // Store original text
    if (!el.dataset.originalText) {
      el.dataset.originalText = el.textContent;
    }

    const cacheKey = `${key}_${targetLang}`;
    if (translationCache[cacheKey]) {
      el.textContent = translationCache[cacheKey];
      continue;
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: el.dataset.originalText, targetLang }),
      });

      if (res.ok) {
        const data = await res.json();
        translationCache[cacheKey] = data.translatedText;
        el.textContent = data.translatedText;
      }
    } catch {
      // Keep original text on failure
    }
  }
}

function restoreOriginalText() {
  const elements = document.querySelectorAll('[data-translate]');
  elements.forEach((el) => {
    if (el.dataset.originalText) {
      el.textContent = el.dataset.originalText;
    }
  });
  document.documentElement.setAttribute('lang', 'en');
}

function getCurrentLang() {
  return currentLang;
}

document.addEventListener('DOMContentLoaded', initTranslate);
