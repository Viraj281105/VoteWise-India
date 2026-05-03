/**
 * VoteWise India — Chatbot UI
 * Full chat interface powered by Gemini via /api/chat.
 */

let chatSessionId;

function initChatbot() {
  chatSessionId = typeof SESSION_ID !== 'undefined' ? SESSION_ID : crypto.randomUUID();

  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const chips = document.getElementById('chat-chips');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    sendMessage(msg);
  });

  chips?.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) {
      const msg = chip.dataset.message;
      sendMessage(msg);
      chips.style.display = 'none';
    }
  });
}

function addBubble(text, type) {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;

  const content = document.createElement('div');
  if (type === 'bot' && typeof DOMPurify !== 'undefined') {
    content.innerHTML = DOMPurify.sanitize(formatBotMessage(text));
  } else {
    content.textContent = text;
  }

  const meta = document.createElement('div');
  meta.className = 'chat-bubble-meta';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  meta.innerHTML = `<span>${time}</span>`;

  if (type === 'bot') {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = '📋 Copy';
    copyBtn.setAttribute('aria-label', 'Copy message');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => (copyBtn.textContent = '📋 Copy'), 2000);
      });
    });
    meta.appendChild(copyBtn);
  }

  bubble.appendChild(content);
  bubble.appendChild(meta);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function showTypingIndicator() {
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typing-indicator';
  indicator.setAttribute('aria-label', 'VoteWise AI is typing');
  indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  messages.appendChild(indicator);
  messages.scrollTop = messages.scrollHeight;
}

function hideTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

async function sendMessage(message) {
  addBubble(message, 'user');
  showTypingIndicator();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: chatSessionId }),
    });

    hideTypingIndicator();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      addBubble(err.error || 'Sorry, I couldn\'t process that. Please try again.', 'bot');
      return;
    }

    const data = await res.json();
    addBubble(data.reply, 'bot');
  } catch {
    hideTypingIndicator();
    addBubble('Connection error. Please check your internet and try again.', 'bot');
  }
}

function formatBotMessage(text) {
  // Convert **bold** and basic formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

document.addEventListener('DOMContentLoaded', initChatbot);
