#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";

const DEFAULT_RESULTS = "benchmark/proposed_agent_results.csv";
const DEFAULT_GOLD = "benchmark/gold_relevant_papers.verified.csv";
const DEFAULT_TASKS_OUTPUT = "benchmark/proposed_agent_metrics.csv";
const DEFAULT_SUMMARY_OUTPUT = "benchmark/proposed_agent_metrics_summary.json";
const DEFAULT_K = 5;

const args = parseArgs(process.argv.slice(2));
const resultsPath = args.results ?? DEFAULT_RESULTS;
const goldPath = args.gold ?? DEFAULT_GOLD;
const tasksOutputPath = args.output ?? DEFAULT_TASKS_OUTPUT;
const summaryOutputPath = args.summaryOutput ?? DEFAULT_SUMMARY_OUTPUT;
const k = args.k ? Number.parseInt(args.k, 10) : DEFAULT_K;

for (const path of [resultsPath, goldPath]) {
  if (!fs.existsSync(path)) {
    console.error(`Input file not found: ${path}`);
    process.exit(1);
  }
}

const resultRows = parseCsv(fs.readFileSync(resultsPath, "utf8"));
const goldRows = parseCsv(fs.readFileSync(goldPath, "utf8"));
const goldByTask = groupBy(goldRows, "task_id");
const resultsByTask = groupBy(resultRows, "task_id");

const metricRows = [...resultsByTask.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([taskId, taskResults]) => evaluateTask(taskId, taskResults, goldByTask.get(taskId) ?? [], k));

const summary = summarize(metricRows, {
  results: resultsPath,
  gold: goldPath,
  taskOutput: tasksOutputPath,
  summaryOutput: summaryOutputPath,
  k
});

writeCsv(tasksOutputPath, metricRows, [
  "task_id",
  "result_count",
  "gold_count",
  "verified_gold_count",
  "precision_at_k",
  "ndcg_at_k",
  "gold_doi_hit_rate_at_k",
  "doi_accuracy_at_k",
  "paper_validity_rate_at_k",
  "top_journal_precision_at_k",
  "hallucination_rate_at_k",
  "oa_success_rate_at_k",
  "matched_gold_ids",
  "matched_dois"
]);
fs.writeFileSync(summaryOutputPath, JSON.stringify(summary, null, 2) + "\n", "utf8");

console.log(JSON.stringify(summary, null, 2));

function evaluateTask(taskId, taskResults, taskGoldRows, cutoff) {
  const rankedResults = [...taskResults]
    .sort((a, b) => Number.parseInt(a.result_rank || "0", 10) - Number.parseInt(b.result_rank || "0", 10))
    .slice(0, cutoff);
  const relevantGold = taskGoldRows.filter((row) => Number.parseFloat(row.human_relevance || "0") >= 4);
  const verifiedGold = relevantGold.filter((row) => normalizeStatus(row.doi_label_status) === "verified" && normalizeDoi(row.doi));
  const goldByDoi = new Map(verifiedGold.map((row) => [normalizeDoi(row.doi), row]));
  const goldByTitle = new Map(relevantGold.map((row) => [normalizeTitle(row.title), row]).filter(([title]) => title));

  const matchedGold = new Map();
  const gains = rankedResults.map((result) => {
    const match = findGoldMatch(result, goldByDoi, goldByTitle);
    if (match) {
      matchedGold.set(match.gold_id, match);
      return Number.parseFloat(match.human_relevance || "0");
    }
    return 0;
  });

  const idealGains = relevantGold
    .map((row) => Number.parseFloat(row.human_relevance || "0"))
    .sort((a, b) => b - a)
    .slice(0, cutoff);

  const denominator = rankedResults.length || 1;
  const matchedDoiCount = rankedResults.filter((result) => goldByDoi.has(normalizeDoi(result.doi))).length;
  const doiPresentCount = rankedResults.filter((result) => normalizeDoi(result.doi)).length;
  const crossrefVerifiedCount = rankedResults.filter((result) => normalizeStatus(result.verification_status) === "verified").length;
  const validPaperCount = rankedResults.filter(isValidPaper).length;
  const topJournalCount = rankedResults.filter(isTopJournal).length;
  const oaSuccessCount = rankedResults.filter(hasOaAccess).length;

  return {
    task_id: taskId,
    result_count: String(rankedResults.length),
    gold_count: String(relevantGold.length),
    verified_gold_count: String(verifiedGold.length),
    precision_at_k: formatRate(matchedGold.size / denominator),
    ndcg_at_k: formatRate(dcg(gains) / (dcg(idealGains) || 1)),
    gold_doi_hit_rate_at_k: formatRate(verifiedGold.length ? matchedDoiCount / verifiedGold.length : 0),
    doi_accuracy_at_k: formatRate(doiPresentCount ? crossrefVerifiedCount / doiPresentCount : 0),
    paper_validity_rate_at_k: formatRate(validPaperCount / denominator),
    top_journal_precision_at_k: formatRate(topJournalCount / denominator),
    hallucination_rate_at_k: formatRate(1 - validPaperCount / denominator),
    oa_success_rate_at_k: formatRate(oaSuccessCount / denominator),
    matched_gold_ids: [...matchedGold.keys()].join(";"),
    matched_dois: rankedResults.map((result) => normalizeDoi(result.doi)).filter((doi) => goldByDoi.has(doi)).join(";")
  };
}

function findGoldMatch(result, goldByDoi, goldByTitle) {
  const doi = normalizeDoi(result.doi);
  if (doi && goldByDoi.has(doi)) return goldByDoi.get(doi);
  const title = normalizeTitle(result.title);
  if (title && goldByTitle.has(title)) return goldByTitle.get(title);
  return null;
}

function isValidPaper(result) {
  const status = normalizeStatus(result.verification_status);
  const reason = normalizeStatus(result.verification_reason);
  return status === "verified" && reason.includes("title match") && reason.includes("journal match") && Boolean(normalizeDoi(result.doi));
}

function isTopJournal(result) {
  const rank = normalizeStatus(result.journal_rank);
  return rank.includes("국제 s급") || rank.includes("국제 a1급");
}

function hasOaAccess(result) {
  const status = normalizeStatus(result.unpaywall_status);
  return status === "found" || status === "oa" || Boolean(result.oa_pdf_url || result.oa_landing_page_url);
}

function dcg(gains) {
  return gains.reduce((total, gain, index) => total + (Math.pow(2, gain) - 1) / Math.log2(index + 2), 0);
}

function summarize(rows, metadata) {
  const numericKeys = [
    "precision_at_k",
    "ndcg_at_k",
    "gold_doi_hit_rate_at_k",
    "doi_accuracy_at_k",
    "paper_validity_rate_at_k",
    "top_journal_precision_at_k",
    "hallucination_rate_at_k",
    "oa_success_rate_at_k"
  ];
  const macroAverages = Object.fromEntries(numericKeys.map((key) => [key, average(rows.map((row) => Number.parseFloat(row[key] || "0")))]));
  const totals = rows.reduce(
    (acc, row) => {
      acc.tasks += 1;
      acc.results += Number.parseInt(row.result_count || "0", 10);
      acc.gold += Number.parseInt(row.gold_count || "0", 10);
      acc.verifiedGold += Number.parseInt(row.verified_gold_count || "0", 10);
      acc.goldMatches += row.matched_gold_ids ? row.matched_gold_ids.split(";").filter(Boolean).length : 0;
      acc.doiMatches += row.matched_dois ? row.matched_dois.split(";").filter(Boolean).length : 0;
      return acc;
    },
    { tasks: 0, results: 0, gold: 0, verifiedGold: 0, goldMatches: 0, doiMatches: 0 }
  );

  return {
    ...metadata,
    totals,
    macroAverages: Object.fromEntries(Object.entries(macroAverages).map(([key, value]) => [key, Number(value.toFixed(4))])),
    interpretation: {
      precision_at_k: "Exact DOI/title overlap against task gold rows with human_relevance >= 4.",
      ndcg_at_k: "Rank quality using matched gold human_relevance as gain.",
      gold_doi_hit_rate_at_k: "Exact DOI hits divided by verified DOI gold labels for the task.",
      doi_accuracy_at_k: "Share of returned DOI-bearing papers that the Worker marked Crossref-verified.",
      paper_validity_rate_at_k: "Share of returned papers with DOI, verified Crossref status, title match, and journal match.",
      top_journal_precision_at_k: "Share of returned papers in approved international S or A1 journals.",
      hallucination_rate_at_k: "One minus paper_validity_rate_at_k.",
      oa_success_rate_at_k: "Share of returned papers with successful OA metadata or OA URLs."
    }
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatRate(value) {
  return Number.isFinite(value) ? value.toFixed(4) : "0.0000";
}

function normalizeDoi(value) {
  return String(value ?? "").trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
}

function normalizeTitle(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toLowerCase();
}

function groupBy(rows, key) {
  const groups = new Map();
  for (const row of rows) {
    const groupKey = row[key] ?? "";
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(row);
  }
  return groups;
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--results") parsed.results = argv[++i];
    else if (arg === "--gold") parsed.gold = argv[++i];
    else if (arg === "--output") parsed.output = argv[++i];
    else if (arg === "--summary-output") parsed.summaryOutput = argv[++i];
    else if (arg === "--k") parsed.k = argv[++i];
  }
  return parsed;
}

function parseCsv(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const lines = trimmed.split(/\r?\n/);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function writeCsv(path, rows, headers) {
  const text = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header] ?? "")).join(","))].join("\n") + "\n";
  fs.writeFileSync(path, text, "utf8");
}

function escapeCsv(value) {
  const stringValue = String(value);
  if (!/[",\n\r]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
}
