/**
 * VoteWise India — Interactive Election Map (D3.js)
 * High-performance, drill-down enabled choropleth.
 */

const PARTY_COLORS = {
  'BJP': '#FF9933',
  'INC': '#138808',
  'TMC': '#2196F3',
  'DMK': '#E53935',
  'SP': '#E91E63',
  'AAP': '#00BCD4',
  'JDS': '#9C27B0',
  'YSRCP': '#FFEB3B',
  'TDP': '#FFD700',
  'JMM': '#4CAF50',
  'SKM': '#FF5722',
  'ZPM': '#795548',
  'VPP': '#607D8B',
  'AIMIM': '#009688',
  'NCP (SP)': '#FF9800',
  'SHS': '#F44336',
  'LJP': '#3F51B5',
  'default': '#B0BEC5'
};

const TOPO_PRIMARY = '/data/india_simplified.json';
const CONSTITUENCIES_DATA_URL = '/data/constituencies.json';

let mapInited = false;
let globalTopoData = null;
let globalConstituencyData = null;

// Utility to escape HTML
function escapeHTMLMap(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Compute State Winners from static data for initial coloring
function computeStateWinners(data) {
  const stateData = {};
  const activeParties = new Set();

  for (const [stateName, constituencies] of Object.entries(data)) {
    const partyCounts = {};
    constituencies.forEach(c => {
      partyCounts[c.party] = (partyCounts[c.party] || 0) + 1;
      activeParties.add(c.party);
    });

    let dominantParty = 'default';
    let maxSeats = 0;
    for (const [p, count] of Object.entries(partyCounts)) {
      if (count > maxSeats) {
        maxSeats = count;
        dominantParty = p;
      }
    }
    stateData[stateName] = { dominantParty };
  }
  return { stateData, activeParties };
}

async function initMap() {
  if (mapInited) return;
  const container = document.getElementById('india-map-container');
  if (!container) return;

  container.innerHTML = `
    <div class="map-skeleton">
      <div class="quiz-loading-spinner"></div>
      <p>Initializing Interactive Election Map...</p>
    </div>
  `;

  try {
    const [topo, constits] = await Promise.all([
      fetch(TOPO_PRIMARY).then(r => r.json()),
      fetch(CONSTITUENCIES_DATA_URL).then(r => r.json())
    ]);
    globalTopoData = topo;
    globalConstituencyData = constits;
  } catch (error) {
    console.error("Map data fetch failed:", error);
    container.innerHTML = `<div class="error-msg">Failed to load map data.</div>`;
    return;
  }

  mapInited = true;
  renderMap();
}

function renderMap() {
  const container = document.getElementById('india-map-container');
  container.innerHTML = '';

  const width = 800;
  const height = 800;
  const { stateData, activeParties } = computeStateWinners(globalConstituencyData);
  renderLegend(activeParties);

  const svg = d3.select(container)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('width', '100%')
    .style('height', 'auto');

  const g = svg.append('g');

  const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  const features = globalTopoData.type === "Topology"
    ? topojson.feature(globalTopoData, Object.values(globalTopoData.objects)[0]).features
    : globalTopoData.features.filter(f => f.geometry && f.geometry.coordinates);

  const projection = d3.geoMercator()
    .fitExtent([[20, 20], [width - 20, height - 20]], { type: "FeatureCollection", features });

  const pathGen = d3.geoPath().projection(projection);

  let tooltip = d3.select('.map-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div').attr('class', 'map-tooltip').style('opacity', 0);
  }

  const paths = g.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr('d', pathGen)
    .attr('fill', d => {
      const name = d.properties.name || d.properties.st_nm || d.properties.NAME_1;
      const match = matchStateName(name, stateData);
      return match ? (PARTY_COLORS[stateData[match].dominantParty] || PARTY_COLORS.default) : PARTY_COLORS.default;
    })
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.5)
    .attr('vector-effect', 'non-scaling-stroke')
    .on('mouseover', function (event, d) {
      const name = d.properties.name || d.properties.st_nm || d.properties.NAME_1;
      const match = matchStateName(name, stateData);

      d3.select(this).attr('stroke-width', 2).attr('stroke', '#333');

      let html = `<strong>${escapeHTMLMap(name)}</strong>`;
      if (match && globalConstituencyData[match]) {
        const count = globalConstituencyData[match].length;
        html += `<br/>${count} Constituencies`;
      }

      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(html)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', (event) => {
      tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function () {
      d3.select(this).attr('stroke-width', 0.5).attr('stroke', '#fff');
      tooltip.transition().duration(300).style('opacity', 0);
    })
    .on('click', function (event, d) {
      const name = d.properties.name || d.properties.st_nm || d.properties.NAME_1;
      const match = matchStateName(name, stateData);

      // Zoom effect
      const bounds = pathGen.bounds(d);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;
      const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
      const translate = [width / 2 - scale * x, height / 2 - scale * y];

      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );

      paths.transition().duration(300).attr('opacity', 0.3);
      d3.select(this).transition().duration(300).attr('opacity', 1);

      if (match && globalConstituencyData[match]) {
        renderStatePanel(match, globalConstituencyData[match]);
      }
    });

  // Reset zoom on double click on background
  svg.on('dblclick', () => {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    paths.transition().duration(300).attr('opacity', 1);
  });
}

function renderStatePanel(stateName, constituencies) {
  const panel = document.getElementById('map-state-panel');
  if (!panel) return;

  let currentFilter = 'All';
  let searchTerm = '';

  const renderContent = () => {
    const filtered = constituencies
      .filter(c => (currentFilter === 'All' || c.party === currentFilter) &&
        (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.mp.toLowerCase().includes(searchTerm.toLowerCase())))
      .sort((a, b) => b.voteShare - a.voteShare);

    const parties = ['All', ...new Set(constituencies.map(c => c.party))].sort();

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3 class="map-state-title" style="margin:0;">${escapeHTMLMap(stateName)}</h3>
        <button class="btn btn-secondary btn-sm" onclick="resetMap()">Reset Map</button>
      </div>

      <div class="map-controls">
        <input type="text" class="map-search" placeholder="Search constituency or MP..." value="${escapeHTMLMap(searchTerm)}">
        <div class="map-filters">
          ${parties.map(p => `
            <button class="filter-btn ${p === currentFilter ? 'active' : ''}" data-party="${p}">${p}</button>
          `).join('')}
        </div>
      </div>

      <div class="map-constituency-grid">
        ${filtered.length ? filtered.map(c => {
      const color = PARTY_COLORS[c.party] || PARTY_COLORS.default;
      return `
            <div class="map-constituency-card animate-in">
              <div class="mp-name">${escapeHTMLMap(c.mp)}</div>
              <div class="party-tag" style="background:${color}22; color:${color}">${escapeHTMLMap(c.party)}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHTMLMap(c.name)} • ${c.category}</div>
              <div style="font-size:0.75rem; margin-top:8px; display:flex; justify-content:space-between;">
                <span>Vote Share: <strong>${c.voteShare}%</strong></span>
                <span>Turnout: ${c.turnout}%</span>
              </div>
              <div class="map-vote-bar">
                <div class="map-vote-bar-fill" style="width:${c.voteShare}%; background:${color}"></div>
              </div>
            </div>
          `;
    }).join('') : '<p style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No constituencies match your search.</p>'}
      </div>
    `;

    // Attach listeners
    panel.querySelector('.map-search').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderContent();
    });
    panel.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.party;
        renderContent();
      });
    });
  };

  renderContent();
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.resetMap = () => {
  const svg = d3.select('#india-map-container svg');
  if (!svg.empty()) {
    svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity);
    svg.selectAll('path').transition().duration(300).attr('opacity', 1);
  }
  document.getElementById('map-state-panel').style.display = 'none';
};

function matchStateName(mapName, stateData) {
  if (!mapName) return null;
  const normalized = mapName.toLowerCase().replace(/[^a-z]/g, '');
  const aliases = {
    'delhiut': 'Delhi', 'jammukashmir': 'Jammu & Kashmir', 'ladakh': 'Ladakh',
    'lakshadweep': 'Lakshadweep', 'chhattisgarh': 'Chhattisgarh', 'jharkhand': 'Jharkhand', 'telangana': 'Telangana'
  };
  if (aliases[normalized]) return aliases[normalized];
  for (const k of Object.keys(stateData)) {
    if (k.toLowerCase().replace(/[^a-z]/g, '') === normalized) return k;
  }
  return null;
}

function renderLegend(activeParties) {
  const container = document.getElementById('map-legend');
  if (!container) return;
  container.innerHTML = `
    <div class="map-legend">
      ${Array.from(activeParties).sort().map(p => `
        <div class="map-legend-item">
          <div class="map-legend-dot" style="background:${PARTY_COLORS[p] || PARTY_COLORS.default}"></div>
          <span>${p}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function observeMap() {
  const mapSection = document.getElementById('map');
  if (!mapSection) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initMap();
        observer.unobserve(mapSection);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(mapSection);
}

document.addEventListener('DOMContentLoaded', observeMap);
