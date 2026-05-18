#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";

const DEFAULT_TASKS = "benchmark/tasks.jsonl";
const DEFAULT_RESULTS = "benchmark/proposed_agent_results.csv";
const DEFAULT_JOBS = "benchmark/proposed_agent_jobs.csv";
const DEFAULT_WORKER_URL = "https://paper-agent-project.shch3653.workers.dev";

const args = parseArgs(process.argv.slice(2));
const tasksPath = args.tasks ?? DEFAULT_TASKS;
const outputPath = args.output ?? DEFAULT_RESULTS;
const jobsOutputPath = args.jobsOutput ?? DEFAULT_JOBS;
const workerUrl = (args.workerUrl ?? process.env.WORKER_API_BASE_URL ?? DEFAULT_WORKER_URL).replace(/\/$/, "");
const limit = args.limit ? Number.parseInt(args.limit, 10) : Number.POSITIVE_INFINITY;
const start = args.start ? Number.parseInt(args.start, 10) : 0;
const pollMs = args.pollMs ? Number.parseInt(args.pollMs, 10) : 5000;
const delayMs = args.delayMs ? Number.parseInt(args.delayMs, 10) : 1500;
const timeoutMs = args.timeoutMs ? Number.parseInt(args.timeoutMs, 10) : 240000;
const maxResultsOverride = args.maxResults ? Number.parseInt(args.maxResults, 10) : undefined;

if (!fs.existsSync(tasksPath)) {
  console.error(`Input file not found: ${tasksPath}`);
  process.exit(1);
}

const allTasks = fs
  .readFileSync(tasksPath, "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line));
const tasks = allTasks.slice(start, Number.isFinite(limit) ? start + limit : undefined);

const resultRows = [];
const jobRows = [];

for (const [index, task] of tasks.entries()) {
  const payload = {
    keyword: task.keyword,
    yearStart: task.year_start,
    yearEnd: task.year_end,
    maxResults: maxResultsOverride ?? task.max_results,
    journalCategoryId: task.journal_category_id
  };
  const startedAt = new Date().toISOString();
  try {
    const created = await postJson(`${workerUrl}/api/search-jobs`, payload);
    const final = await waitForJob(created.job.id, workerUrl, pollMs, timeoutMs);
    const job = final.job;
    const papers = Array.isArray(final.papers) ? final.papers : [];

    jobRows.push({
      task_id: task.task_id,
      keyword: task.keyword,
      journal_category_id: task.journal_category_id,
      job_id: job.id,
      status: job.status,
      current_step: job.currentStep,
      source_result_count: String(job.sourceResultCount ?? ""),
      allowed_result_count: String(job.allowedResultCount ?? papers.length),
      paper_count: String(papers.length),
      started_at: startedAt,
      completed_at: job.completedAt ?? new Date().toISOString(),
      error_message: job.errorMessage ?? ""
    });

    papers.forEach((paper, paperIndex) => {
      resultRows.push({
        task_id: task.task_id,
        keyword: task.keyword,
        job_id: job.id,
        result_rank: String(paper.rank ?? paperIndex + 1),
        paper_id: paper.id ?? "",
        title: paper.title ?? "",
        authors: paper.authors ?? "",
        year: String(paper.year ?? ""),
        journal: paper.journalName ?? "",
        journal_field: paper.journalField ?? "",
        journal_rank: paper.journalRank ?? "",
        doi: paper.doi ?? "",
        final_score: String(paper.finalScore ?? ""),
        abstract_score: String(paper.abstractScore ?? ""),
        include_status: paper.includeStatus ?? "",
        verification_status: paper.verificationStatus ?? "",
        verification_reason: paper.verificationReason ?? "",
        unpaywall_status: paper.unpaywallStatus ?? "",
        oa_pdf_url: paper.oaPdfUrl ?? "",
        oa_landing_page_url: paper.oaLandingPageUrl ?? "",
        cited_by_count: String(paper.citedByCount ?? ""),
        relevance_reason: paper.relevanceReason ?? ""
      });
    });
  } catch (error) {
    jobRows.push({
      task_id: task.task_id,
      keyword: task.keyword,
      journal_category_id: task.journal_category_id,
      job_id: "",
      status: "failed",
      current_step: "benchmark_runner",
      source_result_count: "",
      allowed_result_count: "",
      paper_count: "0",
      started_at: startedAt,
      completed_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : String(error)
    });
  }

  if (index < tasks.length - 1) await sleep(delayMs);
}

writeCsv(outputPath, resultRows, [
  "task_id",
  "keyword",
  "job_id",
  "result_rank",
  "paper_id",
  "title",
  "authors",
  "year",
  "journal",
  "journal_field",
  "journal_rank",
  "doi",
  "final_score",
  "abstract_score",
  "include_status",
  "verification_status",
  "verification_reason",
  "unpaywall_status",
  "oa_pdf_url",
  "oa_landing_page_url",
  "cited_by_count",
  "relevance_reason"
]);
writeCsv(jobsOutputPath, jobRows, [
  "task_id",
  "keyword",
  "journal_category_id",
  "job_id",
  "status",
  "current_step",
  "source_result_count",
  "allowed_result_count",
  "paper_count",
  "started_at",
  "completed_at",
  "error_message"
]);

console.log(
  JSON.stringify(
    {
      workerUrl,
      tasksRequested: tasks.length,
      jobRows: jobRows.length,
      resultRows: resultRows.length,
      output: outputPath,
      jobsOutput: jobsOutputPath
    },
    null,
    2
  )
);

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await readResponseError(response, `POST ${url} failed`));
  return response.json();
}

async function waitForJob(jobId, baseUrl, pollIntervalMs, maxWaitMs) {
  const started = Date.now();
  while (Date.now() - started < maxWaitMs) {
    const response = await fetch(`${baseUrl}/api/search-jobs/${jobId}`);
    if (!response.ok) throw new Error(await readResponseError(response, `GET job ${jobId} failed`));
    const data = await response.json();
    if (data.job?.status === "completed" || data.job?.status === "failed") return data;
    await sleep(pollIntervalMs);
  }
  throw new Error(`Timed out waiting for job ${jobId}`);
}

async function readResponseError(response, fallback) {
  try {
    const data = await response.json();
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--tasks") parsed.tasks = argv[++i];
    else if (arg === "--output") parsed.output = argv[++i];
    else if (arg === "--jobs-output") parsed.jobsOutput = argv[++i];
    else if (arg === "--worker-url") parsed.workerUrl = argv[++i];
    else if (arg === "--limit") parsed.limit = argv[++i];
    else if (arg === "--start") parsed.start = argv[++i];
    else if (arg === "--poll-ms") parsed.pollMs = argv[++i];
    else if (arg === "--delay-ms") parsed.delayMs = argv[++i];
    else if (arg === "--timeout-ms") parsed.timeoutMs = argv[++i];
    else if (arg === "--max-results") parsed.maxResults = argv[++i];
  }
  return parsed;
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
