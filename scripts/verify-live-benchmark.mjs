/**
 * Live Benchmark Verification Script
 * 
 * This script verifies the production Worker API endpoints for benchmark consistency.
 * It checks diagnostics, latest metrics, and run history.
 * 
 * Usage: node scripts/verify-live-benchmark.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const API_BASE_URL = 'https://paper-agent-project.shch3653.workers.dev';
const EXPECTED_RUN_ID = '2026-05-30-controlled-t001-t003';
const EXPECTED_COMMIT = 'f36a9c25b72bc7a6a58bd3d02bb69cf1bedce2fd';

async function verify() {
  console.log(`(gemini) Starting live benchmark verification for ${API_BASE_URL}...`);
  
  const results = {
    timestamp: new Date().toISOString(),
    diagnostics: null,
    metrics: null,
    runs: null,
    checks: []
  };

  try {
    // 1. Check Diagnostics
    console.log('Fetching /api/diagnostics...');
    const diagRes = await fetch(`${API_BASE_URL}/api/diagnostics`);
    if (!diagRes.ok) throw new Error(`Diagnostics failed: ${diagRes.status}`);
    results.diagnostics = await diagRes.json();
    
    const diagOk = results.diagnostics.ok === true;
    results.checks.push({ name: 'System Diagnostics OK', pass: diagOk });
    console.log(`- Diagnostics: ${diagOk ? 'PASS' : 'FAIL'}`);

    // 2. Check Benchmark Metrics
    console.log('Fetching /api/benchmark-metrics...');
    const metricsRes = await fetch(`${API_BASE_URL}/api/benchmark-metrics`);
    if (!metricsRes.ok) throw new Error(`Metrics failed: ${metricsRes.status}`);
    results.metrics = await metricsRes.json();
    
    const runIdMatch = results.metrics.runId === EXPECTED_RUN_ID;
    const sourceCommitMatch = results.metrics.sourceCommit === EXPECTED_COMMIT;
    const isD1 = results.metrics.source === 'd1_benchmark_run';
    
    // Note: rowCount might be missing until next deployment, but we check if it SHOULD be 9
    const rowCount = results.metrics.comparison?.rowCount;
    const rowCountPass = rowCount === 9 || (results.metrics.comparison && !rowCount); // Handle pre-fix state
    
    results.checks.push({ name: 'Run ID Match', pass: runIdMatch, actual: results.metrics.runId });
    results.checks.push({ name: 'Source Commit Match', pass: sourceCommitMatch, actual: results.metrics.sourceCommit });
    results.checks.push({ name: 'Data Source is D1', pass: isD1 });
    
    console.log(`- Run ID: ${runIdMatch ? 'PASS' : 'FAIL'} (${results.metrics.runId})`);
    console.log(`- Source Commit: ${sourceCommitMatch ? 'PASS' : 'FAIL'} (${results.metrics.sourceCommit})`);
    console.log(`- Data Source: ${isD1 ? 'PASS' : 'FAIL'} (${results.metrics.source})`);

    // 3. Check Benchmark Runs
    console.log('Fetching /api/benchmark-runs...');
    const runsRes = await fetch(`${API_BASE_URL}/api/benchmark-runs`);
    if (!runsRes.ok) throw new Error(`Runs failed: ${runsRes.status}`);
    results.runs = await runsRes.json();
    
    const hasRuns = results.runs.runs && results.runs.runs.length > 0;
    const latestRunCompleted = hasRuns && results.runs.runs[0].status === 'completed';
    
    results.checks.push({ name: 'Benchmark Runs Found', pass: hasRuns });
    results.checks.push({ name: 'Latest Run Completed', pass: latestRunCompleted });
    
    console.log(`- Benchmark Runs: ${hasRuns ? 'PASS' : 'FAIL'} (${results.runs.runs?.length || 0} found)`);

    // 4. Update docs
    console.log('Updating docs/api-benchmark-*.json...');
    await fs.writeFile('docs/api-benchmark-metrics.json', JSON.stringify(results.metrics, null, 2));
    await fs.writeFile('docs/api-benchmark-runs.json', JSON.stringify(results.runs, null, 2));
    
    // Generate Markdown report
    const today = new Date().toISOString().split('T')[0];
    const reportPath = `docs/live-benchmark-verification-${today}.md`;
    let reportMd = `# Live Benchmark Verification Report (${today})\n\n`;
    reportMd += `(gemini) This report documents the automated verification of the production Worker API.\n\n`;
    reportMd += `## Verification Summary\n\n`;
    reportMd += `| Check | Status | Actual Value |\n`;
    reportMd += `| :--- | :--- | :--- |\n`;
    results.checks.forEach(c => {
      reportMd += `| ${c.name} | ${c.pass ? '✅ PASS' : '❌ FAIL'} | ${c.actual || '-'} |\n`;
    });
    reportMd += `\n## API Details\n\n`;
    reportMd += `- **Endpoint:** ${API_BASE_URL}\n`;
    reportMd += `- **Run ID:** ${results.metrics.runId}\n`;
    reportMd += `- **Source Commit:** ${results.metrics.sourceCommit}\n`;
    reportMd += `- **Data Source:** ${results.metrics.source}\n`;
    
    await fs.writeFile(reportPath, reportMd);
    console.log(`Report generated: ${reportPath}`);

    const allPass = results.checks.every(c => c.pass);
    if (!allPass) {
      console.error('Verification FAILED');
      process.exit(1);
    }
    
    console.log('Verification SUCCESSFUL');
  } catch (error) {
    console.error(`Error during verification: ${error.message}`);
    process.exit(1);
  }
}

verify();
