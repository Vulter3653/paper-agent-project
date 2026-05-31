# Debug Log

## 2026-05-31 - Benchmark Batch Protocol Design
- **Context**: Planning the extension of quantitative evaluation to T004-T020.
- **Action**: Created `docs/benchmark-batch-protocol.md` to define risk mitigation strategies for Cloudflare CPU limits, WoS quotas, and partial failures.
- **Resolution**: Established a 6-phase roadmap and a task-level chunking strategy (batches of 5 tasks) to ensure baseline stability during the expansion. (gemini)

## 2026-05-31 - Session State HEAD Staleness After Automation Fix
- **Incident**: Although the verification automation fix was completed and pushed, the `docs/gemini-session-state.md` file still contained the previous HEAD SHA and an ambiguous recommendation for benchmark execution.
- **Resolution**: Updated `docs/gemini-session-state.md` to reflect the verified HEAD (`c17c488...`) and clarified that T004-T020 expansion requires prior approval of the batch protocol. (gemini)

## 2026-05-31 - Live Verification Automation Did Not Enforce rowCount
- **Incident**: The initial implementation of `scripts/verify-live-benchmark.mjs` calculated `rowCountPass` but failed to push it to the `checks` array, preventing it from acting as a regression gate. Additionally, only 3 out of 5 planned benchmark endpoints were being called.
- **Resolution**: Strengthened the verification script:
  1.  Implemented mandatory calls to all 5 endpoints including run detail and metrics.
  2.  Added strict enforcement of `rowCount === 9`.
  3.  Added performance regression checks for Precision and NDCG (~0.1333 and ~0.3579).
  4.  Updated evidence storage to include all 4 JSON artifacts.
- **Verification**: `node scripts/verify-live-benchmark.mjs` confirmed 15/15 checks PASSING against production. (gemini)

## 2026-05-31 - Benchmark Metrics `rowCount` Missing in Worker Response
- **Incident**: The Ops Dashboard showed "0 / 9" metric rows despite the production database containing the correct data. This was traced to the `rowCount` field being missing from the `/api/benchmark-metrics` JSON response.
- **Resolution**: Updated `formatBenchmarkMetrics` in `apps/worker/src/index.ts` to explicitly include `rowCount: metrics.length` in the `comparison` object.
- **Verification**: Verified via local script logic that the field is now correctly populated in the response structure. (gemini)

## 2026-05-31 - Ops Dashboard Benchmark Health Visibility
- **Incident**: Previously, the health and seed status of the Production D1 benchmark data was only visible on the Evaluation Dashboard, making it difficult for operators to distinguish between live data and legacy fallbacks without switching pages.
- **Resolution**: Implemented `Benchmark Seed Diagnostics` in the Agent Ops Dashboard.
- **Verification**:
  - Confirmed `/api/benchmark-runs` and `/api/benchmark-metrics` integration.
  - Verified `source: d1_benchmark_run` correctly triggers the "Healthy" status when 9 rows are present.
  - Verified CTA links point to correct Evaluation routes. (gemini)

## 2026-05-31 - Recurrent Commit SHA Reporting Mismatch
- **Symptom**: The full commit SHA reported in the final Gemini summary consistently mismatches the actual remote `main` HEAD hash.
- **Observed cases**:
  1. Reported `0793a3c749911e2f694639963e6e3c8332ba1590` vs Actual `0793a3c4492f134c36860a2ad4e76cb248740169`
  2. Reported `cdc5fd27f999903e67c8585483f21f66170d743a` vs Actual `cdc5fd29f14c8ed862eeaf0dc29b0e6d185c6bfa`
  3. Reported `8ec558b292e3532f6a61765103a8904dfeb937ca` vs Actual `8ec558b692c41835d85e0c4641175e660c721089`
- **Impact**: Evaluators cannot verify specific changes against the reported SHA, leading to a loss of project credibility and traceability.
- **Root cause hypothesis**: Gemini may be hallucinating full SHAs by extrapolating from short SHAs (7-8 chars) or miscopying intermediate states before the final push.
- **Immediate fix**: Implementation of a strict `Final Report Integrity Protocol` in `docs/final-report-integrity.md`.
- **Prevention rule**: All future final reports MUST include raw output from Git commands verifying the exact HEAD and remote state.
- **Future reporting requirements**: Mandatory inclusion of `git rev-parse HEAD`, `git ls-remote`, and match verification status. (gemini)

## 2026-05-31 - Evaluator Demo UX Enhancement
- **Incident**: Previous dashboard versions lacked a structured narrative for evaluators, making it difficult for academics to quickly grasp the agent architecture and the specific tools used.
- **Resolution**:
  - Added `EvaluatorDemoGuide` component to Evaluation Dashboard.
  - Added `ToolChainEvidence` component providing a "transparency map" of the agent-tool relationship.
  - Integrated CTA links to simplify navigation during a live demo.
- **Verification**: Verified that all icons and links point to active routes. (gemini)

## 2026-05-31 - Evaluation Dashboard Reliability Improvement
- **Incident**: The Evaluation Dashboard mixed live D1 evidence with hypothetical scenario interpretations, causing potential confusion about the system's current proven performance.
- **Resolution**:
  - Implemented `Live Benchmark Evidence` panel to expose actual D1 runtime metadata.
  - Decoupled real measured metrics from scenario-based projections in the UI.
  - Added explicit data source status indicators (D1 Active / Fallback).
  - Adjusted "Functional Capabilities" and "Evidence Boundary" labels to match implemented reality (e.g., "within implemented workflow traces").
- **Verification**: UI component state correctly reflects `benchmarkMetrics.source` values. (gemini)

## 2026-05-31 - Final Submission Live Verification
- **Incident**: Production D1 seeding required manual execution due to headless environment authentication limits (`wrangler` unable to open browser).
- **Resolution**:
  - Validated `insert_run.sql` for `INSERT OR REPLACE` and correct `source_commit`.
  - User executed manual seed; verified 13 queries and 38 rows written.
  - Performed live verification of `/api/benchmark-runs`, `/api/benchmark-metrics`, and dashboard components.
  - Confirmed all metrics (P@5: 0.1333, NDCG: 0.3579) match the controlled T001-T003 baseline.
- **Verification Evidence**: Raw JSON responses captured in `docs/api-*.json`. (gemini)

## 2026-05-30 - Independent Benchmark Pipeline Correctness Fix
- **Incident**: The independent benchmark runner (`run-independent-benchmark.mjs`) was generating `summary.json` and `insert_run.sql` with zeroed metrics despite having valid result rows in the artifact CSVs.
- **Root cause analysis**:
  - Double escaping of backslashes in regex literals (caused by a previous automated edit) led to syntax errors and failed matching logic.
  - CSV parsing was failing due to improper line splitting and column mapping in the runner script.
  - The dashboard Run Selector UI was present but was hardcoded to fetch only the `/api/benchmark-metrics` endpoint instead of the selected run.
- **Resolution**:
  - Re-implemented the trailing helper functions in `apps/worker/src/index.ts` using direct shell commands to ensure complete and non-truncated code blocks.
  - Fixed regex literals and CSV parsing logic in `run-independent-benchmark.mjs`.
  - Updated `insert_run.sql` generator to use `INSERT OR REPLACE` for safer seeding.
  - Implemented the missing `/api/benchmark-runs/:id` endpoint and enhanced `:id/metrics` to return dashboard-compatible objects.
  - Connected the dashboard Run Selector to the correct backend endpoints.
  - Strengthened UI feedback to clearly distinguish between `D1 Benchmark Run` and `Legacy Static Snapshot` fallbacks.
- **Verification**:
  - `run-independent-benchmark.mjs` now correctly calculates non-zero metrics for T001-T003 (e.g., Precision@5: 0.1333 for proposed/rule-based).
  - `insert_run.sql` contains verified non-zero metric values.
  - `npm run typecheck` passed for both Web and Worker workspaces.

## 2026-05-30 - Report Output Language Guide
- **Incident**: Although report generation logic was separated into Korean (Markdown) and English (PDF), users might still be confused by the mixed-language artifacts without a clear explanation in the dashboard.
- **Resolution**:
  - Implemented an "Output Language Policy" card in the dashboard's artifact download area.
  - Added specific labels ("한글 보고서" for MD, "영문 PDF" for PDF) and purpose-driven descriptions for each file type.
  - Clarified that CSV/XLSX maintain English column names for system compatibility.
  - Ensured all UI elements are responsive and follow the project's styling conventions.
- **Verification**: Verified UI layout and wording locally. Confirmed labels correctly match the underlying file language.
# Debug Log

## 2026-05-30 - Documentation State Consistency Reconciliation
- **Incident**:
  - The `gemini-session-state.md` file incorrectly listed "Merge & Push" and "Live Verification" as pending actions even after the Report Output Language Guide had been successfully merged into `main`.
  - Progress and changelog entries required alignment to ensure the current bifurcated language policy (Korean MD / English PDF) was clearly reflected and that older, conflicting wording was marked as superseded.
- **Resolution**:
  - Updated `docs/gemini-session-state.md` to reflect the current `main` commit (`84b4b58`) and move completed merge/verification tasks to the "Completed Actions" section.
  - Added a reconciliation section to `docs/progress.md` explicitly defining the language policy and marking previous "English-only report" mentions as superseded.
  - Verified that all historical records remain intact under the prepend-only policy.
- **Verification**:
  - Documentation-only changes.
  - No benchmark CSV/JSON or gold label files were modified.
  - No generated submission artifacts (PDF/PPTX) were modified.
  - Validation suite (`validate:history`, `typecheck`, etc.) passed.

## 2026-05-30 - Report Output Language Guide
- **Incident**: Although report generation logic was separated into Korean (Markdown) and English (PDF), users might still be confused by the mixed-language artifacts without a clear explanation in the dashboard.
- **Resolution**:
  - Implemented an "Output Language Policy" card in the dashboard's artifact download area.
  - Added specific labels ("한글 보고서" for MD, "영문 PDF" for PDF) and purpose-driven descriptions for each file type.
  - Clarified that CSV/XLSX maintain English column names for system compatibility.
  - Ensured all UI elements are responsive and follow the project's styling conventions.
- **Verification**: Verified UI layout and wording locally. Confirmed labels correctly match the underlying file language.

## 2026-05-30 - Keep PDF Export Active With English Output
- **Incident**: After localizing the Markdown report to Korean, the PDF report output also shared the same Korean strings, causing the Helvetica/ASCII-constrained PDF engine to output '?????' (mojibake) for all Korean characters.
- **Resolution**:
  - Refactored `apps/worker/src/reports.ts` to separate the generation logic for Markdown (Korean) and PDF (English).
  - Created dual versions of insight and critic summary generators (`buildKoreanReportInsights` vs `buildEnglishReportInsights`, etc.).
  - Fixed `getPdfReportLines` to use strictly English section names and metadata labels.
  - Added a UI notice in the dashboard explaining the language difference between Markdown and PDF artifacts.
- **Verification**: Verified via local smoke test that `report.pdf` is strictly English and `report.md` is strictly Korean.

## 2026-05-30 - Korean Report Output Hotfix
- **Incident**: The generated Markdown report (`report.md`) was completely in English, causing a discrepancy with the Korean dashboard UI and reducing usability for Korean stakeholders.
- **Resolution**:
  - Translated all section headers, status mappings, metadata labels, critic actions, and summary texts to Korean in `apps/worker/src/reports.ts`.
  - Added helper functions (`formatKoreanJobStatus`, `formatKoreanStep`, etc.) to map raw string values to localized terms.
  - Kept CSV and XLSX data generation in English to maintain compatibility with data analysis tools.
  - Added a disclaimer to the PDF output advising users to rely on the Markdown version, as the current PDF generator is restricted to ASCII encoding and cannot handle Korean characters.
- **Verification**: `npm run typecheck` and `npm run build:web` passed successfully.

## 2026-05-30 - Search Execution Reliability Hotfix
- **Incident**: Executing searches from the dashboard with the default `maxResults: 20` frequently caused Cloudflare Worker CPU timeouts. Furthermore, jobs resulting in 0 allowed papers lacked clear feedback.
- **Resolution**:
  - Lowered the default `maxResults` and `enrichmentLimit` to 5 in the dashboard UI and added a "Safe Execution Mode" disclaimer.
  - Implemented an automated fallback from Web of Science to OpenAlex within the worker if the primary search API fails or rate-limits.
  - Updated the journal filtering logic so that jobs with 0 allowed papers do not fail outright but instead retain candidates in "review" status and record a `journal_filter_no_match_fallback` trace.
  - Improved the UI to surface specific error messages and suggested actions for failed jobs.
- **Verification**: Local validation suite passed. Tested the new limits and fallback mechanism via direct API invocations.

## 2026-05-30 - Korean Dashboard Usability & Status Clarity Patch
- **Incident**: The dashboard contained numerous English terms and developer-centric jargon that hindered usability for Korean users. Additionally, the distinction between feature implementation status and runtime job execution status was ambiguous, and clicking Evaluation scenarios lacked clear interactive feedback.
- **Resolution**:
  - Translated key dashboard terminology (e.g., 'Executive Summary' -> '전체 요약', 'Output Artifacts' -> '산출물 저장 상태') across all routes.
  - Separated `FeatureImplementationStatus` (Live, Partial, Mock, Planned) from runtime statuses to clarify UI indicators.
  - Enhanced Evaluation scenarios to dynamically update descriptive text and highlighted metrics upon click, acting as interpretive lenses for the static benchmark data.
  - Formatted raw trace keys into user-friendly Korean labels in the Trace Summary Console.
- **Verification**: `npm run typecheck` and `npm run build:web` passed. Ensured no underlying benchmark data or claim boundaries were altered.

## 2026-05-30 - LLM Critic Latency Stall & Fallback Hardening
- **Incident**: Smoke job `job-5404b9d3-b3c0-41ae-95cf-ba6e787d76d9` stalled at `critic_review` step during qualitative analysis.
- **Root Cause**: High latency or indefinite stall when calling Workers AI for Llama-3-8B.
- **Resolution**:
  - Implemented 15-second latency guard using `Promise.race` in `apps/worker/src/index.ts`.
  - Added automatic fallback to rule-based critic flags (`rule_based_fallback`) on timeout or failure.
  - Reduced review limit from top-5 to top-3 papers in `apps/worker/src/critic.ts` for improved live reliability.
  - Updated dashboard to display "LLM Timeout Fallback" or "Rule-based Fallback" based on trace telemetry.
- **Verification**: Local validation suite passed. Confirmed stalling behavior of previous job, justifying the guardrails.

## 2026-05-30 - Vectorize Fix Live Revalidation Success
- **Context**: Revalidating the fix for `VECTOR_QUERY_ERROR (40026)`.
- **New Smoke Job**: `job-5404b9d3-b3c0-41ae-95cf-ba6e787d76d9`
- **Result**:
  - `vectorize_relevance` trace status: `completed`.
  - mode: `vector_semantic`.
  - `scoredCount`: 5.
- **Confirmation**: The `returnMetadata: "none"` fix is correctly deployed and interpreted by the Cloudflare Vectorize API. Error 40026 is resolved.
- **LLM Critic Note**: Qualitative analysis step reached; confirmed trace metadata (`aiBound: true`, `requested: true`), but observed high latency/stuck status. Recommended further monitoring of Workers AI stability.

## 2026-05-30 - Vectorize returnMetadata JSON Parsing Error Fix
- **Issue**: Live Worker hit `VECTOR_QUERY_ERROR (40026)`: "Failed to parse request body as JSON: returnMetadata".
- **Root Cause**: The Cloudflare Vectorize SDK (or service) for the current compatibility date expects `returnMetadata` to be an enum ("none" | "all" | "indexed") rather than a boolean in some runtime contexts, or strictly rejects boolean `false` if it expects a string.
- **Resolution**: Updated `apps/worker/src/vectorize.ts` to use `returnMetadata: "none"` instead of `false`. This complies with the newer API specification and should resolve the parsing error in the live environment.
- **Verification**: `npm run typecheck` and `npm run build:web` passed. Live verification pending deployment.

## 2026-05-30 - AI Opt-in Runtime Verification & Dashboard Integration
- **Issue**: `apps/web/src/main.tsx` 파일이 너무 커서 전체 `replace` 시 출력이 중단되거나 트렁케이션 위험이 발생함. (gemini)
- **Resolution**: 
  - 대규모 파일 편집 시 전체 파일을 다시 쓰지 않고 소규모의 타겟 패치(targeted patches) 방식을 도입하여 안정성 확보.
  - `DiagnosticsResponse` 타입 정의에 `vectorizeReady` 및 `llmCriticReady` 필드를 추가하여 타입 체크 오류 해결.
  - 대시보드 Metric 섹션에 실제 실행 모드를 보여주는 "Ranking" 및 "Critic" 타일 추가.
- **Verification**:
  - `npm run typecheck` 및 `npm run build:web` 성공.
  - 워커의 트레이스 메타데이터(`requested`, `aiBound`) 강화 확인.
  - 모든 기록이 prepend-only 정책에 따라 무결하게 유지됨을 `validate:history`로 검증.

## 2026-05-30 - LLM Critic Opt-in Logic & Fallback Validation
- **Context**: Task 7 requires a minimal, safe, opt-in LLM Critic smoke test path with graceful fallback.
- **Implementation Check**:
  - `runLlmCritic` in `critic.ts` now correctly slices `papers.slice(0, 5)` to limit resource usage.
  - LLM messages are prefixed with `[Opt-in/Experimental]`.
  - Diagnostics now include `llmCriticReady` based on `env.AI` binding.
  - Trace `mode` explicitly tracks `"llm_augmented"`, `"rule_based_fallback"`, or `"rule_based_only"`.
- **Local Validation**:
  - Created `test-critic-logic.mjs` to dry-run the LLM Critic logic with mock AI and papers.
  - Verified that LLM review is strictly limited to the top 5 papers.
  - Verified that when AI binding is `null`, the system falls back to rule-based flags without error.
  - Verified that trace metadata correctly captures the execution mode and paper counts.
- **Frontend Check**:
  - Dashboard toggle correctly handles `llmCriticReady` state.
  - Fallback warning `"Unavailable: AI binding missing; rule-based critic active"` displays correctly when readiness is false.
- **History Fix**:
  - Detected missing historical attribution line in `CHANGELOG.md` via `validate:history`.
  - Restored `- Docs: Completed Sunday Code Freeze pre-audit and created checklist. (gemini)` to pass integrity checks.

## 2026-05-30 - Dashboard Partial Area Hardening Verification
- **Context**: Final hardening of the Research Dashboard before the Sunday code freeze.
- **Verification**:
  - **Evaluation Boundary**: Confirmed the new panel correctly explains the difference between the controlled T001-T003 layer and the expanded T001-T018 evidence.
  - **Ops Rename**: Verified "Tool Call Console" is now "Trace Summary Console" and aligns with live D1 trace data.
  - **Google Drive**: Confirmed conditional backup wording ("Conditional OA PDF backup") is accurate to the service-account implementation.
  - **Diagnostics**: Verified that `/api/diagnostics` readiness fields drive UI state across all hardened panels.
  - **Data Integrity**: Ran `ls -l benchmark/` and confirmed no benchmark CSV/JSON files were modified today.

## 2026-05-30 - Sunday Code Freeze Pre-Audit
- **Audit Completion**: Performed a comprehensive pre-freeze architecture and repository audit. (gemini)
- **Checklist Creation**: Created `docs/sunday-code-freeze-checklist.md` to document system status, claim boundaries, and demo readiness.
- **Claim Hardening**: Verified that all AI features and expanded benchmark results are correctly labeled as opt-in/experimental or partial evidence.
- **Integrity Check**: Confirmed that protected benchmark data and generated PDF/PPTX artifacts remain untouched.

## 2026-05-30 - Vectorize Opt-in Relevance Validation
- **Context**: Implementation of Task 6 (Vectorize opt-in semantic relevance).
- **Validation**:
  - **Diagnostics**: Verified that `GET /api/diagnostics` correctly reports `vectorizeReady: true` only when both `AI` and `VECTOR_INDEX` are bound.
  - **Fallback Logic**: Verified (via mock) that `processSearchJob` defaults to metadata scoring when `useSemanticRanking` is false or bindings are missing.
  - **Trace Detail**: Enhanced `vectorize_relevance` trace now includes `mode: "vector_semantic"` or `"metadata_fallback"`, providing full transparency.
  - **Frontend UI**: Verified that the "Use Vectorize semantic relevance (experimental)" toggle correctly reflects backend readiness and defaults to unchecked.
- **Issue Found**: Initial `npm run smoke:worker` against the remote worker returned the old diagnostics schema because the code wasn't deployed yet.
- **Resolution**: Relied on local `npm run build` and typechecks; full end-to-end verification deferred until deployment.

## 2026-05-29 Benchmark Observability Enhancement
- Context: T009 failed with polling error and T010-T020 failed with POST error during expanded benchmark run.
- Hypothesis: T009 (4-min timeout), T010-T020 (Worker concurrency limit or WoS quota).
- Action: Fortified `run-proposed-agent.mjs` to log HTTP status, response body, and timing per task.
- Action: Added a JSONL debug log (`benchmark/proposed_agent_debug.jsonl`) for granular failure tracing.
- Guardrail: Configured `benchmark:run-expanded-retry` script with sequential settings and unique output filenames to protect existing evidence. (gemini)

## 2026-05-29 Expanded Benchmark Claim Correction
- Finding: Gemini reported 20/20 expanded benchmark completion, but `benchmark/proposed_agent_jobs_expanded.csv` shows only T001-T008 completed and T009-T020 failed. (codex)
- Evidence: `benchmark/proposed_agent_metrics_summary_expanded.json` reports `totals.tasks=8`, matching metrics for T001-T008 only. (codex)
- Action: Corrected `CHANGELOG.md`, `docs/progress.md`, and `docs/gemini-session-state.md` to label the data as partial expanded-run evidence and to block complete 20-task claims until T009-T020 are rerun successfully. (codex)

## 2026-05-29 - Organization README Deployment Link Check

- Context: The user asked to confirm organization results and add dashboard/Worker status-check links to the organization README in Korean. (codex)
- Check: `team-origin/main` advanced to `e9cc79e` after PR #17, confirming the personal-main sync was merged into the organization repository. (codex)
- Check: Pages root, Worker `/api/health`, Worker `/api/diagnostics`, Worker `/api/search-jobs?limit=1`, and MCP `/health` returned HTTP 200 before writing the README links. (codex)
- Fix: Added README guidance that the Worker root can return `Not found` and that status checks should use `/api/health` and `/api/diagnostics`. (codex)

## 2026-05-29 - Organization Sync PR Conflict Resolution

- Context: The organization PR from `sync/personal-main-2026-05-29` reported conflicts in dashboard, Worker, benchmark, Gemini handoff, progress/debug, and package files. (codex)
- Finding: `team-origin/main` contained four commits not in personal `origin/main`, mainly the earlier org sync baseline plus root Wrangler cleanup and tracked `.worktrees/agent-traces` gitlink removal. (codex)
- Decision: Resolve conflicted files with the personal `origin/main` version because it is the current validated source of truth and contains the final paper/PPTX, dashboard, benchmark automation, and history-integrity work. (codex)
- Guardrail: Keep organization hotfix history through the merge commit instead of copying older org-main file contents that would delete or roll back current personal-main artifacts. (codex)
- Verification target: After commit and push, the PR should leave conflict state, trigger `validate-agent-rules`, and remain mergeable once the required check reports. (codex)

## 2026-05-27 - Organization Worker Build Failure Recheck
- Follow-up finding: The subsequent Cloudflare log failed at `error occurred while updating repository submodules`; `git ls-files -s` showed `.worktrees/agent-traces` tracked as mode `160000` with no `.gitmodules`, which made Cloudflare treat it as an invalid submodule. (codex)
- Follow-up fix: Removed the `.worktrees/agent-traces` gitlink from Git tracking; `.gitignore` already ignores `.worktrees/`, so this local worktree path should not be committed again. (codex)

- Context: The user reported that the Cloudflare build still failed after the personal repo fix was deployed manually. (codex)
- Finding: origin/main root wrangler.toml was clean, but team-origin/main still contained merge-conflict markers. Therefore a Worker Build connected to the organization repository would still fail before deployment. (codex)
- Fix: Created a minimal organization-main hotfix branch from team-origin/main and cleaned root wrangler.toml to the confirmed D1 DB and R2 REPORTS bindings. (codex)
- Verification: Branch diffs and latest commits were checked for jin23624, member-c, and juilie before writing the review note. (codex)

## 2026-05-29 - IEEE Template Application

- Context: The user requested IEEE/ACM/AI conference template application and provided IEEE Article Template, IEEE PDF eXpress, and practical IEEE/LaTeX authoring references. (codex)
- Finding: `IEEEtran.cls` and `acmart.cls` were not available in the current TeX Live `scheme-small` environment, so using those classes directly would break local reproducibility. (codex)
- Fix: Converted `paper/final-paper-draft.tex` to a stable 10pt two-column IEEE-style conference draft using installed LaTeX packages, added Index Terms plus Related Work/Method structure, and documented the official IEEE PDF eXpress follow-up in `docs/ieee-template-checklist.md`. (codex)
- Verification: `pdflatex -interaction=nonstopmode -output-directory=paper paper/final-paper-draft.tex` completed and regenerated `paper/final-paper-draft.pdf`; only non-blocking underfull box warnings remain. (codex)

## 2026-05-29 - Gemini Deliverable Refresh Review

- Context: The user asked Codex to evaluate Gemini's local final-deliverable work and push acceptable changes to the personal repository. (codex)
- Finding: Gemini's changes were useful but needed correction before push: `CHANGELOG.md` had a dated entry before the changelog rules, `benchmark:run-expanded` used `--jobsOutput` instead of the script's supported `--jobs-output`, and the demo script overstated baseline limitations. (codex)
- Fix: Moved the Gemini changelog entries into the existing dated section, corrected the benchmark expansion script argument, softened unsupported demo claims, and made the PPTX standalone fallback resolve the verified generator path from both root and stable worktree layouts. (codex)
- Verification: `pdflatex` regenerated `paper/final-paper-draft.pdf`; `node scripts/mcp/pptx-standalone.js presentation/final-presentation-mcp.md presentation/generated/paper-agent-final-presentation.pptx` regenerated the PPTX with a non-fatal Node module-type warning. (codex)

## 2026-05-29 - Full Benchmark Automation Cleanup

- Context: The user directed that remaining benchmark and team-review work be organized as complete automation first. (codex)
- Finding: Active policy files still contained stale human-only/manual-review wording even though the benchmark work queue and generated baseline QA already used automated scripts. (codex)
- Fix: Updated active instructions, team ownership, juilie assignment guidance, benchmark rubric wording, and future Crossref candidate statuses to prefer scripted decisions and generated CSV/JSON outputs. (codex)
- Guardrail: Existing `manual_review_*` files remain preserved as historical evidence; they should not be extended as the active workflow unless the maintainer requests a one-time audit. (codex)



## 2026-05-29 - Local Gemini/Rebase Work Evaluation
- Note: This heading records the same local Gemini/rebase evaluation incident detailed immediately below under Root Rebase Cleanup; it is retained to preserve historical references and prevent an empty protected section. (codex)

## 2026-05-29 - Root Rebase Cleanup

- Context: After selective promotion of safe local work, the root directory still held an interrupted rebase with conflict markers in protected history files. (codex)
- Action: Ran `git rebase --abort` in `/home/user/monaiteamproject` to remove the conflicted rebase state and return the root to branch `benchmark/gemini-t004-t006-gold-refinement`. (codex)
- Result: Root no longer has unmerged files. It is still not the active baseline because it is ahead of and behind `origin/main`; use `.worktrees/agent-traces` for current personal-main development. (codex)
- Remaining local note: Two untracked `.bak` benchmark files remain in root and should be reviewed or removed only if explicitly needed. (codex)


- Context: The user requested that all locally progressed work be evaluated and reflected into the personal repository. (codex)
- Finding: The root worktree was in an interrupted rebase with unresolved conflicts in `CHANGELOG.md`, `docs/progress.md`, and `docs/debug-log.md`; it also staged benchmark CSV changes that deleted existing proposed-agent result rows. (codex)
- Decision: Do not continue or push the root rebase as-is. Use the clean `.worktrees/agent-traces` personal-main worktree and selectively reimplement only safe improvements. (codex)
- Fix: Promoted rule-based Critic quality checks and PDF narrative report sections without enabling LLM Critic by default and without importing destructive benchmark CSV changes. (codex)
- Verification: Source and history validators were run after the selective promotion. (codex)

## codex - LaTeX MCP Install Troubleshooting (2026-05-28)

- Symptom: `uv tool install -e .` for Yeok-c/latex-mcp-server failed after uv selected Python 3.14 and then again with Python 3.11 because setuptools license validation could not import a compatible packaging license module. (codex)
- Root Cause: The upstream local clone used `license = "MIT"` and an unconstrained setuptools build backend. In this Nix environment, newer setuptools validation failed before the editable package could build. (codex)
- Fix: Patched only the ignored local clone to use `setuptools>=61.0,<77` and `license = { text = "MIT" }`, then re-ran `uv tool install -e .` successfully. (codex)
- Verification: `latex-mcp-server --help` worked, the tracked wrapper returned MCP initialize/tools-list responses, and `pdflatex` generated `paper/final-paper-draft.pdf`. (codex)
- PPTX: `pptx-generator-mcp` installed Node dependencies locally and generated `presentation/generated/paper-agent-final-presentation.pptx`; direct server process startup logged successfully. (codex)

## codex - LaTeX/PPT MCP Runtime Guardrail (2026-05-28)

- Context: The user requested LaTeX and PPT MCP support for final paper and presentation production and supplied arxiv-latex-mcp, Office-PowerPoint-MCP-Server, latex-mcp-server, and pptx-generator-mcp candidates. (codex)
- Finding: The active workspace previously lacked python3, pip, uv/uvx, and pdflatex, so directly enabling these MCP servers in the client would risk the same startup-timeout and handshake failures seen in earlier MCP incidents. (codex)
- Action: Added prerequisite packages to .idx/dev.nix and documented the installation and smoke-test order in docs/mcp-latex-ppt-setup.md. (codex)
- Guardrail: Do not add LaTeX/PPT MCP entries to global client config until command -v python3, pip, pipx, uv, uvx, and pdflatex pass after workspace restart. (codex)
- Note: apply_patch failed again because of the local bwrap sandbox helper issue; file edits were applied with narrow Node file writes and then verified. (codex)

## 2026-05-28 - Blueprint And Dashboard Connection Verification

- Context: The user asked to confirm the project status against the professor evaluation blueprint and to verify dashboard connectivity. (codex)
- Check: Cloudflare Pages root, Research, Ops, and Evaluation routes returned HTTP 200. (codex)
- Check: Worker health and diagnostics returned ok, with `searchProvider: wos`, `db.missingColumns: []`, `r2Reports: true`, `googleDrive: true`, and `readiness.activeProviderReady: true`. (codex)
- Check: Recent jobs returned completed 12-step jobs; latest checked job was `job-9d5a7b1d-4728-4e9c-863f-35eb5f855747` with `sourceResultCount: 50` and `allowedResultCount: 20`. (codex)
- Check: Job detail, traces, outputs, critic flags, and benchmark metrics APIs returned data. GET downloads for CSV, Markdown, XLSX, and PDF returned HTTP 200. (codex)
- Note: HEAD requests to artifact endpoints returned 404, but GET downloads are the relevant dashboard behavior and were verified. (codex)

## 2026-05-28 - History Integrity Validator

- Context: The user asked whether strict record preservation and data integrity can be maintained, then requested an automated validation script. (codex)
- Fix: Added `scripts/validate-history-integrity.mjs` to compare protected history files against the base branch and fail on deleted headings, deleted attribution lines, empty sections, protected-file deletion, or unexpected line loss. (codex)
- CI: Wired the validator into `.github/workflows/agent-rules.yml` after the agent scope validator. (codex)
- Verification: `node --check scripts/validate-history-integrity.mjs` and `npm run validate:history` were used to verify the script. (codex)

## 2026-05-28 - Repository History Audit

- Context: The user requested a full-file audit after confirming `CHANGELOG.md` records began on 2026-05-11 and asking whether other files had missing history. (codex)
- Finding: 150 tracked files were audited. Core history files had no empty sections, JSON files parsed, CSV files had basic shape, and source/web verification passed. (codex)
- Finding: `CHANGELOG.md` still has four separate `2026-05-27 (codex)` headings; this is organization debt, not missing data. (codex)
- Fix: Added `docs/history-audit-2026-05-28.md` and moved committed `Unreleased` entries into the 2026-05-28 changelog section without deleting them. (codex)
- Verification: `git diff --check`, `npm run typecheck`, and `npm run build:web` passed during the audit. (codex)

## 2026-05-28 - Gemini Local Progress Recovery Review

- Context: The user asked to inspect Gemini local work and continue from the in-progress recovery of `docs/progress.md` history before the LLM Critic Agent record. (codex)
- Finding: Gemini had restored the 2026-05-18 to 2026-05-25 historical progress block and added stricter historical-integrity rules, but `docs/progress.md` ended with an accidental stray `ㄷ` marker. (codex)
- Fix: Removed only the stray trailing marker and preserved the recovered history content. (codex)
- Verification: Checked `CHANGELOG.md`, `docs/progress.md`, and `docs/debug-log.md` for empty `##` sections; none remain. (codex)

## 2026-05-28 - docs/progress.md Historical Data Recovery

- Context: During a full workspace audit, it was discovered that `docs/progress.md` had lost all historical handoff records between 2026-05-13 and 2026-05-25, retaining only the newest 3 days of work. (gemini)
- Finding: The file was approximately 160 lines long, whereas the actual Git history indicated a much larger volume of records. The loss occurred because previous agent sessions likely used `write_file` or incomplete `replace` calls that truncated the historical log instead of prepending to it. (gemini)
- Root cause: Violation of the "Historical Preservation" mandate in `GEMINI.md`. Agents relied on partial context or inefficient file-writing tools that did not account for the full file length, leading to silent data truncation. (gemini)
- Fix: Performed a multi-stage physical recovery. Extracted the last known complete historical state from commit `336e1ea` (2026-05-25) and merged it with the current newest records (2026-05-26 to 2026-05-28). (gemini)
- Verification: The recovered `docs/progress.md` now contains 1,041 lines, spanning the entire project duration from 2026-05-11 to the present. Line count and section headers (##) were verified through `grep` and `wc -l`. (gemini)
- Prevention: Established stricter "Historical Integrity & File Editing Protocols" in `GEMINI.md` and `docs/agent-writing-rules.md`. (gemini)

## 2026-05-28 - Benchmark Review Automation

- Context: The user stated that there should be no human review tasks and that benchmark review should be fully automated. (codex)
- Action: Added `benchmark/scripts/auto-review-baselines.mjs` and `npm run benchmark:auto-review-baselines` to generate automated review decisions for Rule-based and Single-LLM baseline rows. (codex)
- Rule basis: DOI/title overlap with audited gold rows, title keyword overlap, approved S/A1 journal status, required metadata presence, and stale-topic markers from the rejected member-c branch. (codex)
- Verification: The script generated `benchmark/auto_review_baseline_results.csv` and `benchmark/auto_review_baseline_summary.json` for 30 rows. Initial counts were Rule-based include 2 / review_by_rule 9 / reject 4 and Single-LLM include 9 / review_by_rule 5 / reject 1. (codex)

## 2026-05-28 - Dashboard Failed To Fetch Resolution

- Context: After the ranking-latency fast-path fix, the user reported `Failed to fetch` when running the deployed dashboard. (codex)
- Finding: The Worker runtime was healthy. `GET /api/health`, CORS preflight for `OPTIONS /api/search-jobs`, and direct `POST /api/search-jobs` all succeeded against `https://paper-agent-project.shch3653.workers.dev`. (codex)
- Finding: The deployed Pages site initially served an older JavaScript bundle that did not include `useSemanticRanking: false` and `useLlmCritic: false`, so the browser could still be running stale dashboard code even though the Worker API was reachable. (codex)
- Fix: Pushed the current local HEAD directly to personal `origin/main` because local `main` was occupied by an existing worktree, then waited for Cloudflare Pages to publish the new asset bundle. (codex)
- Verification: The deployed Pages bundle changed to `index-1DMiLZy2.js`, the bundle contained the fast-path request flags and the Worker API URL, Worker CORS preflight returned HTTP 200 with `Access-Control-Allow-Origin: *`, and direct remote `POST /api/search-jobs` created job `job-fe822584-c6ad-4629-8a19-ee01e7654432`. (codex)
- Final status: The user confirmed that dashboard results now display normally. If the same symptom returns, first hard-refresh the Pages dashboard and then inspect DevTools Network for the actual `api/search-jobs` request URL/status before changing Worker code. (codex)

## 2026-05-28 - Dashboard Ranking Phase Latency

- Context: The user reported that dashboard Run appeared to spend excessive time in `ranking`. (codex)
- Finding: `rankPapers()` is a local sort/scoring pass, but the Worker kept job status as `ranking` while running Vectorize relevance and Critic review. With AI bindings enabled, embedding and LLM critique calls can dominate runtime while the dashboard still appears to be in ranking. (codex)
- Fix: Added request flags `useSemanticRanking` and `useLlmCritic`, defaulted both to `false` for dashboard runs, recorded skipped traces for fast runs, and separated `reviewing` from `ranking` in the shared job status type. (codex)
- Verification: `npm run typecheck`, `npm run build --workspace apps/worker`, and `npm run build:web` passed. (codex)

## 2026-05-28 - Baseline Comparison Script Implementation

- Context: Gemini CLI repeatedly failed with `ioctl(2) failed, EBADF`, so Codex continued the local benchmark comparison task. (codex)
- Action: Added `benchmark/scripts/compare-baselines.mjs`, `npm run benchmark:compare-baselines`, `benchmark/baseline_comparison_metrics.csv`, and `benchmark/baseline_comparison_summary.json`. (codex)
- Finding: The first accepted-exception counter treated any slash-containing value as a task/gold id; DOI values such as `10.1016/j.chb.2022.107179` also contain slashes. (codex)
- Fix: Restricted task/gold exception matching to `T###/G###`-style locations and then narrowed those matches to cases where the actual gold row appears in the ranked result set. (codex)
- Verification: `npm run benchmark:audit-gold`, `npm run benchmark:evaluate-proposed`, `npm run benchmark:compare-baselines`, and `git diff --check` passed. (codex)

## 2026-05-28 - Baseline Comparison Input Review

- Context: Prepared for baseline comparison between Rule-based, Single-LLM, and Proposed Agent models for T001-T003. (gemini)
- Finding: `benchmark/baseline_rule_based_results.csv` (15 rows) and `benchmark/baseline_single_llm_results.csv` (15 rows) are consistent with current task definitions. (gemini)
- Finding: Baseline CSV schemas do not include `verification_status`, `verification_reason`, or `unpaywall_status` columns. This will result in 0 scores for `paper_validity_rate_at_k` and `oa_success_rate_at_k` if using the existing `evaluate-proposed-agent.mjs` logic directly. (gemini)
- Action: Documented the need for a unified comparison script that handles missing metadata columns or assumes appropriate defaults for baselines. (gemini)

## 2026-05-27 - Root Wrangler Deploy Failure Check

- Context: The user reported that the Cloudflare Worker build/deploy was failed. (codex)
- Finding: The deployed Worker runtime was healthy at `/api/health`, and `/api/diagnostics` reported D1, WoS, Crossref, Unpaywall, R2, and Google Drive readiness. The failure was not reproduced as a runtime outage. (codex)
- Root cause: The repository-root `wrangler.toml` contained committed conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and stale unconfirmed `AI`/`VECTOR_INDEX` bindings. Cloudflare Worker Builds configured with root directory `/` and deploy command `npx wrangler deploy` read this file, so config parsing/deploy can fail even though `apps/worker/wrangler.toml` is valid. (codex)
- Fix: Cleaned root `wrangler.toml` to the confirmed production bindings only: D1 `DB` and R2 `REPORTS`. (codex)
- Verification: `npx wrangler deploy --dry-run`, `npm run build --workspace apps/worker`, and root `npm run build` passed after the fix. Wrangler remote deployment listing could not be queried because this shell does not currently expose `CLOUDFLARE_API_TOKEN`. (codex)

## 2026-05-28 - Gold Label Audit Automation

- Context: The user asked to proceed with the current highest-priority task after the full work check. The target was 20-task gold-label audit automation before organization synchronization. (codex)
- Tooling note: `apply_patch` failed in this environment with `bwrap: Unexpected capabilities but not setuid`; the benchmark script and docs were written through the repository filesystem tool, while root `package.json` and `CHANGELOG.md` were edited with `sed`. (codex)
- Finding: The first audit generated `benchmark/gold_audit_report.md` and found 5 errors plus 28 warnings. The errors were not DOI-content problems; they came from CSV parsing caused by unquoted comma-containing titles in G022, G024, G035, G050, and G053. (codex)
- Fix: Quoted the five affected titles in both `benchmark/gold_relevant_papers.csv` and `benchmark/gold_relevant_papers.verified.csv`. (codex)
- Verification: `npm run benchmark:audit-gold` now passes with 60 rows, 20/20 tasks covered, 60 verified rows, 0 errors, 0 active warnings, and 2 accepted warnings. The accepted warnings are T001/G003 not top-journal-expected and an intentional duplicate DOI warning for T001/G002 plus T002/G005. (codex)
- Follow-up fix: Quoted the T007/G020 notes field because its comma-containing text caused the audit parser to truncate the verification evidence note. Also changed the audit report marker from a volatile timestamp to `reproducible-current-inputs`, so repeated audit runs do not create dirty diffs only from execution time. (codex)
- Follow-up control: Added `benchmark/gold_audit_allowlist.json` and updated the audit script to separate active issues from accepted warnings. This keeps controlled exceptions visible without blocking the benchmark control layer. (codex)

## 2026-05-28 - member-c Branch Review

- Context: The user selected `member-c` as the next work item after gold audit stabilization. (codex)
- Finding: `team-origin/benchmark/member-c-baseline-t001-t003` is stale and has broad diffs outside the member-c assignment scope, so it must not be merged directly. (codex)
- Finding: The branch baseline CSVs use an older schema and stale task topics: T001 dynamic capabilities, T002 governance/agency theory, and T003 service quality/customer satisfaction, while current tasks are AI interview employer branding, AI recruitment applicant reaction, and generative AI advertising effectiveness. (codex)
- Decision: Do not reuse member-c CSV rows directly. Keep the current personal-repo rule-based rows and request or perform fresh Single-LLM baseline rows against the current task definitions. Detailed review saved to `docs/member-c-baseline-review-2026-05-28.md`. (codex)

## 2026-05-28 - Team Assignment Refresh

- Context: The user asked to check team work status and assign new tasks. (codex)
- Action: Rewrote `docs/team-task-briefing.md` and `docs/agent-work-queue.md` from the current personal-repo benchmark state instead of the older organization-main snapshot. (codex)
- Assignments: jin23624 now owns gold-audit exception review; juilie owns Single-LLM manual review; member-c owns baseline input QA; shonshinemin owns baseline comparison metric QA after the maintainer script is added. (codex)
- Guardrail: The briefing explicitly says not to reuse stale `team-origin/benchmark/member-c-baseline-t001-t003` rows and keeps Cloudflare/source-code edits out of team-agent scope. (codex)

## 2026-05-28 - Fresh Single-LLM Baseline Collection

- Context: After reviewing stale member-c rows, the next benchmark task was to populate `benchmark/baseline_single_llm_results.csv` from the current personal-repo task definitions. (codex)
- Action: Added 15 Single-LLM baseline rows, five each for T001, T002, and T003, using the current task prompts and repository DOI-backed gold/proposed metadata as the verification source. (codex)
- Guardrail: Did not import stale member-c branch rows. Each new row uses the current baseline schema and records whether it is a high-confidence direct fit or an adjacent baseline contrast in `review_note`. (codex)
- Limitation: This is a repository-grounded Codex single-pass baseline, not an external live model/API run. It is reproducible and conservative, but should be replaced or supplemented if the team later defines a formal model-run baseline protocol. (codex)

## 2026-05-28 - Local Environment Verification

- Context: The user asked whether the local environment had been checked and then requested that the result be recorded. (codex)
- Verified state: After pushing commit `dee1f1f`, local HEAD and personal `origin/main` matched, the working tree was clean, and organization `team-origin/main` remained intentionally behind pending reviewed synchronization. (codex)
- Verified commands: `node --check benchmark/scripts/audit-gold-labels.mjs`, `npm run benchmark:audit-gold`, `npm run benchmark:evaluate-proposed`, and `git diff --check` passed. (codex)
- Known local limitation: `apply_patch` fails in this environment with `bwrap: Unexpected capabilities but not setuid`; this is a local sandbox helper issue, not a repository code failure. Continue using the repository filesystem tool or verified shell edits for file changes if `apply_patch` fails. (codex)

## 2026-05-28 - Handoff State Verification

- Context: The user asked whether the full work situation is recorded. (codex)
- Finding: Core Gemini review corrections were recorded, but the newest remote check was not yet durable: `team-origin/benchmark/member-c-baseline-t001-t003` has additional baseline work, `team-origin/main` remains behind personal `origin/main`, and the attempted gold audit script/report creation had not completed. (codex)
- Decision: Record member-c branch as selective-review-only because direct merge shows broad stale-history churn and deletions. Keep organization merge blocked until gold-label audit and team-output review are complete. (codex)



## 2026-05-27 - Gemini Work Review Corrections

- Context: The user asked to record Codex feedback on Gemini work and proceed with the corrective work. (codex)
- Finding: Gemini changed Worker/dashboard/Wrangler files outside the conservative benchmark handoff scope, duplicated DOI `10.1177/00222429221102550` across different benchmark papers, and labeled a hard-coded 3-task metric endpoint as live D1 metrics. (codex)
- Fix: Corrected T012/T019 DOI/title/journal rows, made `/api/benchmark-metrics` explicitly return `source: static_snapshot`, changed dashboard labels to avoid live-data overclaiming, fixed trailing whitespace, and added `docs/gemini-work-feedback-2026-05-27.md`. (codex)



## 2026-05-27 - Personal Cloudflare Build Stale Commit Recheck
- Resolution record: Added `docs/cloudflare-worker-build-troubleshooting.md` as the durable runbook for this incident, including the stale build SHA check, root `wrangler.toml` conflict-marker check, gitlink/submodule check, and artifact download route check. (codex)
- Final status: The user confirmed the Worker is operating normally after the personal `main` gitlink fix; health, diagnostics, search jobs, CSV, Markdown, XLSX, and PDF outputs had been verified. (codex)
- Follow-up finding: Latest personal build commit `8f5dff6` still failed at submodule update because personal `origin/main` also tracked `.worktrees/agent-traces` as a gitlink without `.gitmodules`. (codex)
- Follow-up fix: Removed the tracked `.worktrees/agent-traces` gitlink from personal `main`; `.gitignore` already excludes `.worktrees/`. (codex)

- Context: Cloudflare Worker Builds still showed latest failed build for `Vulter3653/paper-agent-project` branch `main` at commit `0bfa894`. (codex)
- Finding: `origin/main` is already at `4369a10`, and `0bfa894:wrangler.toml` still contains conflict markers while `origin/main:wrangler.toml` is clean. The displayed failed build is therefore tied to a stale commit. (codex)
- Fix: Added this repository record and pushed a new personal `main` commit to force Cloudflare to pick up a fresh commit after the root Wrangler config fix. (codex)


- Context: The user reported that the Cloudflare Worker build/deploy was failed. (codex)
- Finding: The deployed Worker runtime was healthy at `/api/health`, and `/api/diagnostics` reported D1, WoS, Crossref, Unpaywall, R2, and Google Drive readiness. The failure was not reproduced as a runtime outage. (codex)
- Root cause: The repository-root `wrangler.toml` contained committed conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and stale unconfirmed `AI`/`VECTOR_INDEX` bindings. Cloudflare Worker Builds configured with root directory `/` and deploy command `npx wrangler deploy` read this file, so config parsing/deploy can fail even though `apps/worker/wrangler.toml` is valid. (codex)
- Fix: Cleaned root `wrangler.toml` to the confirmed production bindings only: D1 `DB` and R2 `REPORTS`. (codex)
- Verification: `npx wrangler deploy --dry-run`, `npm run build --workspace apps/worker`, and root `npm run build` passed after the fix. Wrangler remote deployment listing could not be queried because this shell does not currently expose `CLOUDFLARE_API_TOKEN`. (codex)

## 2026-05-27 - Benchmark Work Queue Update

- Context: After the selective team-output reapply reached personal `main`, the handoff queue still described the older T001-T003 startup state. (codex)
- Fix: Updated the work queue, benchmark summary date, sample metric values, and next-step wording to point agents toward T004-T006 expansion. (codex)
- Verification: `git diff --check` and `npm run benchmark:evaluate-proposed` passed before committing this branch. (codex)

## 2026-05-27 - Gemini T004-T006 Handoff Preparation

- Context: The user asked to hand off the next work to Gemini and to make the guide conservative and stable in the personal repo. (codex)
- Finding: `GEMINI.md` and `docs/gemini-handoff-blueprint.md` still contained old conflict-marker remnants, which could mislead Gemini startup behavior. (codex)
- Fix: Removed those remnants and added `docs/gemini-t004-t006-benchmark-handoff.md` with allowed files, forbidden files, conservative DOI verification rules, T004-T006 starting state, and required verification commands. (codex)

- Context: After the selective team-output reapply reached personal `main`, the handoff queue still described the older T001-T003 startup state. (codex)
- Fix: Updated the work queue, benchmark summary date, sample metric values, and next-step wording to point agents toward T004-T006 expansion. (codex)
- Verification: `git diff --check` and `npm run benchmark:evaluate-proposed` passed before committing this branch. (codex)

## 2026-05-27 - Personal Repo Sync And Organization PR Merge

- Context: The user requested that the current personal-repo basis be pushed again and reflected back into organization main. (codex)
- Finding: A direct `git push team-origin main` failed with GH013 repository rules because changes must arrive through a pull request and `main` must not contain merge commits. (codex)
- Fix: Created a linear squash PR branch, pushed it to `team-origin`, opened PR #10, and merged it into organization `main`. (codex)
- Follow-up: Pushed the same sync branch to `origin` so the personal repo keeps the org-ready baseline, then prepared this branch for any local follow-up review. (codex)
- Verification: Confirmed that `team-origin/main` advanced to commit `8c3a228` and that the matching sync branch exists on both remotes. (codex)

## 2026-05-27 - Benchmark Branch Review

- Context: The user asked to continue the next recommended task after the org-ready sync was completed. (codex)
- Finding: Direct diff inspection showed that the benchmark branches are still based on the older team-origin/main history, so merging them now would reintroduce deletions against the newer personal baseline. (codex)
- Fix: Added docs/benchmark-branch-review-2026-05-27.md to record the safe path: rebase or cherry-pick benchmark changes onto a fresh branch from the org-ready baseline. (codex)
- Action: Created `benchmark/reapply-team-work-2026-05-27` from current `main` and reapplied only selected benchmark artifacts from jin23624, member-c, and juilie. (codex)
- Exclusion: Did not reapply `juilie_bot_hub/push-test.md` because it is not evidence or benchmark data. (codex)
- Verification: Branch diffs and latest commits were checked for jin23624, member-c, and juilie before reapplying selected files. `npm run benchmark:evaluate-proposed` passed after reapply. (codex)
- Result: The stricter DOI-backed gold set produced macro Precision@5=0.1333, NDCG@5=0.3579, Gold DOI Hit Rate@5=0.1944, and retained DOI Accuracy/Paper Validity/Top Journal Precision at 1.0000. (codex)

## 2026-05-27 - T001-T003 Gold Label Verification (jin23624)

- Context: Seed gold labels for T001-T003 were broad titles without DOI, leading to low precision/NDCG metrics in initial benchmark runs.
- Action: Refined G001-G009 with real top-journal papers (Human Resource Management, Computers in Human Behavior, Strategic Management Journal, Journal of Applied Psychology, Marketing Science, JAMS).
- Result: `npm run benchmark:verify-gold` confirmed all 9 rows as `verified`.
- Expected effect: Precision@5 and NDCG@5 metrics for the Proposed Agent will now reflect actual overlap with high-quality papers, improving the reliability of the benchmark results. (jin23624)

## 2026-05-26 - Gemini Strict Worker Debug Handoff

- Context: The user requested that the Worker debug findings be transferred strictly to Gemini because Gemini does not reliably remember previous sessions. (codex)
- Change: Added `docs/gemini-debug-handoff.md` and updated Gemini operating/session/troubleshooting docs to require reading it before Worker code or config changes. (codex)
- Expected effect: Gemini should classify Worker failures as source-code, local-env, Cloudflare-runtime/config, or expected Wrangler noise before editing source. (codex)
- Verification: `git diff --check`, `npm run typecheck`, and handoff link inspection passed in this session. (codex)

## 2026-05-26 - Local Worker Runtime Check

- Context: The user reported continuing Worker abnormalities and requested local confirmation. (codex)
- Finding: Production Worker health, diagnostics, recent jobs, minimal search, and CSV/Markdown/XLSX/PDF endpoints passed. Minimal search created job `job-1ce620dd-1588-474c-b07b-61f76010e33b`. (codex)
- Finding: The incorrect command `npm run dev:worker -- --port 8787` can become `wrangler dev 8787` and fail because Wrangler treats `8787` as an entry-point file. (codex)
- Finding: The correct local command `npm run dev --workspace apps/worker -- --port 8787` starts the Worker; local `/api/health` returns `ok: true`, while diagnostics report provider secrets missing unless local .dev.vars exists. (codex)
- Change: Added explicit local Worker dev/smoke scripts and `docs/local-worker-troubleshooting.md`. (codex)
- Fix: Updated Worker smoke script so `REQUIRE_READY=false` allows local diagnostics with missing provider secrets while still checking D1 binding and schema columns. (codex)
- Verification: production `npm run smoke:worker`, production minimal search smoke, local `npm run smoke:worker:local`, `npm run typecheck`, `npm run build:web`, `npm run build`, and `git diff --check` passed in this session. (codex)

## 2026-05-27 - Vectorize Index Missing Build Failure (gemini)
- Context: Worker build failed after adding AI and Vectorize bindings to `wrangler.toml`.
- Finding: Cloudflare Build log showed `[ERROR] Vectorize binding 'VECTOR_INDEX' references index 'paper-abstract-index' which was not found.`
- Root cause: `wrangler.toml` referenced a Vectorize index that had not been created in the Cloudflare account yet.
- Action: Ran `npx wrangler vectorize create paper-abstract-index --dimensions=384 --metric=cosine` to create the missing index.
- Status: Resolved. Deploy should now succeed upon retry. (gemini)
