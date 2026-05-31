# Live Benchmark Verification Report (2026-05-31)

This document provides evidence of the successful deployment and verification of the Independent Benchmark Evaluation Pipeline on the Production environment.

## Verification Metadata
- **Verification Date**: 2026-05-31
- **Verifier**: Gemini CLI (gemini)
- **Status**: SUCCESS
- **Worker URL**: [https://paper-agent-project.shch3653.workers.dev](https://paper-agent-project.shch3653.workers.dev)
- **Dashboard URL**: [https://paper-agent-project.pages.dev/dashboard/evaluation](https://paper-agent-project.pages.dev/dashboard/evaluation)
- **Claim Boundary**: Controlled T001-T003 benchmark only; T001-T018 expanded evidence is partial.

## Production D1 Seeding
- **Database**: `paper_agent_db`
- **Seed SQL**: `benchmark/runs/2026-05-30-controlled-t001-t003/insert_run.sql`
- **Run ID**: `2026-05-30-controlled-t001-t003`
- **Source Commit**: `f36a9c25b72bc7a6a58bd3d02bb69cf1bedce2fd`
- **Benchmark Scope**: `controlled` (Tasks T001, T002, T003)

## Data Integrity Verification (D1)
- `benchmark_runs`: 1 row confirmed.
- `benchmark_run_metrics`: 9 rows confirmed (3 methods x 3 tasks).

## Production API Evidence
The following raw responses have been captured as JSON in the `docs/` folder:
1. `/api/benchmark-runs`: `docs/api-benchmark-runs.json`
2. `/api/benchmark-metrics`: `docs/api-benchmark-metrics.json`
3. `/api/benchmark-runs/2026-05-30-controlled-t001-t003`: `docs/api-benchmark-run-detail.json`
4. `/api/benchmark-runs/2026-05-30-controlled-t001-t003/metrics`: `docs/api-benchmark-run-metrics.json`

### Key Metric Verification
- **Source**: `d1_benchmark_run`
- **Method Verification**: `proposed_agent` / `rule_based`
- **Macro Precision@5**: `0.1333`
- **Macro NDCG@5**: `0.3579`

## Evaluation Dashboard Verification
- **URL**: [https://paper-agent-project.pages.dev/dashboard/evaluation](https://paper-agent-project.pages.dev/dashboard/evaluation)
- **Data Source Label**: Displays "D1 Benchmark Run Active" when the run is loaded.
- **Run Selector**: `Independent Benchmark Run - controlled` (2026-05-30-controlled-t001-t003) is selectable.
- **Metric Rendering**: Table and top tiles correctly render metrics from the D1 source.

## Conclusion
The Production environment is fully operational with live D1-backed benchmark data. The claim boundary is strictly limited to the controlled T001-T003 task range. (gemini)
