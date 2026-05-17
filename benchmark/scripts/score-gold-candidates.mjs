#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";

const DEFAULT_CANDIDATES = "benchmark/gold_crossref_candidates.csv";
const DEFAULT_OUTPUT = "benchmark/gold_candidate_review.csv";
const JOURNAL_SOURCE = "packages/shared/src/businessSchoolJournals.ts";

const args = parseArgs(process.argv.slice(2));
const candidatesPath = args.candidates ?? DEFAULT_CANDIDATES;
const outputPath = args.output ?? DEFAULT_OUTPUT;

for (const path of [candidatesPath, JOURNAL_SOURCE]) {
  if (!fs.existsSync(path)) {
    console.error(`Input file not found: ${path}`);
    process.exit(1);
  }
}

const categories = parseJournalCategories(fs.readFileSync(JOURNAL_SOURCE, "utf8"));
const candidates = parseCsv(fs.readFileSync(candidatesPath, "utf8"));
const scored = candidates
  .map((candidate) => scoreCandidate(candidate, categories))
  .sort((a, b) => {
    if (a.task_id !== b.task_id) return a.task_id.localeCompare(b.task_id);
    return Number.parseFloat(b.review_score) - Number.parseFloat(a.review_score);
  });

fs.writeFileSync(outputPath, stringifyCsv(scored), "utf8");

const priorityCounts = scored.reduce((counts, row) => {
  counts[row.review_priority] = (counts[row.review_priority] ?? 0) + 1;
  return counts;
}, {});

console.log(
  JSON.stringify(
    {
      input: candidatesPath,
      output: outputPath,
      candidates: candidates.length,
      priorityCounts
    },
    null,
    2
  )
);

function scoreCandidate(candidate, categories) {
  const match = getJournalMatch(candidate.journal, categories, candidate.journal_category_id);
  const typeOk = candidate.type === "journal-article";
  const doiOk = Boolean(candidate.doi);
  const sameField = match?.categoryId === candidate.journal_category_id;
  const allowedJournal = Boolean(match);
  const topRank = match?.rank === "international_s" || match?.rank === "international_a1";
  const crossrefScore = Number.parseFloat(candidate.crossref_score || "0");
  const year = Number.parseInt(candidate.year || "0", 10);
  const recentEnough = Number.isFinite(year) && year >= 2020;

  let score = 0;
  if (typeOk) score += 25;
  if (doiOk) score += 15;
  if (allowedJournal) score += 25;
  if (sameField) score += 20;
  if (topRank) score += 10;
  if (recentEnough) score += 5;
  score += Math.min(crossrefScore, 60) / 60 * 10;

  const reviewPriority =
    typeOk && doiOk && sameField && topRank
      ? "promote_candidate"
      : typeOk && doiOk && allowedJournal
        ? "review_field_mismatch"
        : typeOk && doiOk
          ? "topic_only_review"
          : "reject_low_priority";

  return {
    ...candidate,
    allowlist_match: allowedJournal ? "yes" : "no",
    match_category_id: match?.categoryId ?? "",
    match_category_label: match?.categoryLabel ?? "",
    match_rank: match?.rankLabel ?? "",
    same_field: sameField ? "yes" : "no",
    article_type_ok: typeOk ? "yes" : "no",
    doi_ok: doiOk ? "yes" : "no",
    recent_enough: recentEnough ? "yes" : "no",
    review_score: score.toFixed(2),
    review_priority: reviewPriority
  };
}

function parseJournalCategories(source) {
  const categoryBlocks = [...source.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?label:\s*"([^"]+)"[\s\S]*?internationalS:\s*\[([\s\S]*?)\][\s\S]*?internationalA1:\s*\[([\s\S]*?)\][\s\S]*?domesticA:\s*\[([\s\S]*?)\][\s\S]*?\}/g)];
  return categoryBlocks.map((match) => ({
    id: match[1],
    label: match[2],
    internationalS: parseStringArray(match[3]),
    internationalA1: parseStringArray(match[4]),
    domesticA: parseStringArray(match[5])
  }));
}

function parseStringArray(value) {
  return [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function getJournalMatch(journal, categories, preferredCategoryId) {
  const normalized = normalizeJournalName(journal);
  const normalizedSingular = normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
  const orderedCategories = [
    ...categories.filter((category) => category.id === preferredCategoryId),
    ...categories.filter((category) => category.id !== preferredCategoryId)
  ];

  for (const category of orderedCategories) {
    const rankMatch =
      getRankMatch(category.internationalS, normalized, normalizedSingular, "international_s", "국제 S급") ??
      getRankMatch(category.internationalA1, normalized, normalizedSingular, "international_a1", "국제 A1급") ??
      getRankMatch(category.domesticA, normalized, normalizedSingular, "domestic_a", "국내 A급");

    if (rankMatch) return { categoryId: category.id, categoryLabel: category.label, ...rankMatch };
  }
  return null;
}

function getRankMatch(journals, normalized, normalizedSingular, rank, rankLabel) {
  const matches = journals.some((journal) => {
    const normalizedJournal = normalizeJournalName(journal);
    return normalizedJournal === normalized || normalizedJournal === normalizedSingular;
  });
  return matches ? { rank, rankLabel } : null;
}

function normalizeJournalName(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\bthe\b/g, " ")
    .replace(/[^a-z0-9가-힣]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--candidates") parsed.candidates = argv[++i];
    else if (arg === "--output") parsed.output = argv[++i];
  }
  return parsed;
}

function parseCsv(text) {
  const lines = splitCsvRecords(text.trim());
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function splitCsvRecords(text) {
  const records = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && text[i + 1] === '"') {
      current += '""';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
      current += char;
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (current.trim()) records.push(current);
      current = "";
      if (char === "\r" && text[i + 1] === "\n") i += 1;
    } else {
      current += char;
    }
  }
  if (current.trim()) records.push(current);
  return records;
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

function stringifyCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header] ?? "")).join(","))].join("\n") + "\n";
}

function escapeCsv(value) {
  const stringValue = String(value);
  if (!/[",\n\r]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
}
