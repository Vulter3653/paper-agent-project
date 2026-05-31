import fs from "node:fs";
import process from "node:process";
import { spawnSync } from "node:child_process";

const CONTROLLED_RUN_ID = "2026-05-30-controlled-t001-t003";
const PROTECTED_T004_T006_RUN_ID = "2026-05-31-dryrun-t004-t006-batch-001";
const PARENT_RUN_ID = "2026-05-31-expanded-t004-t020-parent";
const RUNNER_PATH = "benchmark/scripts/run-proposed-agent.mjs";
const ALLOWED_MODES = new Set(["plan", "preflight", "execute"]);
const FORBIDDEN_FRAGMENTS = [
  "t004-t020",
  "t001-t020",
  "all",
  "full",
  "seed",
  "import",
  "migration",
  "d1 execute",
];

const SCOPES = {
  "T007-T012": {
    runId: "2026-05-31-dryrun-t007-t012-batch-002",
    batchId: "batch-002-t007-t012",
    start: 6,
    limit: 6,
  },
  "T013-T018": {
    runId: "2026-05-31-dryrun-t013-t018-batch-003",
    batchId: "batch-003-t013-t018",
    start: 12,
    limit: 6,
  },
  "T019-T020": {
    runId: "2026-05-31-dryrun-t019-t020-batch-004",
    batchId: "batch-004-t019-t020",
    start: 18,
    limit: 2,
  },
};

function fail(error, receivedArgs = process.argv.slice(2)) {
  console.error(
    JSON.stringify(
      {
        approvedForExecution: false,
        error,
        allowedScopes: Object.keys(SCOPES),
        receivedArgs,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

function parseArgs(args) {
  const options = {
    mode: "plan",
    scope: undefined,
    approvedRunId: undefined,
    writesArtifacts: false,
    callsProductionWorker: false,
    allowExistingArtifactDir: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--scope") {
      options.scope = args[++index];
    } else if (arg === "--mode") {
      options.mode = args[++index];
    } else if (arg === "--approved-run-id") {
      options.approvedRunId = args[++index];
    } else if (arg === "--i-understand-this-writes-artifacts") {
      options.writesArtifacts = true;
    } else if (arg === "--i-understand-this-calls-production-worker") {
      options.callsProductionWorker = true;
    } else if (arg === "--allow-existing-artifact-dir") {
      options.allowExistingArtifactDir = true;
    } else {
      fail(`Forbidden or invalid argument: ${arg}`, args);
    }
  }
  return options;
}

function candidateCommand(scope) {
  const artifactDir = `benchmark/runs/${scope.runId}`;
  return [
    "node",
    RUNNER_PATH,
    "--start",
    String(scope.start),
    "--limit",
    String(scope.limit),
    "--output",
    `${artifactDir}/proposed_agent_results.csv`,
    "--jobs-output",
    `${artifactDir}/proposed_agent_jobs.csv`,
  ].join(" ");
}

function assertSafetyContract(scopeName, scope, artifactDir, command) {
  const normalized = command.toLowerCase();
  for (const fragment of FORBIDDEN_FRAGMENTS) {
    if (normalized.includes(fragment)) {
      fail(`Candidate command contains forbidden fragment: ${fragment}`);
    }
  }

  const protectedDirs = new Set([
    `benchmark/runs/${CONTROLLED_RUN_ID}`,
    `benchmark/runs/${PROTECTED_T004_T006_RUN_ID}`,
  ]);
  if (protectedDirs.has(artifactDir)) {
    fail(`Artifact directory is protected: ${artifactDir}`);
  }
  if (!SCOPES[scopeName] || scope.limit <= 0 || scope.start < 0) {
    fail("Invalid staged scope metadata");
  }
}

function createSummary(options, scope, artifactDir, command) {
  return {
    approvedForExecution: false,
    helperType: "staged-expanded-artifact-dry-run",
    mode: options.mode,
    scope: options.scope,
    runId: scope.runId,
    parentRunId: PARENT_RUN_ID,
    batchId: scope.batchId,
    taskRange: options.scope,
    start: scope.start,
    limit: scope.limit,
    artifactDir,
    candidateCommand: command,
    willExecute: false,
    requiresApproval: true,
    retryPolicy: "none",
    contractSatisfiedByCurrentRunner: false,
    missingCapabilities: [
      "D1 batch-aware run persistence",
      "parent_run_id write",
      "batch_id write",
      "retry_count write",
      "last_error write",
      "last_error_at write",
    ],
    warning:
      "Artifact-only staged execution helper. It does not persist batch metadata to D1 and does not establish benchmark validation.",
  };
}

const options = parseArgs(process.argv.slice(2));
if (!options.scope || !SCOPES[options.scope]) {
  fail("Forbidden or invalid scope");
}
if (!ALLOWED_MODES.has(options.mode)) {
  fail("Forbidden or invalid mode");
}

const scope = SCOPES[options.scope];
const artifactDir = `benchmark/runs/${scope.runId}`;
const command = candidateCommand(scope);
assertSafetyContract(options.scope, scope, artifactDir, command);

const summary = createSummary(options, scope, artifactDir, command);
if (options.mode === "plan") {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

if (fs.existsSync(artifactDir) && !options.allowExistingArtifactDir) {
  fail(`Artifact directory already exists: ${artifactDir}`);
}

if (options.mode === "preflight") {
  console.log(
    JSON.stringify(
      {
        ...summary,
        preflightStatus: "PASS",
        safeToRequestApproval: true,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (
  !options.writesArtifacts ||
  !options.callsProductionWorker ||
  options.approvedRunId !== scope.runId
) {
  fail("Execute mode requires both approval flags and the exact approved run id");
}

if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

const runnerArgs = [
  RUNNER_PATH,
  "--start",
  String(scope.start),
  "--limit",
  String(scope.limit),
  "--output",
  `${artifactDir}/proposed_agent_results.csv`,
  "--jobs-output",
  `${artifactDir}/proposed_agent_jobs.csv`,
];
const result = spawnSync(process.execPath, runnerArgs, { stdio: "inherit" });
if (result.error) {
  fail(`Runner process failed: ${result.error.message}`);
}
if (result.status !== 0) {
  fail(`Runner exited with status ${result.status}`);
}

console.log(
  JSON.stringify(
    {
      ...summary,
      approvedForExecution: true,
      willExecute: true,
      executionStatus: "COMPLETED",
      warning:
        "Artifact-only staged execution completed. D1 batch-aware persistence remains unimplemented and full validation remains incomplete.",
    },
    null,
    2,
  ),
);
