#!/usr/bin/env node

import fs from "node:fs";
import process from "node:process";
import { spawnSync } from "node:child_process";

const CONTROLLED_RUN_ID = "2026-05-30-controlled-t001-t003";
const PARENT_RUN_ID = "2026-05-31-expanded-t004-t020-parent";
const EXECUTABLE_SCOPE = "T004-T006";
const RUNNER_PATH = "benchmark/scripts/run-proposed-agent.mjs";
const MODES = new Set(["plan", "preflight", "execute"]);
const SCOPE_MATRIX = {
  "T004-T006": { runId: "2026-05-31-dryrun-t004-t006-batch-001", batchId: "batch-001-t004-t006", start: 3, limit: 3, executionPolicy: "execute-capable-after-explicit-approval" },
  "T004-T008": { runId: "2026-05-31-dryrun-t004-t008-batch-001", batchId: "batch-001-t004-t008", start: 3, limit: 5, executionPolicy: "plan-only" },
  "T004-T012": { runId: "2026-05-31-dryrun-t004-t012-batch-001", batchId: "batch-001-t004-t012", start: 3, limit: 9, executionPolicy: "plan-only" },
  "T004-T018": { runId: "2026-05-31-dryrun-t004-t018-batch-001", batchId: "batch-001-t004-t018", start: 3, limit: 15, executionPolicy: "plan-only" }
};
const FORBIDDEN_COMMAND_FRAGMENTS = ["t004-t020", "seed", "import", "migration", "d1 execute"];
const REQUIRED_EXECUTE_FLAGS = ["iUnderstandThisWritesArtifacts", "iUnderstandThisCallsProductionWorker"];

const parsed = parseArgs(process.argv.slice(2));
const selected = SCOPE_MATRIX[parsed.scope];

if (!selected) fail("Forbidden or invalid scope", parsed);
if (!MODES.has(parsed.mode)) fail("Forbidden or invalid mode", parsed);
if (parsed.mode !== "plan" && parsed.scope !== EXECUTABLE_SCOPE) fail("Only T004-T006 supports preflight or execute mode", parsed);

const artifactDir = `benchmark/runs/${selected.runId}`;
const controlledArtifactDir = `benchmark/runs/${CONTROLLED_RUN_ID}`;
const runnerArgs = [
  RUNNER_PATH,
  "--start",
  String(selected.start),
  "--limit",
  String(selected.limit),
  "--output",
  `${artifactDir}/proposed_agent_results.csv`,
  "--jobs-output",
  `${artifactDir}/proposed_agent_jobs.csv`
];
const candidateCommand = ["node", ...runnerArgs].join(" ");

validateSafetyContract({ candidateCommand, artifactDir, controlledArtifactDir, selected });

if (parsed.mode === "plan") {
  printSummary({ parsed, selected, artifactDir, candidateCommand, willExecute: false });
  process.exit(0);
}

const artifactDirExists = fs.existsSync(artifactDir);
if (parsed.mode === "preflight") {
  if (artifactDirExists) fail("Artifact directory already exists; isolated execution path is required", parsed);
  printSummary({ parsed, selected, artifactDir, candidateCommand, willExecute: false, preflightStatus: "PASS", safeToRequestApproval: true });
  process.exit(0);
}

validateExecuteApproval(parsed, selected, artifactDirExists);
if (!artifactDirExists) fs.mkdirSync(artifactDir, { recursive: false });
const result = spawnSync(process.execPath, runnerArgs, { stdio: "inherit" });

if (result.error) fail(`Runner launch failed: ${result.error.message}`, parsed);
if (result.status !== 0) fail(`Runner exited with status ${result.status}`, parsed);

printSummary({
  parsed,
  selected,
  artifactDir,
  candidateCommand,
  approvedForExecution: true,
  willExecute: true,
  executionStatus: "completed",
  warning: "Artifact-only dry-run completed. This does not yet persist batch metadata to D1."
});

function parseArgs(argv) {
  const parsedArgs = { mode: "plan" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--scope" || arg === "--mode" || arg === "--approved-run-id") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) fail("Forbidden or invalid argument", { receivedArgs: argv });
      if (arg === "--scope") parsedArgs.scope = value;
      if (arg === "--mode") parsedArgs.mode = value;
      if (arg === "--approved-run-id") parsedArgs.approvedRunId = value;
      index += 1;
    } else if (arg === "--i-understand-this-writes-artifacts") {
      parsedArgs.iUnderstandThisWritesArtifacts = true;
    } else if (arg === "--i-understand-this-calls-production-worker") {
      parsedArgs.iUnderstandThisCallsProductionWorker = true;
    } else if (arg === "--allow-existing-artifact-dir") {
      parsedArgs.allowExistingArtifactDir = true;
    } else {
      fail("Forbidden or invalid argument", { receivedArgs: argv });
    }
  }
  return parsedArgs;
}

function validateSafetyContract({ candidateCommand, artifactDir, controlledArtifactDir, selected }) {
  const normalized = candidateCommand.toLowerCase();
  if (FORBIDDEN_COMMAND_FRAGMENTS.some((fragment) => normalized.includes(fragment))) fail("Candidate command contains a forbidden fragment", { candidateCommand });
  if (selected.runId === CONTROLLED_RUN_ID || artifactDir === controlledArtifactDir) fail("Controlled T001-T003 run is protected", { artifactDir });
  if (!candidateCommand.includes(`--start ${selected.start} --limit ${selected.limit}`)) fail("Candidate command does not match the selected scope", { candidateCommand });
}

function validateExecuteApproval(parsedArgs, selected, artifactDirExists) {
  if (parsedArgs.scope !== EXECUTABLE_SCOPE || selected.executionPolicy !== "execute-capable-after-explicit-approval") fail("Execute mode is restricted to T004-T006", parsedArgs);
  if (REQUIRED_EXECUTE_FLAGS.some((flag) => parsedArgs[flag] !== true)) fail("Execute mode requires explicit approval flags", parsedArgs);
  if (parsedArgs.approvedRunId !== selected.runId) fail("Execute mode requires the exact approved run ID", parsedArgs);
  if (artifactDirExists && !parsedArgs.allowExistingArtifactDir) fail("Artifact directory already exists; explicit override is required", parsedArgs);
}

function printSummary({ parsed: parsedArgs, selected, artifactDir, candidateCommand, approvedForExecution = false, willExecute, ...extra }) {
  console.log(JSON.stringify({
    approvedForExecution,
    mode: parsedArgs.mode,
    scope: parsedArgs.scope,
    runId: selected.runId,
    parentRunId: PARENT_RUN_ID,
    batchId: selected.batchId,
    taskRange: parsedArgs.scope,
    start: selected.start,
    limit: selected.limit,
    artifactDir,
    candidateCommand,
    willExecute,
    requiresApproval: parsedArgs.mode !== "execute",
    contractSatisfiedByCurrentRunner: false,
    missingCapabilities: [
      "D1 batch-aware run persistence",
      "parent_run_id write",
      "batch_id write",
      "retry_count write",
      "last_error write",
      "last_error_at write"
    ],
    ...extra
  }, null, 2));
}

function fail(error, details = {}) {
  console.error(JSON.stringify({ ok: false, error, ...details }, null, 2));
  process.exit(1);
}
