# 8. Conclusion and Reproducibility Statement

Paper Agent is a traceable multi-agent pipeline for business-school scholarly discovery. It combines role decomposition, retrieval tools, DOI verification, journal-policy filtering, open-access checking, persistent traces, ranking, critic review, and report delivery. The verified T001-T003 controlled comparison shows a nuanced result: the Single LLM baseline has higher overlap-based metrics, while Paper Agent preserves strict top-journal precision, DOI integrity, traceability, and hallucination control within the controlled scope.

Artifact-only expansion provides additional implementation evidence without changing the benchmark claim boundary. T004-T006 generated 50 result rows through a gated wrapper. Phase 3L generated 87 result rows for T008-T012 while preserving the T007 timeout and stopping later batches. Full T004-T020 validation remains incomplete.

## Reproducibility Statement

The GitHub repository contains source code, benchmark scripts, prompts, documentation reports, staged-wrapper logic, and claim-boundary checklists. Cloudflare D1 stores live jobs and traces, while isolated local artifact directories preserve staged-run outputs. Reproduction depends on API credentials, external service availability, and explicit approval for gated execution. Future work includes separately approved T013-T020 staged expansion, D1 batch-aware persistence, broader gold-label coverage, timeout handling, and optional external bibliometric enrichment where appropriate.

## Reproduction Procedure

A future reproduction should inspect repository status, provision credentials separately, use plan and preflight gates, isolate artifacts by run ID, verify checksums and status rows, and keep controlled evidence unchanged.

## Future Work

Future work should diagnose the T007 timeout, persist batch-aware D1 fields end to end, expand DOI-backed gold labels, add operational metrics, expose explicit journal-policy modes, and replace placeholder references with verified citations.
