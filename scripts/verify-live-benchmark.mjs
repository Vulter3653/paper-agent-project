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
  console.log(`(gemini) Starting strengthened live benchmark verification for ${API_BASE_URL}...`);
  
  const results = {
    timestamp: new Date().toISOString(),
    diagnostics: null,
    metrics: null,
    runs: null,
    runDetail: null,
    runMetrics: null,
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

    // 2. Check Benchmark Metrics (Top Level)
    console.log('Fetching /api/benchmark-metrics...');
    const metricsRes = await fetch(`${API_BASE_URL}/api/benchmark-metrics`);
    if (!metricsRes.ok) throw new Error(`Metrics failed: ${metricsRes.status}`);
    results.metrics = await metricsRes.json();
    
    const runIdMatch = results.metrics.runId === EXPECTED_RUN_ID;
    const sourceCommitMatch = results.metrics.sourceCommit === EXPECTED_COMMIT;
    const isD1 = results.metrics.source === 'd1_benchmark_run';
    const taskRangeMatch = results.metrics.taskRange === "T001,T002,T003";
    const benchmarkScopeMatch = results.metrics.benchmarkScope === "controlled";
    
    // rowCount check (STRICT)
    const rowCount = results.metrics.comparison?.rowCount;
    const rowCountPass = rowCount === 9;
    
    // Performance checks
    const proposed = results.metrics.comparison?.byMethod?.proposed_agent?.macroAverages || {};
    const ruleBased = results.metrics.comparison?.byMethod?.rule_based?.macroAverages || {};
    
    const precMatch = (val) => Math.abs(val - 0.1333) < 0.001;
    const ndcgMatch = (val) => Math.abs(val - 0.3579) < 0.001;
    
    results.checks.push({ name: 'Run ID Match', pass: runIdMatch, actual: results.metrics.runId });
    results.checks.push({ name: 'Source Commit Match', pass: sourceCommitMatch, actual: results.metrics.sourceCommit });
    results.checks.push({ name: 'Data Source is D1', pass: isD1 });
    results.checks.push({ name: 'Task Range Match (T001-T003)', pass: taskRangeMatch, actual: results.metrics.taskRange });
    results.checks.push({ name: 'Benchmark Scope Match (controlled)', pass: benchmarkScopeMatch, actual: results.metrics.benchmarkScope });
    results.checks.push({ name: 'Comparison Row Count is 9', pass: rowCountPass, actual: rowCount });
    
    results.checks.push({ name: 'Proposed Agent Precision ~0.1333', pass: precMatch(proposed.precision_at_5), actual: proposed.precision_at_5 });
    results.checks.push({ name: 'Proposed Agent NDCG ~0.3579', pass: ndcgMatch(proposed.ndcg_at_5), actual: proposed.ndcg_at_5 });
    results.checks.push({ name: 'Rule-based Precision ~0.1333', pass: precMatch(ruleBased.precision_at_5), actual: ruleBased.precision_at_5 });
    results.checks.push({ name: 'Rule-based NDCG ~0.3579', pass: ndcgMatch(ruleBased.ndcg_at_5), actual: ruleBased.ndcg_at_5 });

    console.log(`- Run ID: ${runIdMatch ? 'PASS' : 'FAIL'} (${results.metrics.runId})`);
    console.log(`- Comparison Row Count: ${rowCountPass ? 'PASS' : 'FAIL'} (${rowCount})`);

    // 3. Check Benchmark Runs List
    console.log('Fetching /api/benchmark-runs...');
    const runsRes = await fetch(`${API_BASE_URL}/api/benchmark-runs`);
    if (!runsRes.ok) throw new Error(`Runs failed: ${runsRes.status}`);
    results.runs = await runsRes.json();
    
    const hasRuns = results.runs.runs && results.runs.runs.length > 0;
    const latestRunCompleted = hasRuns && results.runs.runs[0].status === 'completed';
    
    results.checks.push({ name: 'Benchmark Runs Found', pass: hasRuns });
    results.checks.push({ name: 'Latest Run Completed', pass: latestRunCompleted });
    
    console.log(`- Benchmark Runs: ${hasRuns ? 'PASS' : 'FAIL'} (${results.runs.runs?.length || 0} found)`);

    // 4. Check Run Detail
    console.log(`Fetching /api/benchmark-runs/${EXPECTED_RUN_ID}...`);
    const detailRes = await fetch(`${API_BASE_URL}/api/benchmark-runs/${EXPECTED_RUN_ID}`);
    if (!detailRes.ok) throw new Error(`Run detail failed: ${detailRes.status}`);
    results.runDetail = await detailRes.json();
    const detailOk = results.runDetail.run && results.runDetail.run.id === EXPECTED_RUN_ID;
    results.checks.push({ name: 'Run Detail Endpoint OK', pass: detailOk });

    // 5. Check Run Metrics Detail
    console.log(`Fetching /api/benchmark-runs/${EXPECTED_RUN_ID}/metrics...`);
    const metricsDetailRes = await fetch(`${API_BASE_URL}/api/benchmark-runs/${EXPECTED_RUN_ID}/metrics`);
    if (!metricsDetailRes.ok) throw new Error(`Run metrics failed: ${metricsDetailRes.status}`);
    results.runMetrics = await metricsDetailRes.json();
    const metricsDetailOk = results.runMetrics.runId === EXPECTED_RUN_ID && results.runMetrics.comparison?.rowCount === 9;
    results.checks.push({ name: 'Run Metrics Endpoint OK', pass: metricsDetailOk });

    // 6. Update docs (Evidence JSON)
    console.log('Updating docs/api-benchmark-*.json...');
    await fs.writeFile('docs/api-benchmark-metrics.json', JSON.stringify(results.metrics, null, 2));
    await fs.writeFile('docs/api-benchmark-runs.json', JSON.stringify(results.runs, null, 2));
    await fs.writeFile('docs/api-benchmark-run-detail.json', JSON.stringify(results.runDetail, null, 2));
    await fs.writeFile('docs/api-benchmark-run-metrics.json', JSON.stringify(results.runMetrics, null, 2));
    
    // 7. Generate Markdown report
    const today = new Date().toISOString().split('T')[0];
    const reportPath = `docs/live-benchmark-verification-${today}.md`;
    let reportMd = `# Live Benchmark Verification Report (${today})\n\n`;
    reportMd += `(gemini) This report documents the automated verification of the production Worker API.\n\n`;
    reportMd += `## Verification Summary\n\n`;
    reportMd += `| Check | Status | Actual Value |\n`;
    reportMd += `| :--- | :--- | :--- |\n`;
    results.checks.forEach(c => {
      reportMd += `| ${c.name} | ${c.pass ? '✅ PASS' : '❌ FAIL'} | ${c.actual !== undefined ? c.actual : '-'} |\n`;
    });
    reportMd += `\n## API Details\n\n`;
    reportMd += `- **Endpoint:** ${API_BASE_URL}\n`;
    reportMd += `- **Run ID:** ${results.metrics.runId}\n`;
    reportMd += `- **Source Commit:** ${results.metrics.sourceCommit}\n`;
    reportMd += `- **Data Source:** ${results.metrics.source}\n`;
    reportMd += `- **Row Count:** ${rowCount}\n`;
    
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
