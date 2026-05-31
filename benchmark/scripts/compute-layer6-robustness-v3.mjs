import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const NORMALIZED_FILE = path.join(VALIDATION_DIR, 'normalized_results_t001_t020.csv');
const GOLD_LABEL_SCHEMA_FILE = 'benchmark/gold_label_schema_v2.csv';
const PROPOSED_AGENT_DEBUG_FILE = 'benchmark/proposed_agent_debug.jsonl';
const JOB_FILES = [
  'benchmark/runs/2026-05-31-dryrun-t004-t006-batch-001/proposed_agent_jobs.csv',
  'benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/proposed_agent_jobs.csv',
  'benchmark/runs/2026-05-31-dryrun-t013-t018-batch-003/proposed_agent_jobs.csv',
  'benchmark/runs/2026-05-31-dryrun-t019-t020-batch-004/proposed_agent_jobs.csv'
];

const OUTPUT_CSV = path.join(VALIDATION_DIR, 'layer6_robustness_metrics.csv');
const OUTPUT_JSON = path.join(VALIDATION_DIR, 'layer6_robustness_metrics_summary.json');

// --- Helpers ---

function parseCsv(csv) {
  const lines = csv.trim().split("\n");
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });
}

function stringifyCsv(data) {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(",");
  const rows = data.map(row => {
    return headers.map(header => {
      const val = String(row[header] || "");
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(",");
  });
  return [headerRow, ...rows].join("\n");
}

function normalizeDoi(doi) {
  if (!doi || doi === 'N/A' || doi === 'n/a') return '';
  return doi.toLowerCase().trim()
    .replace(/^https?:\/\/doi\.org\//, '')
    .replace(/^doi:/, '')
    .replace(/[{}()\[\]]/g, '');
}

// --- Main ---

async function computeLayer6() {
  if (!fs.existsSync(NORMALIZED_FILE)) {
    console.error(`Normalized file not found: ${NORMALIZED_FILE}`);
    process.exit(1);
  }

  const normalizedResults = parseCsv(fs.readFileSync(NORMALIZED_FILE, 'utf-8'));
  const metrics = [];
  const methodSummary = {};
  const caveats = [];

  // 1. negative_distractor_false_positive_rate
  let distractorMetric = {
    metric_name: 'negative_distractor_false_positive_rate',
    value: 'not_available_in_current_artifacts',
    status: 'NO_DATA',
    numerator: 0,
    denominator: 0,
    notes: 'No negative distractors with real DOIs found in schema.'
  };

  if (fs.existsSync(GOLD_LABEL_SCHEMA_FILE)) {
    const goldSchema = parseCsv(fs.readFileSync(GOLD_LABEL_SCHEMA_FILE, 'utf-8'));
    const distractors = goldSchema.filter(row => row.label_type === 'negative_distractor');
    
    if (distractors.length > 0) {
      const realDistractors = distractors.filter(d => d.paper_id_or_doi && !d.paper_id_or_doi.includes('pending') && d.paper_id_or_doi !== 'N/A');
      
      if (realDistractors.length === 0) {
        distractorMetric.value = 'placeholder_only';
        distractorMetric.status = 'SKIPPED';
        distractorMetric.notes = 'Negative distractors exist but are placeholders (e.g., pending_negative_example).';
      } else {
        const distractorDois = new Set(realDistractors.map(d => normalizeDoi(d.paper_id_or_doi)));
        const hits = normalizedResults.filter(r => distractorDois.has(normalizeDoi(r.doi)));
        
        distractorMetric.numerator = hits.length;
        distractorMetric.denominator = realDistractors.length;
        distractorMetric.value = (hits.length / realDistractors.length).toFixed(4);
        distractorMetric.status = hits.length === 0 ? 'PASS' : 'WARN';
        distractorMetric.notes = `${hits.length} false positive hits out of ${realDistractors.length} known distractors.`;
      }
    }
  }
  metrics.push(distractorMetric);

  // 2. hallucination_rate
  const verifiedOrGold = normalizedResults.filter(r => r.verification_status === 'verified' || r.validation_state === 'controlled_validation').length;
  const totalRows = normalizedResults.length;
  const riskCandidates = totalRows - verifiedOrGold;

  metrics.push({
    metric_name: 'hallucination_rate',
    value: totalRows > 0 ? (riskCandidates / totalRows).toFixed(4) : 'N/A',
    status: totalRows > 0 ? (riskCandidates / totalRows < 0.05 ? 'PASS' : 'WARN') : 'N/A',
    numerator: riskCandidates,
    denominator: totalRows,
    notes: 'This hallucination rate is artifact-derived and does not perform fresh external paper verification. Risk candidates include unverified or mismatch status rows.'
  });

  // 3. timeout_rate
  let totalJobs = 0;
  let timeoutJobs = 0;
  let resourceLimitJobs = 0;

  for (const jobFile of JOB_FILES) {
    if (fs.existsSync(jobFile)) {
      const jobs = parseCsv(fs.readFileSync(jobFile, 'utf-8'));
      totalJobs += jobs.length;
      jobs.forEach(job => {
        const msg = (job.error_message || '').toLowerCase();
        const status = (job.status || '').toLowerCase();
        if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('time limit') || status.includes('timeout')) {
          timeoutJobs++;
        }
        if (msg.includes('resource limit') || msg.includes('503') || msg.includes('http 503')) {
          resourceLimitJobs++;
        }
      });
    }
  }

  metrics.push({
    metric_name: 'timeout_rate',
    value: totalJobs > 0 ? ((timeoutJobs + resourceLimitJobs) / totalJobs).toFixed(4) : 'not_available_in_current_artifacts',
    status: totalJobs > 0 ? ((timeoutJobs + resourceLimitJobs) / totalJobs < 0.1 ? 'PASS' : 'WARN') : 'NO_DATA',
    numerator: timeoutJobs + resourceLimitJobs,
    denominator: totalJobs,
    notes: `Detected ${timeoutJobs} timeouts and ${resourceLimitJobs} resource failures across ${totalJobs} recorded jobs. Legacy HTTP 503/resource-limit evidence remains preserved as prior context.`
  });

  // 4. latency_per_task
  let totalLatency = 0;
  let latencyCount = 0;
  let latencyMissing = 0;

  for (const jobFile of JOB_FILES) {
    if (fs.existsSync(jobFile)) {
      const jobs = parseCsv(fs.readFileSync(jobFile, 'utf-8'));
      jobs.forEach(job => {
        if (job.started_at && job.completed_at) {
          const start = new Date(job.started_at).getTime();
          const end = new Date(job.completed_at).getTime();
          if (!isNaN(start) && !isNaN(end)) {
            totalLatency += (end - start) / 1000;
            latencyCount++;
          } else {
            latencyMissing++;
          }
        } else {
          latencyMissing++;
        }
      });
    }
  }

  metrics.push({
    metric_name: 'latency_per_task',
    value: latencyCount > 0 ? (totalLatency / latencyCount).toFixed(2) : 'not_available_in_current_artifacts',
    status: latencyCount > 0 ? 'INFO' : 'NO_DATA',
    numerator: Math.round(totalLatency),
    denominator: latencyCount,
    notes: `Average latency of ${(totalLatency / Math.max(1, latencyCount)).toFixed(2)}s per job. Based on ${latencyCount} jobs with valid timestamps. ${latencyMissing} jobs missing timing data.`
  });

  // 5. cost_proxy
  // We don't have token counts in jobs.csv, but maybe in debug logs
  let totalTokens = 0;
  let hasTokens = false;

  if (fs.existsSync(PROPOSED_AGENT_DEBUG_FILE)) {
     const debugLines = fs.readFileSync(PROPOSED_AGENT_DEBUG_FILE, 'utf-8').trim().split('\n');
     debugLines.forEach(line => {
       try {
         const log = JSON.parse(line);
         if (log.usage && log.usage.total_tokens) {
           totalTokens += log.usage.total_tokens;
           hasTokens = true;
         }
       } catch (e) {
         // ignore parse errors
       }
     });
  }

  metrics.push({
    metric_name: 'cost_proxy',
    value: totalJobs > 0 ? `job_count_proxy: ${totalJobs}, row_count_proxy: ${totalRows}` : 'not_available_in_current_artifacts',
    status: 'INFO',
    numerator: totalRows,
    denominator: totalJobs,
    notes: `Estimated cost proxy based on ${totalJobs} jobs and ${totalRows} result rows. USD cost not available in current artifacts. ${hasTokens ? 'Partial token count: ' + totalTokens : 'Token counts not found in logs.'}`
  });

  const summaryJson = {
    benchmark_standard: "v3",
    layer: "Layer 6: Robustness & Risk",
    metrics_computed: [
      "negative_distractor_false_positive_rate",
      "hallucination_rate",
      "timeout_rate",
      "latency_per_task",
      "cost_proxy"
    ],
    scope: "T001-T020",
    input_files: [NORMALIZED_FILE, GOLD_LABEL_SCHEMA_FILE, ...JOB_FILES],
    output_files: [OUTPUT_CSV, OUTPUT_JSON],
    human_evaluation: false,
    llm_judge_executed: false,
    benchmark_execution_performed: false,
    artifact_rows_modified: false,
    claim_boundary: "Layer 6 robustness/risk metrics are computed from existing artifacts. Some values may be artifact-derived proxies where fresh external verification or usage telemetry is unavailable.",
    metrics: metrics,
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync(OUTPUT_CSV, stringifyCsv(metrics));
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(summaryJson, null, 2));

  console.log(`Layer 6 computation complete.`);
  console.log(`- Metrics CSV: ${OUTPUT_CSV}`);
  console.log(`- Summary JSON: ${OUTPUT_JSON}`);
}

computeLayer6().catch(console.error);
