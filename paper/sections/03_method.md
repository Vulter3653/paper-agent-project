# 3. Method and System Design

Paper Agent is a multi-agent decision-support pipeline rather than a single LLM wrapper. Each stage records a traceable output that can be inspected independently. The current Worker implementation uses Web of Science as the primary configured scholarly search provider and OpenAlex as a fallback for testing and quota resilience. Crossref performs DOI and metadata verification, while Unpaywall records open-access status. Cloudflare Workers execute the pipeline and Cloudflare D1 persists jobs, papers, scores, and traces.

| Stage | Agent Role | Input | Tool / Data Source | Output Trace |
| --- | --- | --- | --- | --- |
| 1 | Planner | research question, runtime constraints | request payload | normalized scope and constraints |
| 2 | Journal Selector | scope, selected field | internal allowlist | journal pool and category |
| 3 | Search / Retriever | keywords, years, journal priorities | WoS primary; OpenAlex fallback | candidate metadata |
| 4 | Journal Filtering | candidate papers | internal business-school allowlist | accepted and excluded candidates |
| 5 | Verifier | accepted metadata and DOI | Crossref | verification status and reasons |
| 6 | Open Access | verified DOI | Unpaywall | OA PDF and landing-page status |
| 7 | Storage | papers and artifacts | D1, R2, optional Drive path | persisted records and storage trace |
| 8 | Evaluation Prep | enriched records | scoring preparation logic | normalized evaluation inputs |
| 9 | Relevance | title, abstract, keywords | metadata scoring; optional semantic path | relevance components |
| 10 | Ranking | evaluation components | deterministic ranking logic | ordered paper list |
| 11 | Critic | ranked papers | rule-based default; opt-in LLM path | critic flags and review summary |
| 12 | Report / Delivery | ranked records and traces | report generator, dashboard | CSV, Markdown, XLSX, PDF links and traces |

## 3.1 Traceability and Failure Isolation

The pipeline records job progress and stage-level traces in D1. This design preserves observable partial state: retrieval failure, timeout, OA lookup failure, or report-generation limitations can be recorded without silently rewriting earlier evidence. The staged benchmark wrapper similarly writes isolated artifact directories and stops later batches after a task-level failure.

## 3.2 Why This Is Agentic

The system is not a thin interface around one prompt. It combines role decomposition, retrieval tools, explicit verification, persistent traces, deterministic scoring, a critic stage, and report delivery. LLM-backed behavior is optional where appropriate; the default pipeline remains inspectable even when resource-intensive model calls are disabled.

## 3.3 Journal Policy, Verification, and Access

The internal allowlist is an explicit domain constraint, not a universal quality oracle. Crossref reduces bibliographic uncertainty. Unpaywall records access status without treating access as a quality signal.

## 3.4 Scoring, Storage, and Dashboard Surfaces

The inspectable default combines metadata-based scoring with stored traces and report outputs. Optional semantic and LLM-backed paths remain resource-sensitive. Dashboard badges distinguish live D1 evidence, controlled evidence, legacy artifacts, mock structures, scenario simulations, and planned-only features.

## 3.5 Implementation Architecture

The Worker returns a job identifier before the full pipeline completes, allowing the dashboard to poll observable progress. D1 stores ordered traces with summaries, counts, timestamps, and errors. Evidence is separated into live D1 data, controlled benchmark rows, artifact-only runs, legacy partial artifacts, mock blueprint panels, and scenario simulations. Report formats are views over the evidence layer rather than independent proof of evaluation completion.

## 3.6 Operational Safety Gates

Staged wrappers expose plan and preflight modes, isolate output paths by run ID, reject broad scopes, require explicit execution acknowledgement, and stop later batches after failures. The wrapper currently preserves local artifacts but does not persist batch metadata to D1.
