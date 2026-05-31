import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const NORMALIZED_FILE = path.join(VALIDATION_DIR, 'normalized_results_t001_t020.csv');
const REPORT_FILE = path.join(VALIDATION_DIR, 'normalization_report_t001_t020.json');
const OUTPUT_CSV = path.join(VALIDATION_DIR, 'layer2_schema_metrics.csv');
const OUTPUT_JSON = path.join(VALIDATION_DIR, 'layer2_schema_metrics_summary.json');

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

async function computeLayer2() {
  if (!fs.existsSync(NORMALIZED_FILE)) {
    console.error(`Normalized file not found: ${NORMALIZED_FILE}`);
    process.exit(1);
  }

  const normalizedContent = fs.readFileSync(NORMALIZED_FILE, 'utf-8');
  const records = parseCsv(normalizedContent);

  const metrics = [];

  // 1. schema_normalization_rate
  let normalizationRate = 'N/A';
  if (fs.existsSync(REPORT_FILE)) {
    const report = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
    const totalInputRows = report.processed_files.reduce((sum, f) => sum + f.rows, 0);
    normalizationRate = totalInputRows > 0 ? (report.total_rows / totalInputRows).toFixed(4) : 'N/A';
  }

  metrics.push({
    metric_name: 'schema_normalization_rate',
    value: normalizationRate,
    details: normalizationRate !== 'N/A' ? 'Successfully normalized rows vs total input rows' : 'Normalization report not found'
  });

  // 2. metadata_completeness_rate
  const requiredFields = ['title', 'year', 'journal', 'doi', 'task_id', 'result_rank', 'method'];
  const completeRows = records.filter(r => {
    return requiredFields.every(f => r[f] && r[f] !== 'N/A' && r[f] !== '');
  });

  metrics.push({
    metric_name: 'metadata_completeness_rate',
    value: (completeRows.length / records.length).toFixed(4),
    details: `${completeRows.length}/${records.length} rows have all required fields`
  });

  // 3. doi_format_validity_rate
  const doiRegex = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
  const validDois = records.filter(r => {
    const doi = (r.doi || '').trim();
    if (doi === 'N/A' || doi === '') return false;
    return doiRegex.test(doi);
  });

  metrics.push({
    metric_name: 'doi_format_validity_rate',
    value: (validDois.length / records.length).toFixed(4),
    details: `${validDois.length}/${records.length} rows have syntactically valid DOIs`
  });

  // 4. json_parsing_success_rate
  metrics.push({
    metric_name: 'json_parsing_success_rate',
    value: 'not_available_in_current_artifacts',
    details: 'JSON parsing logs not available'
  });

  // 5. metadata_mismatch_rate
  const verifiedRows = records.filter(r => r.verification_status === 'verified').length;
  const mismatchedRows = records.filter(r => r.verification_status === 'mismatch').length;

  metrics.push({
    metric_name: 'metadata_mismatch_rate',
    value: verifiedRows + mismatchedRows > 0 ? (mismatchedRows / (verifiedRows + mismatchedRows)).toFixed(4) : 'N/A',
    details: mismatchedRows > 0 ? `${mismatchedRows} mismatches out of ${verifiedRows + mismatchedRows} verified attempts` : 'No metadata mismatches detected in artifacts'
  });

  fs.writeFileSync(OUTPUT_CSV, stringifyCsv(metrics));
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ layer: 'Layer 2', metrics }, null, 2));

  console.log(`Layer 2 computation complete. Results written to ${OUTPUT_CSV}`);
}

computeLayer2().catch(console.error);
