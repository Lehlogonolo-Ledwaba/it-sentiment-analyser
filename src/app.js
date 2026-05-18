// src/app.js — Main application controller

let allResults = [];

/** Process a batch of entries through the API and update the UI. */
async function processBatch(batch) {
  setLoading(true);
  document.getElementById('btnAnalyse').disabled = true;
  document.getElementById('btnSample').disabled  = true;

  try {
    const newResults = await analyseEntries(batch);
    allResults = allResults.concat(newResults.map((r, i) => ({
      ...r,
      id: allResults.length + i,
    })));
    refreshUI();
  } catch (err) {
    setSummary(`Error: ${err.message}`);
    console.error('Analysis error:', err);
  } finally {
    setLoading(false);
    document.getElementById('btnAnalyse').disabled = false;
    document.getElementById('btnSample').disabled  = false;
  }
}

/** Re-render everything based on current filter and allResults. */
function refreshUI() {
  const filter   = document.getElementById('categoryFilter').value;
  const filtered = filter === 'all' ? allResults : allResults.filter(r => r.category === filter);

  renderMetrics(filtered);
  renderCategoryBars(filtered);
  renderThemes(filtered);
  renderResults(allResults, filter);
  renderLineChart(allResults);   // always uses full dataset for trend
}

/** Analyse the single entry from the form. */
async function analyseEntry() {
  const text = document.getElementById('entryText').value.trim();
  if (!text) { document.getElementById('entryText').focus(); return; }

  const entry = {
    category: document.getElementById('entryCategory').value,
    source:   document.getElementById('entrySource').value.trim() || 'Manual entry',
    text,
  };

  document.getElementById('entryText').value   = '';
  document.getElementById('entrySource').value = '';

  await processBatch([entry]);
}

/** Load all sample data at once. */
async function loadSampleData() {
  await processBatch(SAMPLE_DATA);
}

/** Generate an AI insights report from all results. */
async function runBulkInsights() {
  if (!allResults.length) return;

  const btn = document.getElementById('btnInsights');
  btn.disabled = true;
  setSummary('Generating executive summary…');

  try {
    const summary = await generateSummary(allResults);
    setSummary(summary);
    buildPrintReport(allResults);   // populate print report too
  } catch (err) {
    setSummary(`Could not generate summary: ${err.message}`);
    console.error('Summary error:', err);
  } finally {
    btn.disabled = false;
  }
}

/** Clear all data and reset to empty state. */
function clearAll() {
  allResults = [];
  resetUI();
}

/** Trigger browser print dialog (shows styled report). */
function exportReport() {
  if (!allResults.length) {
    alert('Add some entries and generate insights first, then export.');
    return;
  }
  buildPrintReport(allResults);
  window.print();
}

// ── Event listeners ───────────────────────────────────────────────────────────
document.getElementById('btnAnalyse').addEventListener('click', analyseEntry);
document.getElementById('btnSample').addEventListener('click', loadSampleData);
document.getElementById('btnClear').addEventListener('click', clearAll);
document.getElementById('btnInsights').addEventListener('click', runBulkInsights);
document.getElementById('btnPrint').addEventListener('click', exportReport);
document.getElementById('categoryFilter').addEventListener('change', refreshUI);

document.getElementById('entryText').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyseEntry();
});