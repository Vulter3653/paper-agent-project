import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const INPUT_JSONL = path.join(VALIDATION_DIR, 'layer5_judge_inputs_top5.jsonl');
const OUTPUT_JSONL = path.join(VALIDATION_DIR, 'layer5_judge_outputs_raw.jsonl');
const RUN_MANIFEST = path.join(VALIDATION_DIR, 'layer5_judge_run_manifest.json');

const OUTPUT_ROW_CSV = path.join(VALIDATION_DIR, 'layer5_semantic_metrics_by_row.csv');
const OUTPUT_METHOD_CSV = path.join(VALIDATION_DIR, 'layer5_semantic_metrics_by_method.csv');
const OUTPUT_SUMMARY_JSON = path.join(VALIDATION_DIR, 'layer5_semantic_metrics_summary.json');

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

async function computeLayer5() {
  if (!fs.existsSync(RUN_MANIFEST)) {
    console.error('Run manifest not found.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(RUN_MANIFEST, 'utf-8'));
  
  // Accept 'computed', 'partial_computed', 'quota_limited_partial' etc.
  // Only stop if explicitly pending.
  const isExecuted = manifest.status !== 'pending_llm_judge_execution';

  const summaryJson = {
    benchmark_standard: "v3",
    layer: "Layer 5: Semantic Quality",
    metrics_computed: [
      "llm_judge_relevance_score",
      "construct_coverage_score",
      "context_method_match_score",
      "llm_judge_confidence_score",
      "llm_judge_reasoning_validity"
    ],
    scope: "top5_rows_per_method_task",
    human_evaluation: false,
    llm_judge_executed: isExecuted,
    benchmark_execution_performed: false,
    artifact_rows_modified: false,
    judge_model_identifier: manifest.judge_model_identifier,
    judge_provider: manifest.judge_provider,
    temperature: manifest.temperature,
    top_p: manifest.top_p,
    claim_boundary: "Layer 5 scores are semantic proxy metrics from a fixed LLM-as-a-judge. They do not override deterministic DOI, metadata, paper existence, journal policy, or gold matching failures. Full semantic coverage claim is disabled due to partial audit status.",
    status: manifest.status === 'computed' ? 'computed' : 'quota_limited_partial',
    method_summary: {},
    caveats: []
  };

  if (!isExecuted) {
    summaryJson.status = 'pending_llm_judge_execution';
    summaryJson.caveats.push('Layer 5 metrics not computed: ' + (manifest.reason || 'Judge execution pending.'));
    fs.writeFileSync(OUTPUT_SUMMARY_JSON, JSON.stringify(summaryJson, null, 2));
    console.log('Layer 5 metrics marked as pending.');
    return;
  }

  if (!fs.existsSync(OUTPUT_JSONL)) {
    console.error('Output raw file not found.');
    process.exit(1);
  }

  const rawOutputs = fs.readFileSync(OUTPUT_JSONL, 'utf-8').trim().split('\n').map(line => JSON.parse(line));
  const inputs = fs.readFileSync(INPUT_JSONL, 'utf-8').trim().split('\n').map(line => JSON.parse(line));
  const inputMap = new Map(inputs.map(i => [i.judge_input_id, i]));

  const rowMetrics = [];
  const methodStats = {};

  const successfulOutputs = rawOutputs.filter(out => !out.judge_status || out.judge_status !== 'failed');

  successfulOutputs.forEach(out => {
    const input = inputMap.get(out.judge_input_id);
    if (!input) return;

    const isValidReasoning = out.reasoning_validity === 'pass' && (out.reason || '').length >= 30;
    
    const row = {
      judge_input_id: out.judge_input_id,
      method: input.method,
      task_id: input.task_id,
      result_rank: input.result_rank,
      relevance_score: out.relevance_score_v2,
      construct_coverage: out.construct_coverage_score,
      context_match: out.context_method_match_score,
      confidence: out.confidence,
      reasoning_validity: isValidReasoning ? 'valid' : 'invalid',
      reason: out.reason
    };
    rowMetrics.push(row);

    if (!methodStats[input.method]) {
      methodStats[input.method] = { relevance: [], construct: [], context: [], confidence: [], validReasoning: 0, total: 0 };
    }
    const ms = methodStats[input.method];
    ms.relevance.push(out.relevance_score_v2);
    ms.construct.push(out.construct_coverage_score);
    ms.context.push(out.context_method_match_score);
    ms.confidence.push(out.confidence);
    if (isValidReasoning) ms.validReasoning++;
    ms.total++;
  });

  const methodSummaryRows = Object.entries(methodStats).map(([method, stats]) => {
    const avg = arr => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(4) : 'N/A';
    return {
      method,
      evaluated_count: stats.total,
      llm_judge_relevance_score: avg(stats.relevance),
      construct_coverage_score: avg(stats.construct),
      context_method_match_score: avg(stats.context),
      llm_judge_confidence_score: avg(stats.confidence),
      llm_judge_reasoning_validity: (stats.validReasoning / stats.total).toFixed(4)
    };
  });

  summaryJson.method_summary = methodSummaryRows.reduce((acc, row) => {
    acc[row.method] = row;
    return acc;
  }, {});

  summaryJson.evaluated_rows = successfulOutputs.length;
  summaryJson.total_input_rows = inputs.length;
  summaryJson.failed_rows = inputs.length - successfulOutputs.length;
  summaryJson.semantic_coverage_rate = (successfulOutputs.length / inputs.length).toFixed(4);

  if (summaryJson.evaluated_rows < summaryJson.total_input_rows) {
    summaryJson.caveats.push(`Partial semantic audit: only ${summaryJson.evaluated_rows}/${summaryJson.total_input_rows} rows evaluated due to quota limits.`);
  }

  fs.writeFileSync(OUTPUT_ROW_CSV, stringifyCsv(rowMetrics));
  fs.writeFileSync(OUTPUT_METHOD_CSV, stringifyCsv(methodSummaryRows));
  fs.writeFileSync(OUTPUT_SUMMARY_JSON, JSON.stringify(summaryJson, null, 2));

  console.log(`Layer 5 computation complete (Partial audit: ${summaryJson.evaluated_rows}/${summaryJson.total_input_rows}).`);
}

computeLayer5().catch(console.error);
