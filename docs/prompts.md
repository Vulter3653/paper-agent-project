# Paper Agent Prompt Inventory

Updated: 2026-05-31 (codex)

This document records the prompt categories used by Paper Agent and the project audits. The repository does not preserve every historical runtime prompt verbatim. Unless an entry explicitly says otherwise, the text below is a **reconstructed project prompt template** derived from the implemented workflow and documentation. These templates document intended behavior; they do not invent evaluation results.

## Prompt Classification

| Category | Meaning |
| --- | --- |
| Production | Runtime pipeline behavior for scholarly discovery. |
| Benchmark | Evaluation preparation or reproducible QA behavior. |
| Audit | Safety, verification, and claim-boundary review. |
| Documentation | UI, paper, or submission-package guidance. |

## 1. Planner Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Normalize a research question into searchable scope, constraints, and sub-questions.
- **Input**: Research question, keywords, year range, result limit, selected business-school field.
- **Output**: Normalized query scope, sub-question list, and runtime constraints.
- **Template**: "Decompose the research question into concise searchable concepts and sub-questions. Preserve the requested year range, field, and maximum result count. Do not invent citations or claim that retrieval has occurred."
- **Claim-boundary constraint**: Planning output is a search plan, not retrieved evidence.

## 2. Journal Selector Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Select the applicable internal journal pool and tier priority.
- **Input**: Normalized scope and selected business-school field.
- **Output**: Internal allowlist subset and tier ordering.
- **Template**: "Map the request to the internal business-school journal allowlist. Prioritize international S-tier venues, then A1-tier venues. Record the applied field and tier. Do not describe the allowlist as a universal quality oracle."
- **Claim-boundary constraint**: Journal policy is an internal filter, not proof of paper quality.

## 3. Search / Retriever Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Retrieve candidate scholarly records from the configured backend.
- **Input**: Search concepts, year range, selected provider, result limit.
- **Output**: Candidate paper metadata and source trace.
- **Template**: "Query the configured scholarly search backend using the normalized scope. Return source metadata and preserve provider identity. Do not fabricate missing papers, DOI values, authors, or venues."
- **Claim-boundary constraint**: Retrieved candidates require filtering and verification.

## 4. Journal Filtering Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Apply the selected internal allowlist to candidates.
- **Input**: Retrieved candidate records and journal pool.
- **Output**: Included and excluded candidates with reasons.
- **Template**: "Apply the internal allowlist deterministically. Keep inclusion and exclusion reasons visible. Do not rewrite an excluded paper as a retrieval failure or relevance failure."
- **Claim-boundary constraint**: Allowlist inclusion does not establish substantive relevance.

## 5. DOI / Metadata Verifier Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Check DOI, title, author, year, and journal metadata against Crossref evidence.
- **Input**: Allowed candidate metadata and DOI values.
- **Output**: Verification status, normalized metadata, and mismatch reasons.
- **Template**: "Verify available DOI-backed metadata through Crossref. Record exact, partial, missing, or mismatch outcomes. Preserve uncertainty and never invent missing metadata."
- **Claim-boundary constraint**: Metadata verification reduces bibliographic uncertainty; it does not prove research quality.

## 6. Open Access Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Check OA PDF and landing-page availability through Unpaywall.
- **Input**: Verified DOI values and Unpaywall lookup results.
- **Output**: OA status, PDF URL, landing-page URL, license, and host type where available.
- **Template**: "Record Unpaywall OA evidence separately from scholarly quality. Preserve not-found and lookup-failure states. Do not treat OA availability as a relevance score."
- **Claim-boundary constraint**: OA status is access metadata, not a journal-quality signal.

## 7. Storage / Trace Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Persist job, paper, trace, and report-output records.
- **Input**: Stage outcomes, paper metadata, evaluation values, output artifacts.
- **Output**: D1 trace rows and report-storage status.
- **Template**: "Store stage status, counts, timestamps, and errors without hiding partial failures. Keep artifact paths and persistence status traceable."
- **Claim-boundary constraint**: Storage success is not benchmark validation.

## 8. Evaluation Prep Agent Prompt

- **Type**: Production and benchmark; reconstructed project prompt template.
- **Purpose**: Normalize enriched records for scoring and later benchmark inspection.
- **Input**: Filtered and enriched paper records.
- **Output**: Scoring-ready records with explicit missing-value handling.
- **Template**: "Prepare normalized evaluation inputs. Keep missing metadata explicit and separate live runtime records from controlled benchmark artifacts."
- **Claim-boundary constraint**: Prepared records are inputs, not final evaluation claims.

## 9. Relevance Judge Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Estimate topical relevance from title, abstract, keyword, and metadata evidence.
- **Input**: Research keyword, title, abstract, year, and journal metadata.
- **Output**: Title score, abstract score, relevance reason, and inclusion status.
- **Template**: "Score topical relevance using available metadata. Explain the evidence. If the abstract is missing or ambiguous, retain uncertainty rather than fabricating support."
- **Claim-boundary constraint**: Relevance score is a prioritization aid, not a scholarly verdict.

## 10. Ranking Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Order candidates using observable scoring components.
- **Input**: Relevance, journal fit, verification, citation, recency, and OA metadata components.
- **Output**: Ranked list and score-component trace.
- **Template**: "Rank candidates using documented components. Keep component values inspectable and do not present the final rank as automatic citation approval."
- **Claim-boundary constraint**: Rank is decision support only.

## 11. Critic Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Review ranked results for metadata risk, overstatement, and unsupported recommendations.
- **Input**: Ranked records, verification outcomes, and trace summaries.
- **Output**: Critic flags, concise review summary, and fallback mode where relevant.
- **Template**: "Identify unsupported or risky recommendations. Preserve rule-based fallback when optional LLM analysis times out. Add flags; do not silently overwrite source records."
- **Claim-boundary constraint**: Critic output is review assistance, not autonomous acceptance.

## 12. Report / Delivery Agent Prompt

- **Type**: Production; reconstructed project prompt template.
- **Purpose**: Generate reviewable Markdown, PDF, CSV, and XLSX outputs.
- **Input**: Ranked records, traces, critic summaries, and output policy.
- **Output**: Report artifacts and download metadata.
- **Template**: "Generate concise outputs that preserve evidence source, verification status, and incomplete states. Use Korean Markdown and English PDF where required by the current report engine."
- **Claim-boundary constraint**: A generated report does not establish completed benchmark validation.

## 13. Benchmark QA Prompt

- **Type**: Benchmark and audit; reconstructed project prompt template.
- **Purpose**: Inspect gold labels, baseline rows, metric artifacts, and task-scope provenance.
- **Input**: Benchmark CSV/JSON artifacts, task definitions, and audit rules.
- **Output**: Reproducible QA findings and explicit exceptions.
- **Template**: "Check DOI-backed gold metadata, scope boundaries, row counts, and failure evidence. Keep ambiguous rows visible. Do not rewrite labels or failures to improve metrics."
- **Claim-boundary constraint**: Quantitative comparison claims remain limited to controlled T001-T003 evidence unless separately audited.

## 14. Claim Boundary / Anti-Overclaim Prompt

- **Type**: Audit; reconstructed project prompt template.
- **Purpose**: Prevent mock UI, artifacts, partial runs, and legacy outputs from becoming unsupported claims.
- **Input**: Paper, presentation, dashboard text, reports, and benchmark documentation.
- **Output**: Allowed claims, forbidden claims, and required wording corrections.
- **Template**: "Distinguish controlled benchmark evidence, artifact-only execution evidence, partial expansion, legacy records, mock blueprint panels, and planned features. Do not claim global outperform or completed full validation."
- **Claim-boundary constraint**: Full T004-T020 validation remains incomplete; D1 batch-aware persistence is not implemented.

## 15. Dashboard UX / DESIGN.md Prompt

- **Type**: Documentation; summarized project prompt.
- **Purpose**: Guide evaluator-first dashboard UX implementation.
- **Input**: Root `DESIGN.md`, evidence taxonomy, and current dashboard routes.
- **Output**: Clear evidence summaries, badges, responsive panels, and collapsed technical traces.
- **Summary**: "Use an academic evidence-dashboard design. Make controlled, artifact-only, partial, planned, mock, and technical-trace states visually distinct. Keep technical evidence available but collapsed by default."
- **Claim-boundary constraint**: Interface polish must not imply evaluation completion.

## 16. Final Submission Audit Prompt

- **Type**: Documentation and audit; summarized project prompt.
- **Purpose**: Verify paper, presentation, README, prompts, and used-paper list before submission.
- **Input**: Submission files, claim checklist, and repository evidence reports.
- **Output**: Missing-item report and claim-safe corrections.
- **Summary**: "Check references, section structure, presentation timing, demo flow, repository links, prompt inventory, used papers, and forbidden overclaim wording. Preserve incomplete evidence states."
- **Claim-boundary constraint**: Do not introduce new results or describe artifact evidence as validation.
