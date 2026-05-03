/**
 * VoteWise India — Timeline Component
 * 8-step election process with IntersectionObserver animations and detail panel.
 */

const TIMELINE_STEPS = [
  {
    step: 1,
    title: 'Announcement of Elections',
    summary: 'The Election Commission announces election dates. The Model Code of Conduct (MCC) comes into effect immediately.',
    detail: 'When the ECI announces election schedules, the Model Code of Conduct automatically kicks in. This means the ruling government cannot announce new schemes, make transfers, or use public resources for campaigning. The MCC ensures a level playing field. The ECI sets dates for nomination, scrutiny, withdrawal, and polling for each phase. India\'s general elections are conducted in multiple phases due to the sheer scale — requiring security forces to be redeployed across the country.',
    icon: '📢',
  },
  {
    step: 2,
    title: 'Voter Registration Deadline',
    summary: 'Citizens must ensure their names appear on the electoral roll. Register or update at voters.eci.gov.in.',
    detail: 'To vote, your name must appear on the Electoral Roll of your constituency. You can register online at voters.eci.gov.in (Form 6), update your address (Form 8A), or correct details (Form 8). The registration deadline is set by the ECI before each election. Booth Level Officers (BLOs) conduct door-to-door verification. You can check your registration status on the NVSP (National Voters\' Service Portal). Remember: You can only be registered in ONE constituency at a time.',
    icon: '📝',
  },
  {
    step: 3,
    title: 'Candidate Nomination',
    summary: 'Candidates file nomination papers. Scrutiny and withdrawal follows within the specified timeline.',
    detail: 'Candidates file nominations with the Returning Officer, along with a security deposit (₹25,000 for general, ₹12,500 for SC/ST candidates). Each candidate must submit Form 26 — a sworn affidavit declaring criminal records, assets, liabilities, and educational qualifications. The Returning Officer scrutinizes nominations for validity. Candidates then have a window to withdraw. After withdrawal, the final list of contesting candidates is published. Each candidate is assigned an election symbol by the ECI.',
    icon: '📄',
  },
  {
    step: 4,
    title: 'Campaigning Period',
    summary: 'Candidates campaign for votes. Strict rules govern spending limits, media usage, and conduct.',
    detail: 'The campaign period is regulated by the Model Code of Conduct. Expenditure limits are set (₹95 lakh for Lok Sabha in most states). Campaigning must stop 48 hours before polling (the "silence period"). Parties cannot appeal to caste, religion, or use hate speech. The ECI deploys Media Certification and Monitoring Committees (MCMC) to pre-certify all paid political ads. Violations can lead to FIR or disqualification. The cVIGIL app allows citizens to report violations in real-time.',
    icon: '📣',
  },
  {
    step: 5,
    title: 'Polling Day',
    summary: 'Voters cast their ballots using EVMs with VVPAT verification at designated polling stations.',
    detail: 'On polling day, voters verify their identity with EPIC (Voter ID) or alternate ID at their assigned polling booth. After verification, indelible ink is applied to the left index finger. Voters press the button next to their chosen candidate on the EVM (Electronic Voting Machine). The VVPAT (Voter Verifiable Paper Audit Trail) displays a paper slip for 7 seconds so voters can verify their choice. Polling booths are set up within 2 km of every habitation. Webcasting is done in sensitive booths. No electronic devices are allowed inside.',
    icon: '🗳️',
  },
  {
    step: 6,
    title: 'Counting Day',
    summary: 'Votes are counted electronically from EVMs. Strong rooms store sealed EVMs until counting begins.',
    detail: 'After polling, EVMs are sealed in the presence of candidates\' agents and stored in "strong rooms" under 24/7 CCTV surveillance and armed security. On counting day, EVMs are opened in the presence of the Returning Officer and candidates\' counting agents. Postal ballots are counted first. EVM results follow, round by round. VVPAT slips from 5 randomly selected booths per Assembly segment are matched with EVM counts for verification. Results are transmitted to the ECI in real-time.',
    icon: '🔢',
  },
  {
    step: 7,
    title: 'Result Declaration',
    summary: 'Winners declared by the Returning Officer. Simple majority determines the winning party or coalition.',
    detail: 'The Returning Officer declares the winner — the candidate with the most votes (simple majority / FPTP). For government formation at the national level, a party or coalition needs 272+ seats (absolute majority in the 543-seat Lok Sabha). If no party achieves this, the President invites the largest party/coalition to prove majority on the floor of the House. Election results are published on the ECI website (results.eci.gov.in) in real-time. Any candidate can request a recount if the margin is very thin.',
    icon: '🏆',
  },
  {
    step: 8,
    title: 'New Government Formation',
    summary: 'The President invites the majority party leader to form government. Oath and trust vote follow.',
    detail: 'After results, the President appoints the leader of the majority party/coalition as Prime Minister (Article 75). The PM and Council of Ministers take the oath of office. Within a specified period, the government must prove its majority through a trust vote (floor test) in the Lok Sabha. The Speaker is elected, the Budget Session is convened, and the new government begins its 5-year term. If the PM loses a trust vote at any point, the government falls and fresh elections may be called.',
    icon: '🏛️',
  },
];

function initTimeline() {
  const container = document.querySelector('.timeline-container');
  if (!container) return;

  container.innerHTML = TIMELINE_STEPS.map((s) => `
    <div class="timeline-card" role="listitem" tabindex="0" data-step="${s.step}" aria-label="Step ${s.step}: ${s.title}">
      <span class="timeline-step-number" aria-hidden="true">${s.step}</span>
      <div class="timeline-card-icon" aria-hidden="true" style="font-size:2rem;">${s.icon}</div>
      <h3>${s.title}</h3>
      <p>${s.summary}</p>
    </div>
  `).join('');

  // IntersectionObserver for card animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 100);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  container.querySelectorAll('.timeline-card').forEach((card) => observer.observe(card));

  // Click / keyboard to show detail
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.timeline-card');
    if (card) showTimelineDetail(card);
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.timeline-card');
      if (card) {
        e.preventDefault();
        showTimelineDetail(card);
      }
    }
  });
}

function showTimelineDetail(card) {
  const step = parseInt(card.dataset.step);
  const data = TIMELINE_STEPS.find((s) => s.step === step);
  if (!data) return;

  // Highlight active card
  document.querySelectorAll('.timeline-card').forEach((c) => c.classList.remove('active'));
  card.classList.add('active');

  // Update detail panel
  const panel = document.getElementById('timeline-detail');
  if (panel) {
    panel.innerHTML = `
      <h3>${data.icon} Step ${data.step}: ${data.title}</h3>
      <p>${data.detail}</p>
    `;
  }
}

document.addEventListener('DOMContentLoaded', initTimeline);
