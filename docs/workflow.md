# Integrated Workflow Design

Source documents:

- `AI_Agent_프로젝트_전체_통합본.pdf`
- `paper_agent_enhanced_report.md`

This document reflects the integrated project report and the enhanced project report into the implementation roadmap. The target system is a top-journal-aware literature review assistant, not a generic paper search tool.

## Product Definition

The project goal is an AI Agent system for automated scholarly paper discovery, journal quality screening, metadata verification, ranking, comparison, and report generation.

Core principle:

```text
Return fewer but more trustworthy papers:
real papers, verified metadata, allowlisted or high-quality journals, topic relevance, and auditable reasons.
```

Primary user:

```text
Graduate students and researchers preparing a literature review or early-stage research proposal.
```

## Target End-To-End Workflow

```text
User
-> Cloudflare Pages dashboard
-> Cloudflare Workers API / agent workflow
-> Planner Agent
-> Journal Selector Agent
-> Search/Retriever Agent
-> Verifier Agent
-> OA Download Agent
-> Journal Evaluation Agent
-> Relevance Evaluation Agent
-> Ranking Agent
-> Summarizer Agent
-> Comparator Agent
-> Critic Agent
-> Report Agent
-> D1 / R2 / Drive / Vectorize
-> User downloads outputs
```

## Project Definition

The project should be presented as a verifiable top-journal literature review assistant. The core claim is not broad search coverage, but controlled retrieval, journal-quality filtering, metadata verification, transparent scoring, and reproducible report output.

The enhanced report reframes the submission around three priorities:

1. Current implementation evidence from the deployed Cloudflare stack.
2. Explicit multi-agent roles and traceable intermediate outputs.
3. REPRO-Bench-style evaluation comparing rule-based, single-LLM, and proposed agent workflows.

## Agent Responsibilities

| Agent | Responsibility | Current Status | Next Implementation |
| --- | --- | --- | --- |
| Planner Agent | Convert user topic into keywords, sub-questions, field classification, and year/result constraints. | Partial: dashboard keyword, max, year, and field inputs exist; keyword variants exist in Worker. | Move keyword decomposition into `agents/plannerAgent.ts` and persist planner trace. |
| Journal Selector Agent | Select field-specific journal universe and rank priority. | Implemented for business school categories and `국제 S급` -> `국제 A1급` priority. | Persist selected field/rank universe in job metadata or agent trace. |
| Retriever Agent | Retrieve candidate papers from approved scholarly APIs. | Implemented for WoS, with OpenAlex fallback retained for testing. | Move WoS/OpenAlex calls into tool modules and benchmark Recall@20. |
| Verifier Agent | Verify DOI, title, year, journal, authors, publisher, and ISSN with Crossref. | Implemented as Crossref enrichment and verification fields. | Persist verifier input/output summary in `agent_traces`. |
| Open Access Agent | Check Unpaywall, store OA URLs, and later upload allowed OA PDFs to Google Drive. | Implemented for Unpaywall metadata; Drive upload not implemented. | Add Drive upload only for Unpaywall-confirmed OA PDFs. |
| Journal Evaluation Agent | Score journal quality using allowlist, field, and rank class. | Implemented through allowlist, field/rank metadata, and journal fit score. | Add optional JCR/SCImago/CiteScore enrichment if API access is available. |
| Relevance Agent | Score title/abstract similarity against the user topic and explain inclusion. | Partial: keyword-overlap score exists. | Add Vectorize or embedding similarity and human-label evaluation. |
| Ranking Agent | Combine relevance, journal quality, verification, OA availability, citation count, and recency. | Implemented with persisted component scores and final score. | Validate score weights against benchmark tasks. |
| Critic Agent | Recheck metadata, journal match, relevance, hallucination risk, and unsupported claims. | Not implemented. | Add `critic_reviews` table with risk flags and downgrade/review recommendations. |
| Report Agent | Generate CSV/Markdown/XLSX/PDF outputs and store them in R2. | Partial: CSV and Markdown reports stored in R2. | Add XLSX first, then PDF. Include field/rank, critic notes, and trace summary. |
| MCP Interface | Allow external agents to inspect job/result/report state through controlled tools. | Implemented read-only MCP tools. | Add trace and critic-review read tools before any write tools. |

## Workflow Stages

| Stage | Task | Primary Store / Output | Implementation Target |
| --- | --- | --- | --- |
| 1 | User enters keyword/topic | Dashboard state | Implemented |
| 2 | Create search job | D1 `search_jobs` | Implemented |
| 3 | Select field and journal universe | D1 / shared allowlist | Partial |
| 4 | Search candidate papers | External API results | Implemented with WoS; OpenAlex fallback available |
| 5 | Verify DOI and bibliography | D1 `papers` Crossref fields | Partial |
| 6 | Check OA availability | D1 Unpaywall fields | Implemented |
| 7 | Store OA PDF in Drive | Drive file ID / URL | Not implemented |
| 8 | Persist paper metadata | D1 `papers` | Implemented |
| 9 | Evaluate journal quality | D1 `evaluations` | Partial |
| 10 | Evaluate relevance | D1 `evaluations` / Vectorize | Partial |
| 11 | Rank and critic-review | D1 scores and reasons | Ranking implemented; critic not implemented |
| 12 | Generate outputs | R2 CSV/Markdown now; PDF/XLSX later | Partial |

## Data Architecture

| Store | Use | Current State |
| --- | --- | --- |
| Cloudflare D1 | Search jobs, papers, verification fields, OA metadata, evaluation scores. | Implemented and healthy. |
| Cloudflare R2 | Final output files and durable report artifacts. | Implemented for `papers.csv` and `report.md`. |
| Cloudflare Vectorize | Abstract/topic embeddings and semantic similarity search. | Planned. |
| Google Drive | OA PDF originals for team review. | Planned. |

R2 should not become the operational metadata database. Search, filtering, ranking, and job state must remain in D1.

## Output Standard

Final report outputs should include:

- Rank
- Title, authors, year
- Journal and top journal or Q1 status
- DOI and verification status
- Abstract/topic relevance score
- Journal quality score
- Citation and recency scores
- OA status and PDF/link availability
- Summary of research question, theory, method, data, and findings
- Commonality with user topic
- Difference from user topic
- Research gap
- Critic note and exclusion/review reason

Current outputs:

- CSV: persisted metadata, OA fields, score components, final score, inclusion status.
- Markdown: executive summary, ranked table, paper details, OA links, license, score breakdown.

Planned outputs:

- `report.pdf`
- `papers.xlsx`

## Evaluation Plan

Benchmarks should compare:

1. Rule-based keyword search baseline
2. Single LLM recommendation baseline
3. Proposed top-journal-aware agent workflow

Core metrics:

- Precision@5
- Paper validity rate
- DOI accuracy
- Top journal precision
- Hallucination rate
- OA PDF success rate
- Report completeness
- Latency
- Cost and quota usage

Human evaluation rubric:

| Score | Meaning |
| --- | --- |
| 5 | Directly relevant and immediately useful for the research topic. |
| 4 | Highly relevant with minor scope differences. |
| 3 | Indirectly relevant. |
| 2 | Only keyword-level relevance. |
| 1 | Irrelevant or invalid recommendation. |

## Paper-Agent-Bench Plan

The enhanced report proposes a REPRO-Bench-style evaluation adapted for literature review. The benchmark should include at least 20 tasks, each with a keyword, field, year range, max result count, gold relevant papers, DOI labels, and human relevance labels.

Minimum task example:

```json
{"task_id":"T001","keyword":"AI interview employer branding","field":"organization-hr","year_start":2020,"year_end":2026,"max_results":5}
```

Agent-level metrics:

| Agent | Metrics |
| --- | --- |
| Planner | Query Coverage, Field Accuracy |
| Journal Selector | Field Classification Accuracy, Journal Set Precision |
| Retriever | Recall@20, Candidate Validity Rate |
| Verifier | DOI Accuracy, Metadata Match Accuracy |
| OA Agent | OA Status Accuracy, PDF URL Precision |
| Relevance | Human Relevance Correlation, Binary Accuracy |
| Ranking | Precision@5, NDCG@5, Verified@5 |
| Critic | Error Detection Precision/Recall |
| Report | Completeness, Format Validity |
| MCP | Tool Correctness, Safety, E2E Consistency |

## Security And Policy Constraints

- Do not bypass paywalls.
- Store only OA PDFs confirmed by Unpaywall or user-provided files.
- Keep credentials in Cloudflare secrets, never in Git.
- Use minimum-scope MCP/tool permissions.
- Do not expose destructive tools such as database drop, account management, or unrestricted file deletion.
- Treat journal metrics as evidence, not as the only quality signal.

## Submission Roadmap

The enhanced report prioritizes benchmark evidence and reproducibility before additional visual polish.

| Priority | Work | Completion Standard |
| --- | --- | --- |
| 1 | Expand benchmark tasks | `benchmark/tasks.jsonl` with at least 20 tasks and gold relevant papers. |
| 2 | Baseline comparison | Rule-based, single-LLM, and proposed-agent result tables. |
| 3 | Critic Agent | `critic_reviews` table with risk level, flags, recommendation, and critic note. |
| 4 | Agent traces | `agent_traces` table with each agent input/output summary. |
| 5 | XLSX output | `GET /api/search-jobs/:id/papers.xlsx` and R2 `reports/<job_id>/papers.xlsx`. |
| 6 | PDF output | `GET /api/search-jobs/:id/report.pdf` and R2 `reports/<job_id>/report.pdf`. |
| 7 | Vectorize relevance | Embedding-based relevance scoring and benchmark comparison. |
| 8 | Drive upload | Store only Unpaywall-confirmed OA PDFs in Google Drive. |
| 9 | Prompt and paper list docs | Complete `docs/prompts.md` and `used_papers.md`. |
| 10 | Final presentation package | 8-12 page paper, slides, and 2-3 minute demo script. |
