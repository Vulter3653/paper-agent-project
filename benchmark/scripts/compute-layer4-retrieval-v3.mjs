import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const NORMALIZED_FILE = path.join(VALIDATION_DIR, 'normalized_results_t001_t020.csv');
const GOLD_FILE = 'benchmark/gold_relevant_papers.csv';
const TASKS_FILE = 'benchmark/tasks.jsonl';
const DETERMINISTIC_SUMMARY_FILE = path.join(VALIDATION_DIR, 'benchmark_v3_deterministic_metrics_summary.json');

const OUTPUT_TASK_CSV = path.join(VALIDATION_DIR, 'layer4_retrieval_metrics_by_task.csv');
const OUTPUT_METHOD_CSV = path.join(VALIDATION_DIR, 'layer4_retrieval_metrics_by_method.csv');
const OUTPUT_SUMMARY_JSON = path.join(VALIDATION_DIR, 'layer4_retrieval_metrics_summary.json');

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
  if (!doi || doi === 'N/A') return '';
  return doi.toLowerCase().trim()
    .replace(/^https?:\/\/doi\.org\//, '')
    .replace(/^doi:/, '')
    .replace(/[{}()\[\]]/g, '');
}

function getGoldRelevance(goldRow) {
  if (goldRow.human_relevance) {
    const rel = parseInt(goldRow.human_relevance, 10);
    return isNaN(rel) ? 1 : rel;
  }
  return 1;
}

// --- Main ---

async function computeLayer4() {
  // Check inputs
  for (const file of [NORMALIZED_FILE, GOLD_FILE, TASKS_FILE, DETERMINISTIC_SUMMARY_FILE]) {
    if (!fs.existsSync(file)) {
      console.error(`Missing input file: ${file}`);
      process.exit(1);
    }
  }

  const normalizedResults = parseCsv(fs.readFileSync(NORMALIZED_FILE, 'utf-8'));
  const goldPapers = parseCsv(fs.readFileSync(GOLD_FILE, 'utf-8'));
  const tasksJson = fs.readFileSync(TASKS_FILE, 'utf-8').trim().split('\n').map(line => JSON.parse(line));
  const deterministicSummary = JSON.parse(fs.readFileSync(DETERMINISTIC_SUMMARY_FILE, 'utf-8'));

  const baselineParity = deterministicSummary.metrics.find(m => m.metric_name === 'baseline_parity_check')?.value || 'UNKNOWN';

  // Group gold by task
  const goldByTask = {};
  goldPapers.forEach(row => {
    const taskId = row.task_id;
    if (!goldByTask[taskId]) goldByTask[taskId] = [];
    goldByTask[taskId].push({
      doi: normalizeDoi(row.doi),
      relevance: getGoldRelevance(row)
    });
  });

  // Group results by method and task
  const resultsByMethodTask = {};
  normalizedResults.forEach(row => {
    const method = row.method;
    const taskId = row.task_id;
    if (!resultsByMethodTask[method]) resultsByMethodTask[method] = {};
    if (!resultsByMethodTask[method][taskId]) resultsByMethodTask[method][taskId] = [];
    resultsByMethodTask[method][taskId].push(row);
  });

  const methods = ['rule_based', 'single_llm', 'proposed_agent'];
  const taskIds = tasksJson.map(t => t.task_id);

  const taskMetrics = [];
  const methodStats = {};

  methods.forEach(method => {
    methodStats[method] = {
      evaluated_task_count: 0,
      total_result_count: 0,
      precisions: [],
      ndcgs: [],
      recalls: [],
      reciprocal_ranks: [],
      gold_hits: 0
    };

    taskIds.forEach(taskId => {
      const taskResults = (resultsByMethodTask[method] && resultsByMethodTask[method][taskId]) || [];
      if (taskResults.length === 0) return;

      methodStats[method].evaluated_task_count++;
      methodStats[method].total_result_count += taskResults.length;

      const goldSet = goldByTask[taskId] || [];
      const goldMap = new Map();
      goldSet.forEach(g => goldMap.set(g.doi, g.relevance));

      // 1. Precision @ 5
      let top5Relevant = 0;
      for (let i = 0; i < 5; i++) {
        const res = taskResults[i];
        if (res && goldMap.has(normalizeDoi(res.doi))) {
          top5Relevant++;
        }
      }
      const pAt5 = top5Relevant / 5;
      methodStats[method].precisions.push(pAt5);

      // 2. NDCG @ 5
      let dcg = 0;
      for (let i = 0; i < 5; i++) {
        const res = taskResults[i];
        if (res) {
          const rel = goldMap.get(normalizeDoi(res.doi)) || 0;
          dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
        }
      }

      const sortedGold = [...goldSet].sort((a, b) => b.relevance - a.relevance);
      let idcg = 0;
      for (let i = 0; i < 5; i++) {
        const g = sortedGold[i];
        if (g) {
          idcg += (Math.pow(2, g.relevance) - 1) / Math.log2(i + 2);
        }
      }
      const ndcg = idcg > 0 ? dcg / idcg : 0;
      methodStats[method].ndcgs.push(ndcg);

      // 3. Recall @ 20
      const top20Results = taskResults.slice(0, 20);
      const uniqueGoldHits = new Set();
      top20Results.forEach(res => {
        const normalized = normalizeDoi(res.doi);
        if (goldMap.has(normalized)) {
          uniqueGoldHits.add(normalized);
        }
      });
      const recall = goldSet.length > 0 ? uniqueGoldHits.size / goldSet.length : 0;
      methodStats[method].recalls.push(recall);

      if (uniqueGoldHits.size > 0) {
        methodStats[method].gold_hits++;
      }

      // 4. MRR
      let firstGoldRank = 0;
      for (let i = 0; i < taskResults.length; i++) {
        if (goldMap.has(normalizeDoi(taskResults[i].doi))) {
          firstGoldRank = i + 1;
          break;
        }
      }
      const rr = firstGoldRank > 0 ? 1 / firstGoldRank : 0;
      methodStats[method].reciprocal_ranks.push(rr);

      taskMetrics.push({
        method,
        task_id: taskId,
        evaluated_result_count: taskResults.length,
        gold_count: goldSet.length,
        top5_relevant_count: top5Relevant,
        top20_unique_gold_hits: uniqueGoldHits.size,
        precision_at_5: pAt5.toFixed(4),
        ndcg_at_5: ndcg.toFixed(4),
        recall_at_20: recall.toFixed(4),
        reciprocal_rank: rr.toFixed(4),
        first_gold_rank: firstGoldRank || 'N/A',
        notes: ''
      });
    });
  });

  const methodSummaryRows = methods.map(method => {
    const stats = methodStats[method];
    if (stats.evaluated_task_count === 0) return null;

    const avg = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      method,
      evaluated_task_count: stats.evaluated_task_count,
      total_result_count: stats.total_result_count,
      mean_precision_at_5: avg(stats.precisions).toFixed(4),
      mean_ndcg_at_5: avg(stats.ndcgs).toFixed(4),
      mean_recall_at_20: avg(stats.recalls).toFixed(4),
      gold_hit_rate: (stats.gold_hits / stats.evaluated_task_count).toFixed(4),
      mrr: avg(stats.reciprocal_ranks).toFixed(4),
      notes: ''
    };
  }).filter(Boolean);

  const summaryJson = {
    benchmark_standard: "v3",
    layer: "Layer 4: Retrieval Accuracy",
    metrics_computed: ["precision_at_5", "ndcg_at_5", "recall_at_20", "gold_hit_rate", "mrr"],
    scope: "T001-T020",
    input_files: [NORMALIZED_FILE, GOLD_FILE, TASKS_FILE],
    output_files: [OUTPUT_TASK_CSV, OUTPUT_METHOD_CSV],
    human_evaluation: false,
    llm_judge_executed: false,
    benchmark_execution_performed: false,
    artifact_rows_modified: false,
    baseline_parity_status: baselineParity,
    claim_boundary: "Layer 4 retrieval metrics are computed from existing normalized rows. Comparative claims remain limited if baseline parity is not PASS. Baseline parity is currently " + baselineParity + ". Layer 1-4 metrics are computed from existing artifacts. This does not constitute full T001-T020 benchmark validation because Layer 5 Semantic Quality and Layer 6 Robustness & Risk remain uncomputed.",
    gold_relevance_mapping: "human_relevance (if exists) maps directly torel_i. missing relevance_label → binary relevant = 1. label >= 4 → relevant for recall.",
    method_summary: methodSummaryRows.reduce((acc, row) => {
      acc[row.method] = row;
      return acc;
    }, {}),
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync(OUTPUT_TASK_CSV, stringifyCsv(taskMetrics));
  fs.writeFileSync(OUTPUT_METHOD_CSV, stringifyCsv(methodSummaryRows));
  fs.writeFileSync(OUTPUT_SUMMARY_JSON, JSON.stringify(summaryJson, null, 2));

  console.log(`Layer 4 computation complete.`);
  console.log(`- Task metrics: ${OUTPUT_TASK_CSV}`);
  console.log(`- Method summary: ${OUTPUT_METHOD_CSV}`);
  console.log(`- Summary JSON: ${OUTPUT_SUMMARY_JSON}`);
}

computeLayer4().catch(console.error);
