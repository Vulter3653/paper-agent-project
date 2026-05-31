# 1. Introduction

Literature review is a recurring bottleneck for business-school researchers, graduate students, and project teams. The task is not merely to locate papers whose titles appear related to a question. A defensible review must identify relevant work, verify bibliographic metadata, retain DOI evidence, comply with an approved journal policy, inspect access paths, and explain why specific papers were ranked or excluded. Researchers often perform these checks across disconnected search portals, publisher pages, DOI registries, open-access services, spreadsheets, and local notes.

Generative AI can reduce search effort, but a single LLM call is an inadequate control surface for a scholarly workflow. A fluent answer may contain plausible yet unverifiable recommendations. Even when the recommendations are real, the user may not know which external source was consulted, whether journal-policy constraints were applied, whether DOI metadata was checked, or why one result ranked above another. This traceability gap is especially important in academic contexts where the user remains responsible for the final literature selection.

Paper Agent addresses this gap through a traceable multi-agent and tool-using pipeline. The system decomposes the workflow into stages with explicit inputs, outputs, traces, and failure boundaries. Rather than treating an LLM response as the result, Paper Agent treats externally verifiable artifacts as the result: candidate metadata, allowlist decisions, Crossref verification outcomes, Unpaywall status, ranking components, persisted traces, and downloadable reports.

The primary user is a researcher preparing an early-stage business-school literature review. The design goal is not autonomous scholarship. It is a reproducible decision-support workflow that reduces repetitive verification work while keeping human review authoritative.

## Contributions

This project makes five contributions:

1. A traceable 12-stage multi-agent architecture for scholarly paper discovery.
2. A DOI- and journal-policy-aware verification pipeline integrating scholarly search, Crossref metadata checks, Unpaywall status, and persistent traces.
3. Paper-Agent-Bench, a domain-specific evaluation protocol for relevance, ranking, DOI integrity, journal-policy compliance, and hallucination risk.
4. A controlled baseline comparison for T001-T003 plus artifact-only staged expansion evidence for T004-T012.
5. A reproducibility and claim-boundary framework that distinguishes controlled evidence, legacy partial artifacts, staged execution artifacts, and unfinished validation.

## Problem Definition and Design Requirements

The operational problem is a constrained evidence-selection task: retrieve candidates, apply domain policy, verify metadata, preserve traces, and deliver inspectable outputs. The derived requirements are separation of retrieval from recommendation, explicit venue policy, structured DOI verification, observable failures, report-to-record linkage, and claim boundaries aligned with audited scope.

## Representative User Workflow

A researcher submits a business topic, inspects live stage progress, reviews ranked candidates with evidence, and remains responsible for final citation decisions. The system reduces repetitive verification work rather than replacing scholarly judgment.
