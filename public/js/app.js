/**
 * VoteWise India — Main Application Logic
 * Handles: SPA navigation, accessibility toolbar, constituency explorer,
 *          rights section, myth busters, and smooth scrolling.
 */

/* ── Generate Session ID ─────────────────────────────── */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
const SESSION_ID = localStorage.getItem('vw_session') || generateUUID();
localStorage.setItem('vw_session', SESSION_ID);

/* ── Accessibility Toolbar ───────────────────────────── */
const fontSizes = ['font-small', 'font-medium', 'font-large'];
let currentFontIndex = 1;

document.getElementById('btn-font-decrease')?.addEventListener('click', () => {
  if (currentFontIndex > 0) currentFontIndex--;
  applyFontSize();
});

document.getElementById('btn-font-increase')?.addEventListener('click', () => {
  if (currentFontIndex < 2) currentFontIndex++;
  applyFontSize();
});

function applyFontSize() {
  fontSizes.forEach((cls) => document.documentElement.classList.remove(cls));
  document.documentElement.classList.add(fontSizes[currentFontIndex]);
}

document.getElementById('btn-high-contrast')?.addEventListener('click', function () {
  document.body.classList.toggle('high-contrast');
  this.classList.toggle('active');
  this.setAttribute('aria-pressed', this.classList.contains('active'));
});

document.getElementById('btn-tts-toggle')?.addEventListener('click', function () {
  this.classList.toggle('active');
  this.setAttribute('aria-pressed', this.classList.contains('active'));
});

/* ── Smooth Scroll for SPA anchors ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.focus({ preventScroll: true });
    }
  });
});

/* ── Section Reveal (IntersectionObserver) ────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.05 }
);

document.querySelectorAll('.section').forEach((sec) => {
  revealObserver.observe(sec);
});

/* ── CONSTITUENCY DATA (2024 Lok Sabha) ──────────────── */
const CONSTITUENCY_DATA = {
  'Maharashtra': [
    { name: 'Mumbai North', mp: 'Piyush Goyal', party: 'BJP', voteShare: 55.2, runnerParty: 'INC', runnerVoteShare: 30.1, electorate: 1845000, turnout: 52.1, category: 'General' },
    { name: 'Pune', mp: 'Murlidhar Mohol', party: 'BJP', voteShare: 46.8, runnerParty: 'INC', runnerVoteShare: 40.2, electorate: 2135000, turnout: 55.3, category: 'General' },
    { name: 'Baramati', mp: 'Supriya Sule', party: 'NCP (SP)', voteShare: 47.6, runnerParty: 'NCP', runnerVoteShare: 45.3, electorate: 1920000, turnout: 63.4, category: 'General' },
  ],
  'Tamil Nadu': [
    { name: 'Chennai South', mp: 'Thamizhachi Thangapandian', party: 'DMK', voteShare: 48.5, runnerParty: 'BJP', runnerVoteShare: 28.7, electorate: 1720000, turnout: 54.2, category: 'General' },
    { name: 'Coimbatore', mp: 'Ganapathy Rajkumar', party: 'DMK', voteShare: 42.3, runnerParty: 'AIADMK', runnerVoteShare: 26.5, electorate: 1865000, turnout: 61.8, category: 'General' },
    { name: 'Madurai', mp: 'Venkatesan S', party: 'CPI(M)', voteShare: 44.1, runnerParty: 'AIADMK', runnerVoteShare: 25.8, electorate: 1580000, turnout: 62.7, category: 'General' },
  ],
  'Uttar Pradesh': [
    { name: 'Varanasi', mp: 'Narendra Modi', party: 'BJP', voteShare: 54.2, runnerParty: 'INC', runnerVoteShare: 33.1, electorate: 1985000, turnout: 56.2, category: 'General' },
    { name: 'Lucknow', mp: 'Rajnath Singh', party: 'BJP', voteShare: 53.8, runnerParty: 'SP', runnerVoteShare: 37.2, electorate: 2010000, turnout: 50.4, category: 'General' },
    { name: 'Rae Bareli', mp: 'Rahul Gandhi', party: 'INC', voteShare: 52.4, runnerParty: 'BJP', runnerVoteShare: 38.1, electorate: 1870000, turnout: 55.6, category: 'General' },
  ],
  'Karnataka': [
    { name: 'Bangalore South', mp: 'Tejasvi Surya', party: 'BJP', voteShare: 54.7, runnerParty: 'INC', runnerVoteShare: 38.5, electorate: 2250000, turnout: 54.8, category: 'General' },
    { name: 'Mysore', mp: 'Yaduveer Wadiyar', party: 'BJP', voteShare: 48.3, runnerParty: 'INC', runnerVoteShare: 43.6, electorate: 1895000, turnout: 66.2, category: 'General' },
    { name: 'Udupi-Chikmagalur', mp: 'Kota Srinivas Poojary', party: 'BJP', voteShare: 56.1, runnerParty: 'INC', runnerVoteShare: 38.2, electorate: 1760000, turnout: 72.1, category: 'General' },
  ],
  'West Bengal': [
    { name: 'Kolkata North', mp: 'Sudip Bandyopadhyay', party: 'TMC', voteShare: 48.9, runnerParty: 'BJP', runnerVoteShare: 37.2, electorate: 1650000, turnout: 58.3, category: 'General' },
    { name: 'Dum Dum', mp: 'Sougata Ray', party: 'TMC', voteShare: 51.2, runnerParty: 'BJP', runnerVoteShare: 33.8, electorate: 1580000, turnout: 62.1, category: 'SC' },
    { name: 'Howrah', mp: 'Prasun Banerjee', party: 'TMC', voteShare: 50.5, runnerParty: 'BJP', runnerVoteShare: 39.1, electorate: 1720000, turnout: 65.4, category: 'General' },
  ],
};

/* ── Constituency Explorer Logic ─────────────────────── */
const stateSelect = document.getElementById('state-select');
const constituencySelect = document.getElementById('constituency-select');
const constituencyResult = document.getElementById('constituency-result');

// Populate states
Object.keys(CONSTITUENCY_DATA).forEach((state) => {
  const opt = document.createElement('option');
  opt.value = state;
  opt.textContent = state;
  stateSelect?.appendChild(opt);
});

stateSelect?.addEventListener('change', () => {
  const state = stateSelect.value;
  constituencySelect.innerHTML = '<option value="">— Choose a constituency —</option>';
  constituencySelect.disabled = !state;
  if (constituencyResult) constituencyResult.innerHTML = '';

  if (state && CONSTITUENCY_DATA[state]) {
    CONSTITUENCY_DATA[state].forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      constituencySelect.appendChild(opt);
    });
  }
});

constituencySelect?.addEventListener('change', () => {
  const state = stateSelect.value;
  const cName = constituencySelect.value;
  if (!state || !cName || !constituencyResult) return;
  const data = CONSTITUENCY_DATA[state].find((c) => c.name === cName);
  if (!data) return;
  renderConstituency(data, state);
});

function renderConstituency(d, state) {
  const margin = (d.voteShare - d.runnerVoteShare).toFixed(1);
  constituencyResult.innerHTML = `
    <div class="constituency-header">
      <h3>${escapeHTML(d.name)}</h3>
      <span class="constituency-state">${escapeHTML(state)} · ${d.category} Seat</span>
    </div>
    <div class="constituency-stats">
      <div class="stat-card"><span class="stat-value">${escapeHTML(d.mp)}</span><span class="stat-label">Current MP</span></div>
      <div class="stat-card"><span class="stat-value">${escapeHTML(d.party)}</span><span class="stat-label">Party</span></div>
      <div class="stat-card"><span class="stat-value">${d.turnout}%</span><span class="stat-label">Turnout</span></div>
      <div class="stat-card"><span class="stat-value">${(d.electorate / 100000).toFixed(1)}L</span><span class="stat-label">Electorate</span></div>
    </div>
    <div class="vote-chart">
      <div class="chart-bar-group">
        <div class="chart-label"><span>${escapeHTML(d.party)}</span><span>${d.voteShare}%</span></div>
        <div class="chart-bar"><div class="chart-bar-fill winner" style="width:${d.voteShare}%">${d.voteShare}%</div></div>
      </div>
      <div class="chart-bar-group">
        <div class="chart-label"><span>${escapeHTML(d.runnerParty)}</span><span>${d.runnerVoteShare}%</span></div>
        <div class="chart-bar"><div class="chart-bar-fill runner-up" style="width:${d.runnerVoteShare}%">${d.runnerVoteShare}%</div></div>
      </div>
    </div>
    <div class="fptp-explainer">
      <h4>How FPTP Works Here</h4>
      <p><strong>${escapeHTML(d.mp)}</strong> (${escapeHTML(d.party)}) won with <strong>${d.voteShare}%</strong> of votes, defeating ${escapeHTML(d.runnerParty)} by a margin of <strong>${margin}%</strong>. In the First Past the Post system, the candidate with the most votes wins — no minimum threshold is required. This means ${escapeHTML(d.mp)} represents all ${(d.electorate / 100000).toFixed(1)} lakh voters regardless of who they voted for.</p>
    </div>
  `;
}

/* ── Rights Section Data ─────────────────────────────── */
const RIGHTS_DATA = [
  { title: 'Right to Vote (Article 326)', text: 'Every Indian citizen aged 18 and above has the right to vote in elections, regardless of caste, religion, gender, or economic status.', icon: '🗳️' },
  { title: 'Secret Ballot Guarantee', text: 'Your vote is completely secret. No one — not election officials, not candidates — can find out who you voted for.', icon: '🔒' },
  { title: 'Right to Contest Elections', text: 'Any citizen aged 25+ (Lok Sabha) or 30+ (Rajya Sabha) can contest, subject to eligibility under RPA 1951.', icon: '🎯' },
  { title: 'Right to Candidate Information', text: 'Every candidate must file Form 26 affidavit declaring criminal cases, assets, liabilities, and educational qualifications.', icon: '📋' },
  { title: 'Right to NOTA', text: 'Since 2013, you can choose "None of the Above" on the EVM if you don\'t support any candidate. It doesn\'t affect results but records dissent.', icon: '✋' },
  { title: 'Model Code of Conduct', text: 'Once elections are announced, parties and candidates must follow MCC — no hate speech, no government scheme announcements, no bribery.', icon: '⚖️' },
  { title: 'Report Election Violations', text: 'Dial 1950 (Voter Helpline) or use the cVIGIL app to report violations like voter intimidation, bribery, or MCC breaches.', icon: '📞' },
  { title: 'Rights of Differently-Abled Voters', text: 'Persons with disabilities are entitled to wheelchair access, Braille ballots, companion-assisted voting, and priority queue.', icon: '♿' },
  { title: 'Overseas & NRI Voting Rights', text: 'NRIs registered in the electoral roll can vote in person at their registered constituency. Postal ballot facility is being expanded.', icon: '🌍' },
];

function renderRightsSection() {
  const grid = document.getElementById('rights-grid');
  if (!grid) return;
  grid.innerHTML = RIGHTS_DATA.map((r, i) => `
    <div class="rights-card" role="article" aria-label="${escapeHTML(r.title)}">
      <button class="tts-btn" aria-label="Read aloud: ${escapeHTML(r.title)}" data-tts-text="${escapeHTML(r.title + '. ' + r.text)}" data-tts-id="right-${i}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
      </button>
      <div class="rights-card-icon" aria-hidden="true" style="font-size:2rem;">${r.icon}</div>
      <h3>${escapeHTML(r.title)}</h3>
      <p>${escapeHTML(r.text)}</p>
    </div>
  `).join('');
}

/* ── Myth Busters Data ───────────────────────────────── */
const MYTHS_DATA = [
  { myth: 'EVMs can be hacked wirelessly or remotely manipulated.', fact: 'EVMs are standalone, non-networked devices with one-time programmable chips. They have no wireless, Bluetooth, or internet capability. The ECI conducts rigorous mock polls and allows candidates to verify.', source: 'ECI Technical Expert Committee Report' },
  { myth: 'You need an Aadhaar card to vote in Indian elections.', fact: 'Aadhaar is NOT mandatory for voting. Your EPIC (Voter ID) card is the primary document. You can also use 12 other ID proofs including passport, driving license, and PAN card.', source: 'ECI Voter Guidelines' },
  { myth: 'If NOTA gets the most votes, a re-election is held.', fact: 'NOTA votes are counted but have no legal consequence. Even if NOTA gets the highest votes, the candidate with the most "real" votes wins. NOTA is only a symbolic protest.', source: 'PUCL v. Union of India, 2013 SC' },
  { myth: 'Your employer can\'t give you time off to vote.', fact: 'Under Section 135B of the RPA 1951, every employer must grant paid leave on polling day. Violation is punishable with fine and imprisonment.', source: 'RPA 1951, Section 135B' },
  { myth: 'Postal ballots are easily forged or manipulated.', fact: 'Postal ballots have strict chain-of-custody protocols, unique serial numbers, and are verified by the Returning Officer with cross-checking against electoral rolls.', source: 'Conduct of Elections Rules, 1961' },
  { myth: 'Only people with voter ID cards can vote.', fact: 'You can vote using any of 13 approved photo identity documents. If your name is on the electoral roll, you can vote even without a Voter ID card by showing alternate ID.', source: 'ECI Order dated 2024' },
];

function renderMythsSection() {
  const grid = document.getElementById('myths-grid');
  if (!grid) return;
  grid.innerHTML = MYTHS_DATA.map((m) => `
    <div class="myth-card" tabindex="0" role="button" aria-label="Myth: ${escapeHTML(m.myth)}. Click to reveal the fact.">
      <div class="myth-card-inner">
        <div class="myth-front"><p>${escapeHTML(m.myth)}</p></div>
        <div class="myth-back"><p>${escapeHTML(m.fact)}</p><span class="myth-source">Source: ${escapeHTML(m.source)}</span></div>
      </div>
    </div>
  `).join('');

  // Keyboard toggle for flip cards
  grid.querySelectorAll('.myth-card').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });
}

/* ── Utility: Escape HTML to prevent XSS ─────────────── */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ── Initialize ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderRightsSection();
  renderMythsSection();
});
