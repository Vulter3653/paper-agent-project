#!/usr/bin/env node

import process from "node:process";

const PARENT_RUN_ID = "2026-05-31-expanded-t004-t020-parent";
const APPROVED_COMMAND_STATUS = "NOT_APPROVED_FOR_EXECUTION";
const ALLOWED_MODE = "plan";
const SCOPE_MATRIX = {
  "T004-T006": { runId: "2026-05-31-dryrun-t004-t006-batch-001", batchId: "batch-001-t004-t006", start: 3, limit: 3, taskCount: 3, risk: "LOWER" },
  "T004-T008": { runId: "2026-05-31-dryrun-t004-t008-batch-001", batchId: "batch-001-t004-t008", start: 3, limit: 5, taskCount: 5, risk: "MEDIUM" },
  "T004-T012": { runId: "2026-05-31-dryrun-t004-t012-batch-001", batchId: "batch-001-t004-t012", start: 3, limit: 9, taskCount: 9, risk: "HIGH" },
  "T004-T018": { runId: "2026-05-31-dryrun-t004-t018-batch-001", batchId: "batch-001-t004-t018", start: 3, limit: 15, taskCount: 15, risk: "VERY_HIGH" }
};
const ALLOWED_SCOPES = Object.keys(SCOPE_MATRIX);
const FORBIDDEN_KEYWORDS = ["t004-t020", "t001-t003", "t009-t020", "t019-t020", "all", "full", "execute", "seed", "import", "migration", "d1"];

const args = process.argv.slice(2);
const parsed = parseArgs(args);

if (!parsed.scope || !ALLOWED_SCOPES.includes(parsed.scope) || parsed.mode !== ALLOWED_MODE) fail(args);

const selected = SCOPE_MATRIX[parsed.scope];
const candidateCommand = [
  "node benchmark/scripts/run-proposed-agent.mjs",
  `--start ${selected.start}`,
  `--limit ${selected.limit}`,
  `--output benchmark/runs/${selected.runId}/proposed_agent_results.csv`,
  `--jobs-output benchmark/runs/${selected.runId}/proposed_agent_jobs.csv`
].join(" ");

validateCandidateCommand(candidateCommand, args);

console.log(
  JSON.stringify(
    {
      approvedForExecution: false,
      helperType: "expanded-dry-run-command-preparation",
      mode: ALLOWED_MODE,
      scope: parsed.scope,
      runId: selected.runId,
      parentRunId: PARENT_RUN_ID,
      batchId: selected.batchId,
      taskCount: selected.taskCount,
      risk: selected.risk,
      isDerived: 0,
      mergeStatus: "none",
      candidateCommandStatus: APPROVED_COMMAND_STATUS,
      candidateCommand,
      contractSatisfiedByCandidate: false,
      missingCapabilities: [
        "external run_id injection",
        "parent_run_id persistence",
        "batch_id persistence",
        "retry_count persistence",
        "last_error persistence",
        "last_error_at persistence",
        "explicit task id assertion",
        "D1 batch-aware run persistence"
      ],
      hardBoundaries: {
        executesBenchmark: false,
        writesFiles: false,
        touchesD1: false,
        runsMigration: false,
        allowsFullT004T020: false,
        allowsSeedImport: false,
        approvesExecution: false
      },
      warning: "This helper does not execute benchmarks. It only prints a non-approved candidate plan."
    },
    null,
    2
  )
);

function parseArgs(argv) {
  if (argv.some((arg) => FORBIDDEN_KEYWORDS.some((keyword) => arg.toLowerCase().includes(keyword)))) fail(argv);

  const parsedArgs = { mode: ALLOWED_MODE };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg !== "--scope" && arg !== "--mode") fail(argv);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(argv);
    if (arg === "--scope") parsedArgs.scope = value;
    if (arg === "--mode") parsedArgs.mode = value;
    index += 1;
  }
  return parsedArgs;
}

function validateCandidateCommand(command, receivedArgs) {
  const normalized = command.toLowerCase();
  const forbiddenCommandFragments = ["t004-t020", "seed", "import", "migration", "d1 execute"];
  if (forbiddenCommandFragments.some((fragment) => normalized.includes(fragment)) || APPROVED_COMMAND_STATUS !== "NOT_APPROVED_FOR_EXECUTION") fail(receivedArgs);
}

function fail(receivedArgs) {
  console.error(JSON.stringify({ approvedForExecution: false, error: "Forbidden or invalid argument", allowedScopes: ALLOWED_SCOPES, receivedArgs }, null, 2));
  process.exit(1);
}
