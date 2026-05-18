// src/ui.js — DOM rendering helpers + Chart.js charts

// ── Chart instances (kept so we can update/destroy) ──────────────────────────
let donutChart = null;
let lineChart  = null;
let barChart   = null;

// Shared Chart.js defaults for dark theme
Chart.defaults.color          = '#6b7280';
Chart.defaults.borderColor    = 'rgba(255,255,255,0.07)';
Chart.defaults.font.family    = "'DM Sans', sans-serif";

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  pos:    '#22c55e',
  neg:    '#ef4444',
  neu:    '#94a3b8',
  accent: '#4f8ef7',
  purple: '#7c3aed',
  posBg:  'rgba(34,197,94,0.15)',
  negBg:  'rgba(239,68,68,0.15)',
  neuBg:  'rgba(148,163,184,0.1)',
  accentBg: 'rgba(79,142,247,0.15)',
  catColors: ['#4f8ef7','#22c55e','#f59e0b','#ef4444','#7c3aed'],
};

// ── Metric cards ─────────────────────────────────────────────────────────────
function renderMetrics(results) {
  const total = results.length;
  if (total === 0) return;

  const pos = results.filter(r => r.sentiment === 'positive').length;
  const neg = results.filter(r => r.sentiment === 'negative').length;
  const neu = results.filter(r => r.sentiment === 'neutral').length;
  const avg = results.reduce((a, r) => a + (r.score || 0), 0) / total;

  document.getElementById('m-total').textContent = total;
  document.getElementById('m-pos').textContent   = Math.round((pos / total) * 100) + '%';
  document.getElementById('m-neg').textContent   = Math.round((neg / total) * 100) + '%';
  document.getElementById('m-neu').textContent   = Math.round((neu / total) * 100) + '%';
  document.getElementById('m-score').textContent = avg.toFixed(2);

  setBar('pos', Math.round((pos / total) * 100));
  setBar('neu', Math.round((neu / total) * 100));
  setBar('neg', Math.round((neg / total) * 100));

  // Donut chart
  renderDonut(pos, neu, neg);

  // Donut centre label
  const el = document.getElementById('donutCenter');
  if (el) el.textContent = avg.toFixed(2);
}

function setBar(key, pct) {
  const fill  = document.getElementById(`bar-${key}`);
  const label = document.getElementById(`bpct-${key}`);
  if (fill)  fill.style.width = pct + '%';
  if (label) label.textContent = pct + '%';
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function renderDonut(pos, neu, neg) {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;

  const data = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [pos, neu, neg],
      backgroundColor: [C.posBg, C.neuBg, C.negBg],
      borderColor:     [C.pos,   C.neu,   C.neg],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  if (donutChart) {
    donutChart.data = data;
    donutChart.update('active');
    return;
  }

  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data,
    options: {
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
      animation: { animateRotate: true, duration: 700 },
    },
  });
}

// ── Category bars ─────────────────────────────────────────────────────────────
function renderCategoryBars(results) {
  const cats = ['cloud', 'security', 'devtools', 'support', 'vendor'];
  const container = document.getElementById('catBars');
  container.innerHTML = '';

  const catData = [];

  cats.forEach(cat => {
    const items = results.filter(r => r.category === cat);
    if (!items.length) return;

    const avg  = items.reduce((a, r) => a + (r.score || 0), 0) / items.length;
    const pct  = Math.round(((avg + 1) / 2) * 100);
    const colorClass = avg > 0.2 ? 'green' : avg < -0.2 ? 'red' : 'gray';

    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <span class="bar-label" style="font-size:11px;width:80px;">${CAT_LABELS[cat]}</span>
      <div class="bar-track"><div class="bar-fill ${colorClass}" style="width:${pct}%"></div></div>
      <span class="bar-pct">${avg.toFixed(2)}</span>
    `;
    container.appendChild(row);
    catData.push({ cat: CAT_LABELS[cat], avg });
  });

  // Bar chart
  renderBarChart(catData);
}

// ── Bar chart (category comparison) ──────────────────────────────────────────
function renderBarChart(catData) {
  const canvas = document.getElementById('barChart');
  const empty  = document.getElementById('barEmpty');
  if (!canvas) return;

  if (!catData.length) {
    if (empty) empty.style.display = 'flex';
    return;
  }

  if (empty) empty.style.display = 'none';

  const labels = catData.map(d => d.cat);
  const values = catData.map(d => d.avg);
  const colors = values.map(v => v > 0.2 ? C.pos : v < -0.2 ? C.neg : C.neu);
  const bgColors = values.map(v => v > 0.2 ? C.posBg : v < -0.2 ? C.negBg : C.neuBg);

  const data = {
    labels,
    datasets: [{
      label: 'Avg sentiment score',
      data: values,
      backgroundColor: bgColors,
      borderColor: colors,
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  if (barChart) {
    barChart.data = data;
    barChart.update('active');
    return;
  }

  barChart = new Chart(canvas, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` Score: ${ctx.parsed.y.toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
        y: {
          min: -1, max: 1,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            stepSize: 0.5,
            callback: v => v.toFixed(1),
            font: { size: 11 },
          },
        },
      },
      animation: { duration: 600 },
    },
  });
}

// ── Line chart (sentiment over time) ─────────────────────────────────────────
function renderLineChart(allResults) {
  const canvas = document.getElementById('lineChart');
  const empty  = document.getElementById('lineEmpty');
  if (!canvas) return;

  if (!allResults.length) {
    if (empty) empty.style.display = 'flex';
    return;
  }

  if (empty) empty.style.display = 'none';

  // Build cumulative average over entry order
  const labels  = [];
  const scores  = [];
  const posLine = [];
  const negLine = [];

  allResults.forEach((r, i) => {
    labels.push(`#${i + 1}`);
    scores.push(parseFloat((r.score || 0).toFixed(2)));

    const slice = allResults.slice(0, i + 1);
    const pos   = slice.filter(x => x.sentiment === 'positive').length;
    const neg   = slice.filter(x => x.sentiment === 'negative').length;
    posLine.push(parseFloat(((pos / slice.length) * 100).toFixed(1)));
    negLine.push(parseFloat(((neg / slice.length) * 100).toFixed(1)));
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Sentiment score',
        data: scores,
        borderColor: C.accent,
        backgroundColor: 'rgba(79,142,247,0.08)',
        borderWidth: 2,
        pointBackgroundColor: scores.map(s => s > 0 ? C.pos : s < 0 ? C.neg : C.neu),
        pointBorderColor: 'transparent',
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: '% Positive',
        data: posLine,
        borderColor: C.pos,
        borderWidth: 1.5,
        borderDash: [4, 3],
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        yAxisID: 'y2',
      },
      {
        label: '% Negative',
        data: negLine,
        borderColor: C.neg,
        borderWidth: 1.5,
        borderDash: [4, 3],
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        yAxisID: 'y2',
      },
    ],
  };

  if (lineChart) {
    lineChart.data = data;
    lineChart.update('active');
    return;
  }

  lineChart = new Chart(canvas, {
    type: 'line',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 12, font: { size: 11 }, padding: 12 },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.datasetIndex === 0) return ` Score: ${ctx.parsed.y.toFixed(2)}`;
              return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, maxTicksLimit: 12 },
        },
        y: {
          min: -1, max: 1,
          position: 'left',
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { stepSize: 0.5, callback: v => v.toFixed(1), font: { size: 11 } },
          title: { display: true, text: 'Score', font: { size: 10 }, color: '#6b7280' },
        },
        y2: {
          min: 0, max: 100,
          position: 'right',
          grid: { display: false },
          ticks: { callback: v => v + '%', font: { size: 10 } },
          title: { display: true, text: '%', font: { size: 10 }, color: '#6b7280' },
        },
      },
      animation: { duration: 500 },
    },
  });
}

// ── Theme cloud ───────────────────────────────────────────────────────────────
function renderThemes(results) {
  const counts = {};
  results.flatMap(r => r.themes || []).forEach(t => {
    counts[t] = (counts[t] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 14);
  const cloud  = document.getElementById('themeCloud');

  if (!sorted.length) {
    cloud.innerHTML = '<span class="empty-hint">Run analysis to see themes</span>';
    return;
  }

  cloud.innerHTML = sorted.map(([theme, count]) => {
    const size = 11 + Math.min(count * 2, 6);
    return `<span class="theme-tag" style="font-size:${size}px;">${theme} <span style="opacity:0.55;">${count}</span></span>`;
  }).join('');
}

// ── Results list ──────────────────────────────────────────────────────────────
function renderResults(results, filter) {
  const filtered = filter === 'all' ? results : results.filter(r => r.category === filter);
  const section  = document.getElementById('resultsSection');
  const list     = document.getElementById('resultsList');

  if (!filtered.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';

  list.innerHTML = filtered.slice().reverse().map(r => {
    const sentClass = r.sentiment === 'positive' ? 'tag-pos' : r.sentiment === 'negative' ? 'tag-neg' : 'tag-neu';
    const sentIcon  = r.sentiment === 'positive' ? 'ti-trending-up' : r.sentiment === 'negative' ? 'ti-trending-down' : 'ti-minus';
    const themeTags = (r.themes || []).map(t => `<span class="tag tag-theme">${t}</span>`).join('');
    const excerpt   = r.text.length > 140 ? r.text.slice(0, 140) + '…' : r.text;
    const borderCol = r.sentiment === 'positive' ? '#22c55e' : r.sentiment === 'negative' ? '#ef4444' : '#94a3b8';

    return `
      <div class="result-row" style="border-left-color:${borderCol}">
        <div class="result-tags">
          <span class="tag ${sentClass}"><i class="ti ${sentIcon}"></i> ${r.sentiment}</span>
          <span class="tag tag-cat">${CAT_LABELS[r.category] || r.category}</span>
          ${themeTags}
          <span class="result-score">score: ${(r.score || 0).toFixed(2)}</span>
        </div>
        <p class="result-text">"${excerpt}"</p>
        <p class="result-insight"><i class="ti ti-sparkles"></i> ${r.insight || ''} <span class="result-source">— ${r.source}</span></p>
      </div>
    `;
  }).join('');
}

// ── Print report ──────────────────────────────────────────────────────────────
function buildPrintReport(allResults) {
  // Date
  document.getElementById('printDate').textContent =
    'Generated: ' + new Date().toLocaleDateString('en-ZA', { dateStyle: 'long' });

  // Metrics
  const total = allResults.length;
  const pos   = allResults.filter(r => r.sentiment === 'positive').length;
  const neg   = allResults.filter(r => r.sentiment === 'negative').length;
  const neu   = allResults.filter(r => r.sentiment === 'neutral').length;
  const avg   = total ? allResults.reduce((a, r) => a + (r.score || 0), 0) / total : 0;

  document.getElementById('printMetrics').innerHTML = `
    <div class="print-metric"><div class="print-metric-label">Total analysed</div><div class="print-metric-value">${total}</div></div>
    <div class="print-metric"><div class="print-metric-label">Positive</div><div class="print-metric-value positive">${Math.round((pos/total)*100)}%</div></div>
    <div class="print-metric"><div class="print-metric-label">Negative</div><div class="print-metric-value negative">${Math.round((neg/total)*100)}%</div></div>
    <div class="print-metric"><div class="print-metric-label">Neutral</div><div class="print-metric-value neutral">${Math.round((neu/total)*100)}%</div></div>
    <div class="print-metric"><div class="print-metric-label">Avg score</div><div class="print-metric-value">${avg.toFixed(2)}</div></div>
  `;

  // Summary text (already in DOM)
  document.getElementById('printSummary').textContent =
    document.getElementById('aiSummary').textContent;

  // Category bars
  const cats = ['cloud', 'security', 'devtools', 'support', 'vendor'];
  let catHtml = '';
  cats.forEach(cat => {
    const items = allResults.filter(r => r.category === cat);
    if (!items.length) return;
    const avg   = items.reduce((a, r) => a + (r.score || 0), 0) / items.length;
    const pct   = Math.round(((avg + 1) / 2) * 100);
    const cls   = avg > 0.2 ? 'pos' : avg < -0.2 ? 'neg' : 'neu';
    catHtml += `
      <div class="print-cat-row">
        <span class="print-cat-label">${CAT_LABELS[cat]}</span>
        <div class="print-cat-track"><div class="print-cat-fill ${cls}" style="width:${pct}%"></div></div>
        <span class="print-cat-score">${avg.toFixed(2)}</span>
      </div>`;
  });
  document.getElementById('printCatBars').innerHTML = catHtml;

  // Themes
  const counts = {};
  allResults.flatMap(r => r.themes || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 16);
  document.getElementById('printThemes').innerHTML = `<div class="print-themes">` +
    sorted.map(([t, c]) => `<span class="print-theme-tag">${t} (${c})</span>`).join('') +
    `</div>`;
}

// ── Loading / summary helpers ─────────────────────────────────────────────────
function setLoading(visible) {
  document.getElementById('loadingState').style.display = visible ? 'flex' : 'none';
}

function setSummary(text) {
  document.getElementById('aiSummary').textContent = text;
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetUI() {
  ['m-total','m-pos','m-neg','m-neu'].forEach(id => {
    document.getElementById(id).textContent = id === 'm-total' ? '0' : '0%';
  });
  document.getElementById('m-score').textContent = '—';

  ['bar-pos','bar-neg','bar-neu'].forEach(id => {
    document.getElementById(id).style.width = '0%';
  });
  ['bpct-pos','bpct-neg','bpct-neu'].forEach(id => {
    document.getElementById(id).textContent = '0%';
  });

  document.getElementById('catBars').innerHTML    = '';
  document.getElementById('themeCloud').innerHTML = '<span class="empty-hint">Run analysis to see themes</span>';
  document.getElementById('aiSummary').textContent = 'No data yet — add entries and run analysis.';
  document.getElementById('resultsList').innerHTML  = '';
  document.getElementById('resultsSection').style.display = 'none';

  const donutCenter = document.getElementById('donutCenter');
  if (donutCenter) donutCenter.textContent = '—';

  // Destroy charts so they reset cleanly
  if (donutChart) { donutChart.destroy(); donutChart = null; }
  if (lineChart)  { lineChart.destroy();  lineChart  = null; }
  if (barChart)   { barChart.destroy();   barChart   = null; }

  const lineEmpty = document.getElementById('lineEmpty');
  const barEmpty  = document.getElementById('barEmpty');
  if (lineEmpty) lineEmpty.style.display = 'flex';
  if (barEmpty)  barEmpty.style.display  = 'flex';
}
