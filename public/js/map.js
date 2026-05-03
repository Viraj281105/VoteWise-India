/**
 * VoteWise India — Interactive Election Map (D3.js)
 */

const PARTY_COLORS = {
  'BJP':     '#FF9933',
  'INC':     '#138808',
  'TMC':     '#2196F3',
  'DMK':     '#E53935',
  'SP':      '#E91E63',
  'AAP':     '#00BCD4',
  'JDS':     '#9C27B0',
  'YSRCP':   '#FFEB3B',
  'TDP':     '#FFD700',
  'JMM':     '#4CAF50',
  'SKM':     '#FF5722',
  'ZPM':     '#795548',
  'VPP':     '#607D8B',
  'AIMIM':   '#009688',
  'NCP (SP)':'#FF9800',
  'SHS':     '#F44336',
  'LJP':     '#3F51B5',
  'default': '#B0BEC5'
};

const TOPO_PRIMARY = 'https://cdn.jsdelivr.net/npm/india-states-topojson@1.0.1/states.json';
const TOPO_FALLBACK = 'https://unpkg.com/india-atlas@1.0.0/dist/states-10m.json';

// Utility to escape HTML
function escapeHTMLMap(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Compute State Winners from CONSTITUENCY_DATA
function computeStateWinners() {
  const stateData = {};
  const activeParties = new Set();

  for (const [stateName, constituencies] of Object.entries(CONSTITUENCY_DATA)) {
    const partyCounts = {};
    let totalTurnout = 0;
    
    constituencies.forEach(c => {
      partyCounts[c.party] = (partyCounts[c.party] || 0) + 1;
      totalTurnout += c.turnout;
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

    stateData[stateName] = {
      dominantParty,
      seatsWon: maxSeats,
      totalSeats: constituencies.length,
      avgTurnout: (totalTurnout / constituencies.length).toFixed(1),
      constituencies
    };
  }

  return { stateData, activeParties };
}

async function fetchTopology() {
  try {
    const res = await fetch(TOPO_PRIMARY);
    if (!res.ok) throw new Error('Primary failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to secondary topology URL');
    const res = await fetch(TOPO_FALLBACK);
    if (!res.ok) throw new Error('Topology fetch failed');
    return await res.json();
  }
}

async function initMap() {
  const container = document.getElementById('india-map-container');
  if (!container) return;

  let topoData;
  try {
    topoData = await fetchTopology();
  } catch (error) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; background:var(--surface); border-radius:var(--radius-md);">
        <h3>Map unavailable</h3>
        <p>Could not load the map data. Please check the <a href="https://results.eci.gov.in/" target="_blank" rel="noopener">ECI website</a> for official results.</p>
      </div>`;
    return;
  }

  const { stateData, activeParties } = computeStateWinners();
  
  // Render Legend
  renderLegend(activeParties);

  const width = 800;
  const height = 800;

  const svg = d3.select('#india-map-container')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Create a projection mapping India to the SVG
  // Depending on the topojson source, coordinates might be unprojected or pre-projected.
  // The chosen topojson usually has pre-projected coordinates or requires a standard mercator.
  // Let's try to automatically fit the features.
  
  // Extract features
  const features = topojson.feature(topoData, Object.values(topoData.objects)[0]).features;

  const projection = d3.geoMercator().fitSize([width, height], { type: "FeatureCollection", features });
  const pathGen = d3.geoPath().projection(projection);

  // Tooltip setup
  const tooltip = d3.select('body').append('div')
    .attr('class', 'map-tooltip')
    .style('opacity', 0);

  // Draw states
  const paths = svg.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr('d', pathGen)
    .attr('fill', d => {
      const stateName = d.properties.name || d.properties.NAME_1 || d.properties.st_nm;
      // Exact match or partial match from CONSTITUENCY_DATA
      const match = matchStateName(stateName, stateData);
      if (match && stateData[match]) {
        const party = stateData[match].dominantParty;
        return PARTY_COLORS[party] || PARTY_COLORS['default'];
      }
      return PARTY_COLORS['default'];
    })
    .on('mouseover', (event, d) => {
      const stateName = d.properties.name || d.properties.NAME_1 || d.properties.st_nm;
      const match = matchStateName(stateName, stateData);
      
      let html = `<strong>${escapeHTMLMap(stateName)}</strong><br/>`;
      if (match && stateData[match]) {
        const sd = stateData[match];
        html += `Winning Party: <strong>${escapeHTMLMap(sd.dominantParty)}</strong><br/>
                 Seats: ${sd.seatsWon}/${sd.totalSeats}<br/>
                 Avg Turnout: ${sd.avgTurnout}%`;
      } else {
        html += 'No data available';
      }

      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(html)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', (event) => {
      tooltip.style('left', (event.pageX + 15) + 'px')
             .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', () => {
      tooltip.transition().duration(500).style('opacity', 0);
    })
    .on('click', (event, d) => {
      paths.classed('active', false);
      d3.select(event.currentTarget).classed('active', true);
      
      const stateName = d.properties.name || d.properties.NAME_1 || d.properties.st_nm;
      const match = matchStateName(stateName, stateData);
      if (match && stateData[match]) {
        renderStatePanel(match, stateData[match]);
      }
    });
}

// Utility to fuzzy match map state names to CONSTITUENCY_DATA keys
function matchStateName(mapName, stateData) {
  if (!mapName) return null;
  const n = mapName.toLowerCase().replace(/[^a-z]/g, '');
  for (const k of Object.keys(stateData)) {
    const kn = k.toLowerCase().replace(/[^a-z]/g, '');
    if (n === kn || n.includes(kn) || kn.includes(n)) return k;
  }
  // Special cases if needed
  return null;
}

function renderLegend(activeParties) {
  const legendContainer = document.getElementById('map-legend');
  if (!legendContainer) return;
  
  const html = Array.from(activeParties)
    .sort()
    .map(party => {
      const color = PARTY_COLORS[party] || PARTY_COLORS['default'];
      return `
        <div class="map-legend-item">
          <div class="map-legend-dot" style="background:${color}"></div>
          <span>${escapeHTMLMap(party)}</span>
        </div>
      `;
    }).join('');
    
  legendContainer.innerHTML = `<div class="map-legend">${html}</div>`;
}

function renderStatePanel(stateName, data) {
  const panel = document.getElementById('map-state-panel');
  if (!panel) return;

  const html = `
    <h3 class="map-state-title">${escapeHTMLMap(stateName)} — Constituency Breakdown</h3>
    <div class="map-constituency-grid">
      ${data.constituencies.map(c => {
        const partyColor = PARTY_COLORS[c.party] || PARTY_COLORS['default'];
        return `
          <div class="map-constituency-card">
            <div class="mp-name">${escapeHTMLMap(c.mp)}</div>
            <div class="party-tag" style="background:${partyColor}22; color:${partyColor}">${escapeHTMLMap(c.party)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHTMLMap(c.name)} (${escapeHTMLMap(c.category)})</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Turnout: ${c.turnout}%</div>
            
            <div style="font-size:0.75rem; margin-top:8px;">Vote Share: <strong>${c.voteShare}%</strong></div>
            <div class="map-vote-bar">
              <div class="map-vote-bar-fill" style="width:${c.voteShare}%; background:${partyColor}"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  panel.innerHTML = html;
  panel.style.display = 'block';
  
  // Smooth scroll down to panel
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.addEventListener('DOMContentLoaded', initMap);
