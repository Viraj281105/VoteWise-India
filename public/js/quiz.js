/**
 * VoteWise India — Quiz Engine
 * 20 questions across 4 difficulty levels with Firestore integration.
 */

const QUIZ_QUESTIONS = [
  // ── EASY (1-5) ──
  { id: 1, difficulty: 'easy', question: 'What does ECI stand for?', options: ['Election Commission of India', 'Electoral Council of India', 'Election Committee of India', 'Electoral Commission of India'], correct: 0, explanation: 'ECI stands for Election Commission of India, established on 25 January 1950 under Article 324 of the Constitution.' },
  { id: 2, difficulty: 'easy', question: 'What is the minimum age to vote in India?', options: ['21 years', '16 years', '18 years', '25 years'], correct: 2, explanation: 'The 61st Amendment Act (1988) lowered the voting age from 21 to 18 years, as specified in Article 326.' },
  { id: 3, difficulty: 'easy', question: 'What is an EPIC card?', options: ['Electors Photo Identity Card', 'Election Participation Identity Card', 'Electronic Polling Identification Card', 'Electoral Process Identity Certificate'], correct: 0, explanation: 'EPIC (Electors Photo Identity Card) is the official voter ID card issued by ECI to all registered voters.' },
  { id: 4, difficulty: 'easy', question: 'What does NOTA stand for?', options: ['Not On The Agenda', 'None of the Above', 'No Official Ticket Assigned', 'National Option for Transparency Act'], correct: 1, explanation: 'NOTA (None of the Above) was introduced in 2013 following the Supreme Court\'s verdict in PUCL v. Union of India.' },
  { id: 5, difficulty: 'easy', question: 'How often are Lok Sabha elections held?', options: ['Every 3 years', 'Every 4 years', 'Every 5 years', 'Every 6 years'], correct: 2, explanation: 'Lok Sabha has a term of 5 years (Article 83), unless dissolved earlier. General elections are held every 5 years.' },
  // ── MEDIUM (6-10) ──
  { id: 6, difficulty: 'medium', question: 'What is the Model Code of Conduct (MCC)?', options: ['A law passed by Parliament for elections', 'Guidelines by ECI for parties and candidates during elections', 'A code of ethics for government employees', 'Rules for counting votes on election day'], correct: 1, explanation: 'MCC is a set of guidelines issued by ECI. While not statutory law, its violation can lead to action under existing laws like IPC and RPA.' },
  { id: 7, difficulty: 'medium', question: 'What is a constituency in the Indian electoral context?', options: ['A political party\'s headquarters', 'A geographic area that elects one representative', 'A group of voters who support one party', 'The counting center for votes'], correct: 1, explanation: 'A constituency (or seat) is a defined geographical area whose registered voters elect one representative to the legislative body.' },
  { id: 8, difficulty: 'medium', question: 'How do Lok Sabha and Rajya Sabha elections differ?', options: ['Both use direct voting by citizens', 'Lok Sabha is direct voting; Rajya Sabha is elected by state legislators', 'Rajya Sabha uses EVMs; Lok Sabha uses paper ballots', 'Lok Sabha members serve 6 years; Rajya Sabha 5 years'], correct: 1, explanation: 'Lok Sabha members are directly elected by citizens (Article 81). Rajya Sabha members are elected by MLAs of state assemblies (Article 80), with 1/3 retiring every 2 years.' },
  { id: 9, difficulty: 'medium', question: 'What is the role of the Returning Officer (RO)?', options: ['To campaign for a candidate', 'To supervise elections in a constituency and declare results', 'To transport EVMs between states', 'To train voters on using EVMs'], correct: 1, explanation: 'The Returning Officer is the senior government official responsible for conducting the election in a constituency — from nomination to counting to declaration of results.' },
  { id: 10, difficulty: 'medium', question: 'What is Form 17C in Indian elections?', options: ['Voter registration application', 'Account of votes recorded at a polling station', 'Candidate nomination form', 'Election expenditure report'], correct: 1, explanation: 'Form 17C is the official record of votes polled at each booth. Candidates\' agents receive a copy to cross-verify with the final count — a key transparency mechanism.' },
  // ── HARD (11-15) ──
  { id: 11, difficulty: 'hard', question: 'Which Article of the Indian Constitution grants the right to vote?', options: ['Article 14', 'Article 19', 'Article 324', 'Article 326'], correct: 3, explanation: 'Article 326 provides for elections on the basis of adult suffrage — every citizen 18+ who is not disqualified has the right to vote. Article 324 deals with the ECI\'s powers.' },
  { id: 12, difficulty: 'hard', question: 'What is VVPAT and when was it first used nationwide in Indian elections?', options: ['Voter Verified Paper Audit Trail; first used in 2019', 'Voluntary Voter Participation And Tracking; 2014', 'Voter Verification Paper Authentication Technology; 2009', 'Verified Voting Paper Assurance Technique; 2004'], correct: 0, explanation: 'VVPAT (Voter Verifiable Paper Audit Trail) prints a paper slip showing the voter\'s choice for 7 seconds. It was used in all constituencies for the first time in the 2019 general elections.' },
  { id: 13, difficulty: 'hard', question: 'What is the Representation of the People Act, 1951?', options: ['The Act that created the Election Commission', 'The Act governing conduct of elections, qualifications, and corrupt practices', 'The Act that defines constituency boundaries', 'The Act that established EVMs'], correct: 1, explanation: 'The RPA 1951 is the primary legislation governing elections in India. It covers qualifications/disqualifications of candidates, election offences, corrupt practices, and election petitions.' },
  { id: 14, difficulty: 'hard', question: 'What happens if two candidates receive exactly the same number of votes?', options: ['The older candidate wins', 'A coin toss or draw of lots determines the winner', 'A re-election is held in that constituency', 'The incumbent wins by default'], correct: 1, explanation: 'Under Rule 64 of the Conduct of Elections Rules 1961, if there is a tie, the Returning Officer decides the winner by drawing lots (not a coin toss, but a random selection method).' },
  { id: 15, difficulty: 'hard', question: 'What is the difference between a by-election and a general election?', options: ['By-elections use paper ballots; general elections use EVMs', 'By-elections fill vacant seats; general elections elect the entire house', 'By-elections are for Rajya Sabha only', 'There is no legal difference'], correct: 1, explanation: 'A general election is held to constitute the entire house (e.g., all 543 Lok Sabha seats). A by-election fills a single seat that became vacant mid-term due to death, resignation, or disqualification.' },
  // ── EXPERT (16-20) ──
  { id: 16, difficulty: 'expert', question: 'The D\'Hondt method is used in proportional representation. Why doesn\'t India use it?', options: ['India uses the FPTP system as mandated by the Constitution', 'The D\'Hondt method was banned by Supreme Court', 'India used it until 1971 and then switched', 'It is used for Rajya Sabha elections'], correct: 0, explanation: 'India\'s Constitution mandates single-member constituencies with FPTP voting (Articles 81, 170). The D\'Hondt method, used in PR systems, allocates seats proportionally. India chose FPTP for simplicity and stable government formation, though critics argue it doesn\'t reflect proportional voter preferences.' },
  { id: 17, difficulty: 'expert', question: 'Which Articles of the Constitution deal with election-related provisions (324-329)?', options: ['Article 324: ECI powers; 325: Single electoral roll; 326: Adult suffrage; 327-329: Legislative powers', 'Article 324: Voting age; 325: Party registration; 326: NOTA; 327-329: EVM guidelines', 'Article 324: Constituency formation; 325: Candidate age; 326: MCC; 327-329: Counting rules', 'Article 324: Campaign rules; 325: Postal ballots; 326: VVPAT; 327-329: Coalition rules'], correct: 0, explanation: 'Art 324: Superintendence of elections vested in ECI. Art 325: No person excluded from electoral roll on grounds of religion/race/caste/sex. Art 326: Adult suffrage. Art 327-328: Parliament/Legislature may make election laws. Art 329: Courts cannot interfere in electoral matters during elections.' },
  { id: 18, difficulty: 'expert', question: 'What is a hung parliament and what follows constitutionally?', options: ['When Parliament is dissolved by the PM; President calls new elections', 'When no party gets 272+ seats; President invites the largest party to prove majority', 'When the Speaker resigns; Deputy Speaker becomes PM', 'When NOTA wins; all candidates are disqualified'], correct: 1, explanation: 'A hung parliament occurs when no single party or pre-election coalition wins 272+ Lok Sabha seats (absolute majority). The President, by convention, invites the leader of the single largest party or coalition to form government and prove majority through a floor test within a stipulated timeframe.' },
  { id: 19, difficulty: 'expert', question: 'What is the Anti-Defection Law and how does it relate to elections?', options: ['It prevents candidates from contesting from multiple constituencies', 'It disqualifies elected members who switch parties, under the 10th Schedule', 'It prohibits political parties from merging during elections', 'It bans candidates with criminal records from contesting'], correct: 1, explanation: 'The Anti-Defection Law (52nd Amendment, 1985) added the 10th Schedule to the Constitution. It disqualifies legislators who voluntarily give up party membership or vote against party whip. The Speaker/Chairman decides disqualification cases. A merger requires 2/3 of the party\'s legislators to be valid.' },
  { id: 20, difficulty: 'expert', question: 'How does the FPTP (First Past the Post) system affect coalition politics in India?', options: ['FPTP ensures single-party majority governments every time', 'FPTP can lead to disproportionate seat-vote ratios, encouraging pre-election coalitions', 'FPTP prevents any coalition from forming', 'FPTP requires a minimum 50% vote share to win'], correct: 1, explanation: 'Under FPTP, a party can win a large number of seats with a relatively small vote share (e.g., BJP won 303 seats with 37.4% vote share in 2019). This "winner-take-all" dynamic encourages parties to form pre-election coalitions to consolidate votes and avoid splitting, leading to India\'s alliance-based politics (NDA, INDIA, etc.).' },
];

let currentQuestion = 0;
let score = 0;
let answers = [];
let shuffledQuestions = [];
let quizActive = false;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz() {
  shuffledQuestions = shuffleArray(QUIZ_QUESTIONS);
  currentQuestion = 0;
  score = 0;
  answers = [];
  quizActive = true;

  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-active').style.display = 'block';

  renderQuestion();
}

function renderQuestion() {
  const q = shuffledQuestions[currentQuestion];
  const total = shuffledQuestions.length;
  const progress = ((currentQuestion) / total) * 100;

  document.getElementById('quiz-progress-bar').style.width = `${progress}%`;
  document.getElementById('quiz-progress-bar').setAttribute('aria-valuenow', currentQuestion);
  document.getElementById('quiz-counter').textContent = `Question ${currentQuestion + 1} of ${total}`;

  const badge = document.getElementById('quiz-difficulty');
  badge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
  badge.className = `quiz-difficulty-badge ${q.difficulty}`;

  document.getElementById('quiz-question').textContent = q.question;

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
  feedbackEl.textContent = '';
  document.getElementById('btn-next-question').style.display = 'none';

  // Attach option listeners
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
  const q = shuffledQuestions[currentQuestion];
  const isCorrect = index === q.correct;
  if (isCorrect) score++;

  answers.push({ questionId: q.id, selected: index, correct: isCorrect });

  // Disable all options and mark correct/incorrect
  document.querySelectorAll('.quiz-option').forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.correct) btn.classList.add('correct');
    if (i === index && !isCorrect) btn.classList.add('incorrect');
    btn.setAttribute('aria-checked', i === index ? 'true' : 'false');
  });

  // Show feedback
  const feedbackEl = document.getElementById('quiz-feedback');
  feedbackEl.className = `quiz-feedback show ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`;
  feedbackEl.style.display = 'block';
  feedbackEl.textContent = `${isCorrect ? '✓ Correct!' : '✗ Incorrect.'} ${q.explanation}`;

  document.getElementById('btn-next-question').style.display = 'inline-flex';
  document.getElementById('btn-next-question').focus();
}

async function finishQuiz() {
  quizActive = false;
  document.getElementById('quiz-active').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';

  const total = shuffledQuestions.length;
  const pct = Math.round((score / total) * 100);
  document.getElementById('result-score').textContent = `${score} / ${total}`;

  // Badge based on score
  let badgeText, badgeColor;
  if (pct >= 90) { badgeText = '🏅 Election Expert!'; badgeColor = '#FFD700'; }
  else if (pct >= 70) { badgeText = '🎖️ Well Informed Voter'; badgeColor = '#C0C0C0'; }
  else if (pct >= 50) { badgeText = '📚 Learning Citizen'; badgeColor = '#CD7F32'; }
  else { badgeText = '🌱 Start Your Journey'; badgeColor = '#90CAF9'; }

  const badgeEl = document.getElementById('result-badge');
  badgeEl.textContent = badgeText;
  badgeEl.style.background = badgeColor;
  badgeEl.style.color = pct >= 90 ? '#333' : '#fff';

  // Submit to backend
  try {
    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, score, total, answers }),
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('result-percentile').textContent = `Top ${100 - data.percentile}% of all VoteWise learners! (Rank #${data.rank})`;
    }
  } catch (err) {
    document.getElementById('result-percentile').textContent = `Score: ${pct}% — Great effort!`;
  }

  // Load leaderboard
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
  } catch {
    // silent fail
  }
}

function escapeHTMLQuiz(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ── Event Listeners ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-start-quiz')?.addEventListener('click', startQuiz);

  document.getElementById('btn-next-question')?.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion >= shuffledQuestions.length) {
      finishQuiz();
    } else {
      renderQuestion();
    }
  });

  document.getElementById('btn-retry-quiz')?.addEventListener('click', startQuiz);
});
