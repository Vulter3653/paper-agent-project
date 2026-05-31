import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = 'benchmark/validation/v3';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'normalized_results_t001_t020.csv');
const REPORT_FILE = path.join(OUTPUT_DIR, 'normalization_report_t001_t020.json');

const INPUT_FILES = [
  { path: 'benchmark/baseline_rule_based_results.csv', method: 'rule_based', state: 'controlled_validation' },
  { path: 'benchmark/baseline_single_llm_results.csv', method: 'single_llm', state: 'controlled_validation' },
  { path: 'benchmark/proposed_agent_results.csv', method: 'proposed_agent', state: 'controlled_validation' },
  { path: 'benchmark/runs/2026-05-31-dryrun-t004-t006-batch-001/proposed_agent_results.csv', method: 'proposed_agent', state: 'artifact_only', batch: 'batch-001' },
  { path: 'benchmark/runs/2026-05-31-dryrun-t007-t012-batch-002/proposed_agent_results.csv', method: 'proposed_agent', state: 'artifact_only', batch: 'batch-002' },
  { path: 'benchmark/runs/2026-05-31-dryrun-t013-t018-batch-003/proposed_agent_results.csv', method: 'proposed_agent', state: 'artifact_only', batch: 'batch-003' },
  { path: 'benchmark/runs/2026-05-31-dryrun-t019-t020-batch-004/proposed_agent_results.csv', method: 'proposed_agent', state: 'artifact_only', batch: 'batch-004' }
];

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

async function normalize() {
  const normalizedResults = [];
  const report = {
    total_input_files: INPUT_FILES.length,
    processed_files: [],
    duplicates_found: 0,
    total_rows: 0
  };

  const seen = new Set();

  for (const input of INPUT_FILES) {
    if (!fs.existsSync(input.path)) {
      console.warn(`File not found: ${input.path}`);
      continue;
    }

    const content = fs.readFileSync(input.path, 'utf-8');
    const records = parseCsv(content);

    report.processed_files.push({
      path: input.path,
      rows: records.length,
      method: input.method
    });

    for (const record of records) {
      const taskId = record.task_id || record.taskID || 'N/A';
      const rank = record.result_rank || record.rank || '0';
      const doi = (record.doi || '').trim().toLowerCase();
      const method = input.method;

      // Unique key for deduplication
      const key = `${method}|${taskId}|${rank}|${doi}`;

      if (seen.has(key)) {
        report.duplicates_found++;
        continue;
      }
      seen.add(key);

      normalizedResults.push({
        run_id: record.job_id || record.run_id || 'N/A',
        source_file: input.path,
        artifact_batch: input.batch || 'N/A',
        method: method,
        task_id: taskId,
        result_rank: rank,
        title: record.title || 'N/A',
        authors: record.authors || 'N/A',
        year: record.year || 'N/A',
        journal: record.journal || 'N/A',
        journal_field: record.journal_field || 'N/A',
        journal_rank: record.journal_rank || 'N/A',
        doi: record.doi || 'N/A',
        verification_status: record.verification_status || 'N/A',
        validation_state: input.state,
        notes: (record.review_note || record.source_note || record.relevance_reason || '').replace(/\n/g, ' ')
      });
    }
  }

  report.total_rows = normalizedResults.length;

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, stringifyCsv(normalizedResults));
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

  console.log(`Normalization complete. ${normalizedResults.length} rows written to ${OUTPUT_FILE}`);
}

normalize().catch(console.error);
