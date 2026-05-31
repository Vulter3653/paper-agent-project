# 4. Benchmark Design

Paper-Agent-Bench evaluates whether a literature-review agent retrieves useful and defensible papers under business-school constraints. Tasks represent domain questions and keyword sets. Gold labels are DOI-backed paper records reviewed under a relevance rubric. The controlled quantitative layer currently covers T001-T003. Expansion runs beyond this layer are reported separately as artifact-only evidence until evaluation and audit are complete.

## 4.1 Baselines

- **Rule-Based baseline:** deterministic retrieval and ranking heuristics.
- **Single LLM baseline:** a single-model recommendation baseline used for comparison.
- **Paper Agent:** the traceable multi-agent pipeline.

## 4.2 Metrics

| Metric | Definition | Why it matters |
| --- | --- | --- |
| Precision@5 | proportion of top-five recommendations judged relevant | measures top-ranked usefulness |
| NDCG@5 | normalized discounted cumulative gain at rank five | rewards correct ordering of highly relevant papers |
| DOI Accuracy | proportion of evaluated papers with correct DOI evidence | captures metadata integrity |
| Top Journal Precision | proportion of recommendations satisfying the approved journal policy | captures policy compliance |
| Hallucination Rate | proportion of unsupported or fabricated recommendations | captures trust risk |

## 4.3 Evaluation Protocol

Quantitative claims are limited to the controlled T001-T003 layer with nine comparison rows. Execution artifacts from T004-T006 and T007-T012 are isolated by run ID and are not merged into controlled metrics. Gold labels must not be modified to hide retrieval or ranking failures. Failures remain visible as evidence, including the T007 timeout and legacy T019-T020 HTTP 503 resource-limit records.

## 4.4 Reproducibility Controls

The repository retains scripts, prompts, trace APIs, documentation reports, and claim-boundary rules. Live reproduction requires valid API credentials and available external services. Artifact-only runs use gated wrappers and isolated directories to avoid overwriting controlled evidence.

## 4.5 Validity Boundaries

The controlled layer is intentionally narrow. Metric interpretation must remain multidimensional: overlap, ordering, DOI integrity, venue-policy compliance, hallucination risk, and failure visibility answer different questions.
