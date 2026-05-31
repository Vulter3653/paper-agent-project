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
  path.join(VALIDATION_DIR, 'layer4_retrieval_metrics_summary.json')
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

  for (const file of LAYER_FILES) {
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.metrics) {
        allMetrics.push(...data.metrics);
      } else if (data.method_summary) {
        // For Layer 4, we might want to include the mean metrics from the method summary
        // However, the unified summary usually wants a flat list of metrics.
        // Let's adapt Layer 4 summary JSON to also have a 'metrics' array for compatibility if needed,
        // or handle it here by extracting key mean metrics.
        const methods = Object.keys(data.method_summary);
        if (methods.includes('proposed_agent')) {
          const stats = data.method_summary['proposed_agent'];
          allMetrics.push(
            { metric_name: 'precision_at_5', value: stats.mean_precision_at_5, details: 'Proposed Agent mean' },
            { metric_name: 'ndcg_at_5', value: stats.mean_ndcg_at_5, details: 'Proposed Agent mean' },
            { metric_name: 'recall_at_20', value: stats.mean_recall_at_20, details: 'Proposed Agent mean' },
            { metric_name: 'gold_hit_rate', value: stats.gold_hit_rate, details: 'Proposed Agent mean' },
            { metric_name: 'mrr', value: stats.mrr, details: 'Proposed Agent mean' }
          );
        }
      }
      layersInfo.push(data.layer);
    }
  }

  const summaryJson = {
    benchmark_standard: 'v3',
    scope: 'T001-T020',
    computed_layers: layersInfo,
    not_computed_layers: ['Layer 5', 'Layer 6'].filter(l => !layersInfo.includes(l)),
    human_evaluation: false,
    llm_judge_executed: false,
    benchmark_execution_performed: false,
    artifact_rows_modified: false,
    validation_status: layersInfo.includes('Layer 4: Retrieval Accuracy') ? 'deterministic_layer_1_4_computed' : 'deterministic_layer_1_3_computed',
    claim_boundary: 'Layer 1-4 metrics computed from existing artifacts. T004-T020 is not full benchmark validation until Layer 5-6 and all required gates pass.',
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
      'benchmark/scripts/compute-benchmark-v3-deterministic-summary.mjs'
    ],
    metric_spec_file: 'benchmark/metric_spec_v3.json',
    human_evaluation: false,
    benchmark_execution_performed: false,
    llm_judge_executed: false
  };

  fs.writeFileSync(OUTPUT_CSV, stringifyCsv(allMetrics));
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(summaryJson, null, 2));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  console.log(`Deterministic summary complete. Results written to ${OUTPUT_JSON}`);
}

computeSummary().catch(console.error);
