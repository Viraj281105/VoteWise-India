/**
 * VoteWise India — History Timeline
 * Renders the interactive "History of Indian Elections" accordion.
 */

const HISTORY_DATA = [
  { year: "1951-52", title: "First General Election", stats: "173M voters · 53% turnout · INC 364/489 seats", text: "India's first democratic election after independence. Conducted over several months, it established universal adult suffrage in a largely illiterate population. Jawaharlal Nehru became the first elected Prime Minister." },
  { year: "1967", title: "Rise of Regional Parties", stats: "Fourth Lok Sabha", text: "The first election without Jawaharlal Nehru. While Congress retained power at the center, it faced a reduced majority and lost power in several states, marking the rise of regional political forces and coalition governments in states." },
  { year: "1971", title: "The 'Garibi Hatao' Wave", stats: "INC(R) 352/518 seats", text: "Indira Gandhi called early elections following a split in the Congress party. Her populist 'Garibi Hatao' (Eradicate Poverty) slogan resonated strongly, leading to a massive landslide victory for her faction." },
  { year: "1975-77", title: "Emergency & First Non-Congress Govt", stats: "Janata Party 295/542 seats", text: "After the controversial 21-month Emergency period, elections were held in 1977. Public anger led to the first non-Congress government at the center, formed by the Janata Party coalition under Morarji Desai." },
  { year: "1984", title: "Sympathy Wave", stats: "INC 414/542 seats", text: "Following the assassination of Prime Minister Indira Gandhi, her son Rajiv Gandhi led the Congress to an unprecedented mandate. This remains the highest number of seats ever won by a single party in Indian history." },
  { year: "1989", title: "The Coalition Era Begins", stats: "National Front Govt formed", text: "The Bofors scandal and other issues led to the defeat of the Rajiv Gandhi government. V.P. Singh formed a minority government supported by the BJP and Left from the outside, cementing the era of coalition politics." },
  { year: "1996-1999", title: "Years of Instability", stats: "3 Elections in 3 Years", text: "A period of profound political instability saw multiple short-lived governments, including a 13-day Atal Bihari Vajpayee government and two United Front governments supported by Congress." },
  { year: "1999", title: "The NDA Paradigm", stats: "NDA 298/543 seats", text: "Following the Kargil War, the BJP-led National Democratic Alliance (NDA) under Atal Bihari Vajpayee won a stable majority. It became the first non-Congress coalition to successfully complete a full five-year term." },
  { year: "2004", title: "Congress Surprise Win", stats: "UPA formed", text: "Despite the NDA's 'India Shining' campaign, the Congress-led United Progressive Alliance (UPA) achieved a surprise victory, focusing on the 'Aam Aadmi' (common man). Manmohan Singh became Prime Minister." },
  { year: "2009", title: "UPA Re-elected", stats: "UPA 262/543 seats", text: "Riding on a narrative of economic stability and rights-based legislation (like NREGA and RTI), the Manmohan Singh government was re-elected with an increased mandate, rare for an incumbent coalition." },
  { year: "2014", title: "The Modi Wave", stats: "BJP 282/543 seats", text: "Narendra Modi led the BJP to a historic victory. It was the first time in 30 years that a single party secured an absolute majority on its own, significantly altering the political landscape." },
  { year: "2019", title: "A Larger Mandate", stats: "BJP 303/543 seats", text: "Focusing on national security and welfare delivery, the BJP expanded its footprint across new regions, securing an even larger majority—the biggest mandate since the Rajiv Gandhi era." },
  { year: "2024", title: "NDA Third Term", stats: "BJP 240 seats · NDA coalition govt", text: "The BJP fell short of a simple majority, securing 240 seats, but the NDA coalition comfortably formed the government. Narendra Modi became the second Prime Minister to win three consecutive terms." }
];

function renderHistorySection() {
  const container = document.getElementById('history-container');
  if (!container) return;
  
  const timelineHtml = HISTORY_DATA.map((h) => {
    return `
      <div class="timeline-item">
        <span class="timeline-year">${h.year}</span>
        <h3 class="timeline-title">${h.title}</h3>
        <span class="timeline-stats">${h.stats}</span>
        <p class="timeline-text">${h.text}</p>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="history-timeline">${timelineHtml}</div>`;


  // Add scroll reveal animations
  const items = container.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  items.forEach(item => observer.observe(item));
}

document.addEventListener('DOMContentLoaded', renderHistorySection);

