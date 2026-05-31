#!/usr/bin/env node

import process from "node:process";

const EXPECTED_SCOPE = "T004-T006";
const RUN_ID = "2026-05-31-dryrun-t004-t006-batch-001";
const PARENT_RUN_ID = "2026-05-31-expanded-t004-t020-parent";
const BATCH_ID = "batch-001-t004-t006";

const args = process.argv.slice(2);

if (args.length !== 2 || args[0] !== "--scope" || args[1] !== EXPECTED_SCOPE) {
  console.error(
    JSON.stringify(
      {
        approvedForExecution: false,
        error: `Forbidden or missing scope. Use only: --scope ${EXPECTED_SCOPE}`,
        allowedScope: EXPECTED_SCOPE
      },
      null,
      2
    )
  );
  process.exit(1);
}

const candidateCommand = [
  "node benchmark/scripts/run-proposed-agent.mjs",
  "--start 3",
  "--limit 3",
  `--output benchmark/runs/${RUN_ID}/proposed_agent_results.csv`,
  `--jobs-output benchmark/runs/${RUN_ID}/proposed_agent_jobs.csv`
].join(" ");

console.log(
  JSON.stringify(
    {
      approvedForExecution: false,
      scope: EXPECTED_SCOPE,
      runId: RUN_ID,
      parentRunId: PARENT_RUN_ID,
      batchId: BATCH_ID,
      candidateCommand,
      candidateCommandStatus: "NOT APPROVED FOR EXECUTION",
      requiresFutureBatchAwareImplementation: true,
      warning: "This helper does not execute benchmarks. User approval is required before any dry-run execution."
    },
    null,
    2
  )
);
