import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const OUTPUT_CSV = path.join(VALIDATION_DIR, 'benchmark_v3_deterministic_metrics_summary.csv');
const OUTPUT_JSON = path.join(VALIDATION_DIR, 'benchmark_v3_deterministic_metrics_summary.json');
const MANIFEST_FILE = path.join(VALIDATION_DIR, 'reproducibility_manifest_t001_t020.json');

const LAYER_FILES = [
  path.join(VALIDATION_DIR, 'layer1_foundation_metrics_summary.json'),
  path.join(VALIDATION_DIR, 'layer2_schema_metrics_summary.json'),
  path.join(VALIDATION_DIR, 'layer3_validity_metrics_summary.json'),
  path.join(VALIDATION_DIR, 'layer4_retrieval_metrics_summary.json'),
  path.join(VALIDATION_DIR, 'layer5_semantic_metrics_summary.json'),
  path.join(VALIDATION_DIR, 'layer6_robustness_metrics_summary.json')
];

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

async function computeSummary() {
  const allMetrics = [];
  const layersInfo = [];
  let llmJudgeExecuted = false;
  let layer5Status = 'not_available';

  for (const file of LAYER_FILES) {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.metrics) {
        allMetrics.push(...data.metrics);
      } else if (data.method_summary) {
        const methods = Object.keys(data.method_summary);
        if (methods.includes('proposed_agent')) {
          const stats = data.method_summary['proposed_agent'];
          if (data.layer === 'Layer 4: Retrieval Accuracy') {
            allMetrics.push(
              { metric_name: 'precision_at_5', value: stats.mean_precision_at_5, details: 'Proposed Agent mean' },
              { metric_name: 'ndcg_at_5', value: stats.mean_ndcg_at_5, details: 'Proposed Agent mean' },
              { metric_name: 'recall_at_20', value: stats.mean_recall_at_20, details: 'Proposed Agent mean' },
              { metric_name: 'gold_hit_rate', value: stats.gold_hit_rate, details: 'Proposed Agent mean' },
              { metric_name: 'mrr', value: stats.mrr, details: 'Proposed Agent mean' }
            );
          } else if (data.layer === 'Layer 5: Semantic Quality' && data.llm_judge_executed) {
            llmJudgeExecuted = true;
            layer5Status = data.status;
            allMetrics.push(
              { metric_name: 'llm_judge_relevance_score', value: stats.llm_judge_relevance_score, details: `Proposed Agent mean (${data.evaluated_rows} rows)` },
              { metric_name: 'construct_coverage_score', value: stats.construct_coverage_score, details: `Proposed Agent mean (${data.evaluated_rows} rows)` },
              { metric_name: 'context_method_match_score', value: stats.context_method_match_score, details: `Proposed Agent mean (${data.evaluated_rows} rows)` },
              { metric_name: 'llm_judge_confidence_score', value: stats.llm_judge_confidence_score, details: `Proposed Agent mean (${data.evaluated_rows} rows)` },
              { metric_name: 'llm_judge_reasoning_validity', value: stats.llm_judge_reasoning_validity, details: `Proposed Agent mean (${data.evaluated_rows} rows)` },
              { metric_name: 'semantic_coverage_rate', value: data.semantic_coverage_rate, details: `Audit depth: ${data.evaluated_rows}/${data.total_input_rows}` }
            );
          }
        }
      }
      layersInfo.push(data.layer);
    }
  }

  const isLayer5Computed = layersInfo.includes('Layer 5: Semantic Quality') && llmJudgeExecuted;
  const isLayer5Partial = isLayer5Computed && layer5Status === 'quota_limited_partial';

  const summaryJson = {
    benchmark_standard: 'v3',
    scope: 'T001-T020',
    computed_layers: layersInfo.filter(l => {
        if (l === 'Layer 5: Semantic Quality') return llmJudgeExecuted;
        return true;
    }),
    not_computed_layers: ['Layer 5: Semantic Quality'].filter(l => {
        if (l === 'Layer 5: Semantic Quality') return !llmJudgeExecuted;
        return false;
    }),
    human_evaluation: false,
    llm_judge_executed: llmJudgeExecuted,
    benchmark_execution_performed: false,
    artifact_rows_modified: false,
    validation_status: isLayer5Partial ? 'v3_validation_partial_semantic_audit' : (isLayer5Computed ? 'v3_validation_complete_pending_gates' : 'deterministic_layer_1_4_6_computed'),
    claim_boundary: isLayer5Partial
        ? 'Layer 1-4 and Layer 6 metrics computed from existing artifacts. Layer 5 is a quota-limited partial semantic audit. Full semantic coverage claim is disabled.'
        : (isLayer5Computed
            ? 'Layer 1-6 metrics have been computed from available artifacts and fixed LLM-as-a-judge scoring. Comparative claims remain limited where baseline parity is partial.'
            : 'Layer 1-4 and Layer 6 metrics are computed from existing artifacts. Layer 5 remains pending because fixed LLM-as-a-judge scoring was not executed.'),
    metrics: allMetrics,
    generated_at: new Date().toISOString()
  };

  const manifest = {
    run_id: 'v3-val-' + new Date().toISOString().split('T')[0],
    generated_at: summaryJson.generated_at,
    base_commit_or_head: '0728af84a8d76a9ba03276019879d39e0cf1e469',
    input_files: [
      'benchmark/tasks.jsonl',
      'benchmark/gold_relevant_papers.csv',
      'benchmark/baseline_rule_based_results.csv',
      'benchmark/baseline_single_llm_results.csv',
      'benchmark/proposed_agent_results.csv'
    ],
    scripts: [
      'benchmark/scripts/normalize-results-v3.mjs',
      'benchmark/scripts/compute-layer1-foundation-v3.mjs',
      'benchmark/scripts/compute-layer2-schema-v3.mjs',
      'benchmark/scripts/compute-layer3-validity-v3.mjs',
      'benchmark/scripts/compute-layer4-retrieval-v3.mjs',
      'benchmark/scripts/prepare-layer5-judge-input-v3.mjs',
      'benchmark/scripts/run-layer5-llm-judge-v3.mjs',
      'benchmark/scripts/retry-layer5-failed-judge-v3.mjs',
      'benchmark/scripts/compute-layer5-semantic-v3.mjs',
      'benchmark/scripts/compute-layer6-robustness-v3.mjs',
      'benchmark/scripts/compute-benchmark-v3-deterministic-summary.mjs'
    ],
    metric_spec_file: 'benchmark/metric_spec_v3.json',
    human_evaluation: false,
    benchmark_execution_performed: false,
    llm_judge_executed: llmJudgeExecuted
  };

  fs.writeFileSync(OUTPUT_CSV, stringifyCsv(allMetrics));
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(summaryJson, null, 2));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  console.log(`Deterministic summary complete. Results written to ${OUTPUT_JSON}`);
}

computeSummary().catch(console.error);
