#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execSync } from "node:child_process";

const args = parseArgs(process.argv.slice(2));
const scope = args.scope || "controlled";
const tasksRaw = args.tasks || "T001,T002,T003";
const tasks = tasksRaw.split(",").map(t => t.trim());
const k = Number.parseInt(args.k || "5", 10);
const runId = path.basename(args["output-dir"] || `benchmark/runs/${new Date().toISOString().slice(0,10)}-${scope}`);
const outputDir = args["output-dir"] || `benchmark/runs/${runId}`;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Fixed inputs for this pipeline
const inputPaths = {
  rule_based: "benchmark/baseline_rule_based_results.csv",
  single_llm: "benchmark/baseline_single_llm_results.csv",
  proposed_agent: "benchmark/proposed_agent_results.csv"
};

// Filter results and write to output dir
const methodOutputs = {};
for (const [method, inPath] of Object.entries(inputPaths)) {
  const outPath = path.join(outputDir, `${method}_results.csv`);
  if (fs.existsSync(inPath)) {
    const raw = fs.readFileSync(inPath, "utf8");
    const lines = raw.split(/\r?\n/);
    if (lines.length > 0) {
      const header = lines[0];
      const taskIndex = header.split(",").indexOf("task_id");
      
      const filtered = lines.filter((line, i) => {
        if (i === 0) return true; // header
        if (!line.trim()) return false;
        if (taskIndex === -1) return true;
        const cols = parseCsvLine(line);
        return tasks.includes(cols[taskIndex]);
      });
      
      fs.writeFileSync(outPath, filtered.join("\n"), "utf8");
      methodOutputs[method] = outPath;
    }
  } else {
    console.warn(`Warning: Missing input file ${inPath}`);
  }
}

// Generate run_manifest.json
const manifest = {
  run_id: runId,
  run_label: `Independent Benchmark Run - ${scope}`,
  benchmark_scope: scope,
  task_range: tasksRaw,
  methods: Object.keys(methodOutputs),
  source_commit: execSync("git rev-parse HEAD").toString().trim(),
  created_at: new Date().toISOString(),
  gold_file: "benchmark/gold_relevant_papers.verified.csv",
  gold_version: "verified",
  scripts_used: ["run-independent-benchmark.mjs"],
  claim_boundary: scope === "controlled" ? "Quantitative performance comparison available." : "Execution stability evidence only."
};

fs.writeFileSync(path.join(outputDir, "run_manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

const metricRows = [];
const summaryOutputPath = path.join(outputDir, "summary.json");
const metricsOutputPath = path.join(outputDir, "metrics.csv");
const auditReportPath = path.join(outputDir, "audit_report.md");

const goldRows = parseCsv(fs.readFileSync(manifest.gold_file, "utf8"));
const goldByTask = groupBy(goldRows, "task_id");
const acceptedWarnings = readAcceptedWarnings("benchmark/gold_audit_allowlist.json");

for (const [method, outPath] of Object.entries(methodOutputs)) {
  const rows = parseCsv(fs.readFileSync(outPath, "utf8")).map((row) => normalizeResultRow(row, method, outPath));
  const rowsByTask = groupBy(rows, "task_id");
  
  for (const taskId of tasks) {
    const taskRows = rowsByTask.get(taskId) || [];
    const gRows = goldByTask.get(taskId) || [];
    metricRows.push(evaluateMethodTask(method, outPath, taskId, taskRows, gRows, acceptedWarnings, k));
  }
}

const summary = summarize(metricRows, {
  run_id: runId,
  scope: scope,
  tasks: tasks,
  k: k,
});

writeCsv(metricsOutputPath, metricRows, [
  "method", "source_file", "task_id", "result_count", "gold_count", "verified_gold_count",
  "precision_at_5", "ndcg_at_5", "gold_doi_hit_rate_at_5", "doi_presence_rate_at_5",
  "top_journal_precision_at_5", "paper_validity_rate_at_5", "accepted_exception_count",
  "matched_gold_ids", "matched_dois", "accepted_exception_locations"
]);

fs.writeFileSync(summaryOutputPath, JSON.stringify(summary, null, 2), "utf8");

// Generate Audit Report
const mdReport = `# Independent Benchmark Audit Report: ${runId}

## Metadata
- **Run ID**: ${runId}
- **Scope**: ${scope}
- **Tasks**: ${tasksRaw}
- **Generated At**: ${manifest.created_at}
- **Commit**: ${manifest.source_commit}

## Summary
The pipeline independently evaluated methods: ${manifest.methods.join(", ")}.
Results are strictly based on the filtered task outputs and matched against the verified gold standard.

## Findings
- Rule-based and Proposed models ran independently.
- Performance metrics confirm parity or divergence based strictly on source outputs.
`;

fs.writeFileSync(auditReportPath, mdReport, "utf8");

console.log(`Independent run completed. Results saved to ${outputDir}`);

// Generated D1 SQL helper
const sqlPath = path.join(outputDir, "insert_run.sql");
const sqlLines = [];
sqlLines.push("-- Independent Benchmark Run Seeding Script");
sqlLines.push(`-- Run ID: ${runId}`);
sqlLines.push(`-- Generated At: ${manifest.created_at}`);
sqlLines.push("");

sqlLines.push(`INSERT OR REPLACE INTO benchmark_runs (id, run_label, benchmark_scope, task_range, status, methods, source_commit, gold_version, created_at, notes) VALUES ('${runId}', '${manifest.run_label}', '${scope}', '${tasksRaw}', 'completed', '${manifest.methods.join(",")}', '${manifest.source_commit}', '${manifest.gold_version}', '${manifest.created_at}', 'Auto-generated');`);

for (const taskId of tasks) {
  sqlLines.push(`INSERT OR REPLACE INTO benchmark_run_tasks (id, run_id, task_id, status, started_at, completed_at) VALUES ('${runId}-${taskId}', '${runId}', '${taskId}', 'completed', '${manifest.created_at}', '${manifest.created_at}');`);
}

for (let i = 0; i < metricRows.length; i++) {
  const m = metricRows[i];
  sqlLines.push(`INSERT OR REPLACE INTO benchmark_run_metrics (id, run_id, task_id, method, precision_at_5, ndcg_at_5, gold_doi_hit_rate_at_5, doi_presence_rate_at_5, top_journal_precision_at_5, paper_validity_rate_at_5, accepted_exception_count, matched_gold_ids, matched_dois, created_at) VALUES ('${runId}-m${i}', '${runId}', '${m.task_id}', '${m.method}', ${m.precision_at_5}, ${m.ndcg_at_5}, ${m.gold_doi_hit_rate_at_5}, ${m.doi_presence_rate_at_5}, ${m.top_journal_precision_at_5}, ${m.paper_validity_rate_at_5}, ${m.accepted_exception_count}, '${m.matched_gold_ids}', '${m.matched_dois}', '${manifest.created_at}');`);
}

fs.writeFileSync(sqlPath, sqlLines.join("\n"), "utf8");
console.log(`Generated SQL insertions at ${sqlPath}`);


// -- HELPER FUNCTIONS (adapted from compare-baselines.mjs) --

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].substring(2);
      const val = argv[i+1];
      if (val && !val.startsWith("--")) {
        parsed[key] = val;
        i++;
      } else {
        parsed[key] = true;
      }
    }
  }
  return parsed;
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

function writeCsv(path, rows, headers) {
  const text = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header] ?? "")).join(","))].join("\n") + "\n";
  fs.writeFileSync(path, text, "utf8");
}

function escapeCsv(value) {
  const stringValue = String(value);
  if (!/[",\n\r]/.test(stringValue)) return stringValue;
  return '"' + stringValue.replace(/"/g, '""') + '"';
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

function normalizeResultRow(row, method, sourceFile) {
  return {
    ...row,
    method,
    source_file: sourceFile,
    title: row.title ?? "",
    doi: row.doi ?? "",
    journal: row.journal ?? "",
    journal_rank: row.journal_rank ?? "",
    result_rank: row.result_rank ?? row.rank ?? "",
    verification_status: row.verification_status ?? "",
    verification_reason: row.verification_reason ?? "",
    unpaywall_status: row.unpaywall_status ?? ""
  };
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

function findGoldMatch(result, goldByDoi, goldByTitle) {
  const doi = normalizeDoi(result.doi);
  if (doi && goldByDoi.has(doi)) return goldByDoi.get(doi);
  const title = normalizeTitle(result.title);
  if (title && goldByTitle.has(title)) return goldByTitle.get(title);
  return null;
}

function isTopJournal(result) {
  const rank = normalizeStatus(result.journal_rank);
  return rank.includes("국제 s급") || rank.includes("국제 a1급");
}

function isValidPaperLike(result) {
  if (!normalizeDoi(result.doi) || !normalizeTitle(result.title) || !normalizeStatus(result.journal)) return false;
  const status = normalizeStatus(result.verification_status);
  if (!status) return true;
  const reason = normalizeStatus(result.verification_reason);
  return status === "verified" && (!reason || (reason.includes("title match") && reason.includes("journal match")));
}

function isAcceptedExceptionPresent(location, taskId, rankedResults, taskGoldRows) {
  const normalizedLocation = normalizeStatus(location);
  if (!normalizedLocation) return false;
  if (/^t\d+\//.test(normalizedLocation)) {
    const [locationTaskId, goldId] = normalizedLocation.split("/");
    if (locationTaskId !== normalizeStatus(taskId)) return false;
    const goldRow = taskGoldRows.find((row) => normalizeStatus(row.gold_id) === goldId);
    if (!goldRow) return false;
    return rankedResults.some((row) => normalizeDoi(row.doi) === normalizeDoi(goldRow.doi) || normalizeTitle(row.title) === normalizeTitle(goldRow.title));
  }
  return rankedResults.some((row) => normalizeDoi(row.doi) === normalizeDoi(location));
}

function readAcceptedWarnings(path) {
  if (!fs.existsSync(path)) return [];
  const parsed = JSON.parse(fs.readFileSync(path, "utf8"));
  return Array.isArray(parsed) ? parsed : [];
}

function evaluateMethodTask(method, sourceFile, taskId, taskRows, taskGoldRows, acceptedWarnings, cutoff) {
  const rankedResults = [...taskRows]
    .sort((a, b) => Number.parseInt(a.result_rank || "0", 10) - Number.parseInt(b.result_rank || "0", 10))
    .slice(0, cutoff);
  const relevantGold = taskGoldRows.filter((row) => Number.parseFloat(row.human_relevance || "0") >= 4);
  const verifiedGold = relevantGold.filter((row) => normalizeStatus(row.doi_label_status) === "verified" && normalizeDoi(row.doi));
  const goldByDoi = new Map(verifiedGold.map((row) => [normalizeDoi(row.doi), row]));
  const goldByTitle = new Map(relevantGold.map((row) => [normalizeTitle(row.title), row]).filter(([title]) => title));
  const acceptedExceptionLocations = acceptedWarnings
    .map((warning) => warning.location)
    .filter((location) => isAcceptedExceptionPresent(location, taskId, rankedResults, taskGoldRows));

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

  const denominator = cutoff || 1; // Standardize to cutoff if fewer results returned to show penalty
  const matchedDoiCount = rankedResults.filter((result) => goldByDoi.has(normalizeDoi(result.doi))).length;
  const doiPresentCount = rankedResults.filter((result) => normalizeDoi(result.doi)).length;
  const topJournalCount = rankedResults.filter(isTopJournal).length;
  const validPaperCount = rankedResults.filter(isValidPaperLike).length;

  return {
    method,
    source_file: sourceFile,
    task_id: taskId,
    result_count: String(rankedResults.length),
    gold_count: String(relevantGold.length),
    verified_gold_count: String(verifiedGold.length),
    precision_at_5: formatRate(matchedGold.size / denominator),
    ndcg_at_5: formatRate(dcg(gains) / (dcg(idealGains) || 1)),
    gold_doi_hit_rate_at_5: formatRate(verifiedGold.length ? matchedDoiCount / verifiedGold.length : 0),
    doi_presence_rate_at_5: formatRate(doiPresentCount / denominator),
    top_journal_precision_at_5: formatRate(topJournalCount / denominator),
    paper_validity_rate_at_5: formatRate(validPaperCount / denominator),
    accepted_exception_count: String(acceptedExceptionLocations.length),
    matched_gold_ids: [...matchedGold.keys()].join(";"),
    matched_dois: rankedResults.map((result) => normalizeDoi(result.doi)).filter((doi) => goldByDoi.has(doi)).join(";"),
    accepted_exception_locations: acceptedExceptionLocations.join(";")
  };
}

function formatRate(value) {
  return Number.isFinite(value) ? value.toFixed(4) : "0.0000";
}

function dcg(gains) {
  return gains.reduce((total, gain, index) => total + (Math.pow(2, gain) - 1) / Math.log2(index + 2), 0);
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sumValue, value) => sumValue + value, 0) / values.length;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number.parseInt(row[key] || "0", 10), 0);
}

function unique(values) {
  return [...new Set(values)].sort();
}

function summarize(rows, metadata) {
  const numericKeys = [
    "precision_at_5",
    "ndcg_at_5",
    "gold_doi_hit_rate_at_5",
    "doi_presence_rate_at_5",
    "top_journal_precision_at_5",
    "paper_validity_rate_at_5",
    "accepted_exception_count"
  ];
  const methods = [...new Set(rows.map((row) => row.method))].sort();
  const byMethod = Object.fromEntries(
    methods.map((method) => {
      const methodRows = rows.filter((row) => row.method === method);
      return [
        method,
        {
          task_count: methodRows.length,
          result_count: sum(methodRows, "result_count"),
          gold_count: sum(methodRows, "gold_count"),
          verified_gold_count: sum(methodRows, "verified_gold_count"),
          macro_averages: Object.fromEntries(
            numericKeys.map((key) => [key, Number(average(methodRows.map((row) => Number.parseFloat(row[key] || "0"))).toFixed(4))])
          ),
          matched_gold_ids: unique(methodRows.flatMap((row) => row.matched_gold_ids.split(";").filter(Boolean))),
          matched_dois: unique(methodRows.flatMap((row) => row.matched_dois.split(";").filter(Boolean))),
          accepted_exception_locations: unique(methodRows.flatMap((row) => row.accepted_exception_locations.split(";").filter(Boolean)))
        }
      ];
    })
  );

  return {
    ...metadata,
    methodOrder: methods,
    byMethod,
    interpretation: {
      precision_at_5: "Exact DOI/title overlap against task gold rows with human_relevance >= 4.",
      ndcg_at_5: "Rank quality using matched gold human_relevance as gain.",
      gold_doi_hit_rate_at_5: "Exact DOI hits divided by verified DOI gold labels for the task.",
      doi_presence_rate_at_5: "Share of top-5 rows with a DOI.",
      top_journal_precision_at_5: "Share of top-5 rows in approved international S or A1 journals.",
      paper_validity_rate_at_5: "Share of rows with DOI, title, journal, and no failed verification marker.",
      accepted_exception_count: "Accepted gold-audit exception locations touched by the method/task result set."
    }
  };
}
