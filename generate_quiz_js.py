import os

with open('public/js/quiz.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Extract the existing questions array
fallback_lines = []
for line in lines:
    if line.startswith('const QUIZ_QUESTIONS'):
        fallback_lines.append(line.replace('QUIZ_QUESTIONS', 'FALLBACK_QUESTIONS'))
    else:
        fallback_lines.append(line)
    if '];' in line and len(fallback_lines) > 0 and fallback_lines[-1].strip() == '];':
        break

new_logic = """
const ROUNDS = [
  { difficulty: 'easy',    label: 'Easy',    count: 5 },
  { difficulty: 'medium',  label: 'Medium',  count: 5 },
  { difficulty: 'hard',    label: 'Hard',    count: 5 },
  { difficulty: 'expert',  label: 'Expert',  count: 5 },
  { difficulty: 'history', label: 'History', count: 5 }
];

let currentRoundIndex = 0;
let currentQuestion = 0; // within the round
let globalQuestionCount = 0;
let score = 0;
let answers = [];
let roundQuestions = [];
let quizActive = false;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getUsedIds() {
  const ids = sessionStorage.getItem('vw_used_ids');
  return ids ? JSON.parse(ids) : [];
}

function addUsedIds(ids) {
  const used = getUsedIds();
  sessionStorage.setItem('vw_used_ids', JSON.stringify([...new Set([...used, ...ids])]));
}

async function startQuiz() {
  currentRoundIndex = 0;
  globalQuestionCount = 0;
  score = 0;
  answers = [];
  quizActive = true;

  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-active').style.display = 'block';

  await startRound();
}

async function startRound() {
  if (currentRoundIndex >= ROUNDS.length) {
    return finishQuiz();
  }

  const round = ROUNDS[currentRoundIndex];
  currentQuestion = 0;

  // Show loading
  document.getElementById('quiz-question').innerHTML = `
    <div class="quiz-loading">
      <div class="quiz-loading-spinner"></div>
      <p>✨ Generating your <strong>${round.label}</strong> questions with AI...</p>
    </div>
  `;
  document.getElementById('quiz-options').innerHTML = '';
  document.getElementById('quiz-feedback').style.display = 'none';
  document.getElementById('btn-next-question').style.display = 'none';

  // Fetch from API
  let fetchedQuestions = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: round.difficulty, count: round.count, sessionId: window.SESSION_ID }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      fetchedQuestions = data.questions;
    }
  } catch (error) {
    console.error('Quiz generation failed or timed out, using fallback.', error);
  }

  // Fallback if needed
  if (!fetchedQuestions || fetchedQuestions.length < round.count) {
    const used = getUsedIds();
    const available = FALLBACK_QUESTIONS.filter(q => q.difficulty === round.difficulty && !used.includes(q.id));
    // If not enough unused, just use any from that difficulty
    const pool = available.length >= round.count ? available : FALLBACK_QUESTIONS.filter(q => q.difficulty === round.difficulty);
    const needed = round.count - (fetchedQuestions ? fetchedQuestions.length : 0);
    const shuffledPool = shuffleArray(pool).slice(0, needed);
    fetchedQuestions = [...(fetchedQuestions || []), ...shuffledPool];
  }

  // Record used IDs
  addUsedIds(fetchedQuestions.map(q => q._docId || q.id));

  roundQuestions = fetchedQuestions.slice(0, round.count);
  renderQuestion();
}

function renderQuestion() {
  const q = roundQuestions[currentQuestion];
  const total = 25;
  const progress = (globalQuestionCount / total) * 100;

  document.getElementById('quiz-progress-bar').style.width = `${progress}%`;
  document.getElementById('quiz-progress-bar').setAttribute('aria-valuenow', globalQuestionCount);
  document.getElementById('quiz-counter').textContent = `Question ${globalQuestionCount + 1} of ${total}`;

  const badge = document.getElementById('quiz-difficulty');
  badge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
  badge.className = `quiz-difficulty-badge ${q.difficulty}`;

  const sourceHtml = q.source === 'AI Generated' || q._docId 
    ? '<span class="source-badge ai">✨ AI Generated</span>' 
    : '<span class="source-badge curated">📚 Curated</span>';

  document.getElementById('quiz-question').innerHTML = `${sourceHtml}<br/>${escapeHTMLQuiz(q.question)}`;

  const optionsContainer = document.getElementById('quiz-options');
  const letters = ['A', 'B', 'C', 'D'];
  optionsContainer.innerHTML = q.options.map((opt, i) => `
    <button class="quiz-option" role="radio" aria-checked="false" data-index="${i}" tabindex="0">
      <span class="option-letter">${letters[i]}</span>
      <span>${escapeHTMLQuiz(opt)}</span>
    </button>
  `).join('');

  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.className = 'quiz-feedback';
  feedbackEl.style.display = 'none';
  feedbackEl.innerHTML = '';
  document.getElementById('btn-next-question').style.display = 'none';

  optionsContainer.querySelectorAll('.quiz-option').forEach((btn) => {
    btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAnswer(parseInt(btn.dataset.index));
      }
    });
  });
}

function selectAnswer(index) {
  const q = roundQuestions[currentQuestion];
  const isCorrect = index === q.correct;
  if (isCorrect) score++;

  answers.push({ questionId: q._docId || q.id || 0, selected: index, correct: isCorrect });

  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.correct) btn.classList.add('correct');
    if (i === index && !isCorrect) btn.classList.add('incorrect');
    btn.setAttribute('aria-checked', i === index ? 'true' : 'false');
  });

  const isAi = q.source === 'AI Generated' || q._docId;
  const feedbackHtml = isAi && q._docId ? `
    <div class="feedback-row" id="feedback-row-${q._docId}">
      <span>Was this question helpful?</span>
      <button class="thumb-btn" data-helpful="true" onclick="submitFeedback('${q._docId}', true)">👍</button>
      <button class="thumb-btn" data-helpful="false" onclick="submitFeedback('${q._docId}', false)">👎</button>
    </div>
  ` : '';

  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.className = `quiz-feedback show ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`;
  feedbackEl.style.display = 'block';
  feedbackEl.innerHTML = `<strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong> ${escapeHTMLQuiz(q.explanation)} ${feedbackHtml}`;

  document.getElementById('btn-next-question').style.display = 'inline-flex';
  document.getElementById('btn-next-question').focus();
}

window.submitFeedback = async function(questionId, wasHelpful) {
  const row = document.getElementById(`feedback-row-${questionId}`);
  if (row) row.style.display = 'none';
  try {
    await fetch('/api/quiz/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, wasHelpful, sessionId: window.SESSION_ID })
    });
  } catch (e) {}
};

async function finishQuiz() {
  quizActive = false;
  document.getElementById('quiz-active').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';

  const total = 25;
  const pct = Math.round((score / total) * 100);
  document.getElementById('result-score').textContent = `${score} / ${total}`;

  let badgeText, badgeColor;
  if (pct >= 90) { badgeText = '🏅 Election Expert!'; badgeColor = '#FFD700'; }
  else if (pct >= 70) { badgeText = '🎖️ Well Informed Voter'; badgeColor = '#C0C0C0'; }
  else if (pct >= 50) { badgeText = '📚 Learning Citizen'; badgeColor = '#CD7F32'; }
  else { badgeText = '🌱 Start Your Journey'; badgeColor = '#90CAF9'; }

  const badgeEl = document.getElementById('result-badge');
  badgeEl.textContent = badgeText;
  badgeEl.style.background = badgeColor;
  badgeEl.style.color = pct >= 90 ? '#333' : '#fff';

  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: window.SESSION_ID, score, total, answers }),
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('result-percentile').textContent = `Top ${100 - data.percentile}% of all VoteWise learners! (Rank #${data.rank})`;
    }
  } catch (err) {
    document.getElementById('result-percentile').textContent = `Score: ${pct}% — Great effort!`;
  }

  loadLeaderboard();
}

async function loadLeaderboard() {
  try {
    const res = await fetch('/api/quiz/leaderboard');
    if (!res.ok) return;
    const data = await res.json();
    const list = document.getElementById('leaderboard-list');
    if (!list || !data.leaderboard?.length) {
      if (list) list.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No scores yet. Be the first!</p>';
      return;
    }
    list.innerHTML = data.leaderboard.map((e) => `
      <div class="leaderboard-row">
        <span class="leaderboard-rank">#${e.rank}</span>
        <span class="leaderboard-score">${e.score}/${e.total}</span>
        <span style="color:var(--text-muted);font-size:0.78rem;">${new Date(e.timestamp).toLocaleDateString()}</span>
      </div>
    `).join('');
  } catch { }
}

function escapeHTMLQuiz(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start-quiz')?.addEventListener('click', startQuiz);

  document.getElementById('btn-next-question')?.addEventListener('click', () => {
    currentQuestion++;
    globalQuestionCount++;
    if (currentQuestion >= ROUNDS[currentRoundIndex].count) {
      currentRoundIndex++;
      startRound();
    } else {
      renderQuestion();
    }
  });

  document.getElementById('btn-retry-quiz')?.addEventListener('click', startQuiz);
});
"""

with open('public/js/quiz.js', 'w', encoding='utf-8') as f:
    f.writelines(fallback_lines)
    f.write(new_logic)
