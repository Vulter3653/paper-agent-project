import fs from 'node:fs';
import path from 'node:path';

const VALIDATION_DIR = 'benchmark/validation/v3';
const NORMALIZED_FILE = path.join(VALIDATION_DIR, 'normalized_results_t001_t020.csv');
const GOLD_FILE = 'benchmark/gold_relevant_papers.csv';
const OUTPUT_CSV = path.join(VALIDATION_DIR, 'layer3_validity_metrics.csv');
const OUTPUT_JSON = path.join(VALIDATION_DIR, 'layer3_validity_metrics_summary.json');

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

async function computeLayer3() {
  if (!fs.existsSync(NORMALIZED_FILE)) {
    console.error(`Normalized file not found: ${NORMALIZED_FILE}`);
    process.exit(1);
  }

  const normalizedContent = fs.readFileSync(NORMALIZED_FILE, 'utf-8');
  const records = parseCsv(normalizedContent);

  const goldContent = fs.readFileSync(GOLD_FILE, 'utf-8');
  const goldRecords = parseCsv(goldContent);
  const goldDois = new Set(goldRecords.map(g => (g.doi || '').trim().toLowerCase()).filter(doi => doi && doi !== 'n/a'));

  const metrics = [];

  // 1. doi_exact_match_rate
  const validDois = records.filter(r => {
    const doi = (r.doi || '').trim().toLowerCase();
    return r.verification_status === 'verified' || goldDois.has(doi);
  });

  metrics.push({
    metric_name: 'doi_exact_match_rate',
    value: (validDois.length / records.length).toFixed(4),
    details: `${validDois.length}/${records.length} DOIs verified or matched gold set. This metric is artifact-derived and does not perform fresh external DOI verification.`
  });

  // 2. paper_existence_rate
  metrics.push({
    metric_name: 'paper_existence_rate',
    value: (validDois.length / records.length).toFixed(4),
    details: `${validDois.length}/${records.length} confirmed existence via verified status or gold match.`
  });

  // 3. journal_policy_compliance_rate
  const compliantJournals = records.filter(r => {
    const rank = r.journal_rank || '';
    return rank && rank !== 'N/A';
  });

  metrics.push({
    metric_name: 'journal_policy_compliance_rate',
    value: (compliantJournals.length / records.length).toFixed(4),
    details: `${compliantJournals.length}/${records.length} papers have an associated journal rank. proxy_from_existing_journal_rank.`
  });

  // 4. top_journal_precision
  const topJournalRanks = ['국제 S급', '국제 A1급', 'S', 'A1', 'S-tier', 'A1-tier'];
  const topJournalPapers = records.filter(r => {
    const rank = r.journal_rank || '';
    return topJournalRanks.includes(rank);
  });

  metrics.push({
    metric_name: 'top_journal_precision',
    value: (topJournalPapers.length / records.length).toFixed(4),
    details: `${topJournalPapers.length}/${records.length} papers from S or A1 journals.`
  });

  // 5. oa_success_rate
  metrics.push({
    metric_name: 'oa_success_rate',
    value: 'not_available_in_current_artifacts',
    details: 'Open Access verification status not present in normalized schema'
  });

  fs.writeFileSync(OUTPUT_CSV, stringifyCsv(metrics));
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({ layer: 'Layer 3', metrics }, null, 2));

  console.log(`Layer 3 computation complete. Results written to ${OUTPUT_CSV}`);
}

computeLayer3().catch(console.error);
