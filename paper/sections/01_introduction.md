# Introduction

Scholarly paper discovery is not only a ranking problem. Researchers need relevant papers, but they also need verifiable DOI metadata, explainable filtering, journal-policy compliance, reproducible traces, and visible failures. A plausible recommendation without an audit trail can create citation errors and weak research decisions.

Paper Agent addresses this problem through a tool-using multi-agent workflow. Planner, retrieval, filtering, verification, relevance, ranking, critic, and reporting stages are separated so that intermediate decisions can be inspected. Retrieval-augmented behavior uses configured scholarly-search and metadata services. Tool-use integration connects Crossref, Unpaywall, Cloudflare Workers, D1 traces, storage artifacts, and dashboard reporting. This architecture is deliberately more constrained than a single opaque LLM request.

Evaluation is equally important. Paper-discovery agents should be evaluated with reproducible artifacts and explicit claim boundaries. Benchmark v3 therefore uses six layers and 30 metrics rather than a single leaderboard number. It separates deterministic checks from retrieval metrics, semantic auditing, and operational risks.

## Contributions

1. A traceable 12-stage Paper Agent pipeline for scholarly discovery.
2. Benchmark v3, a six-layer and 30-metric automated evaluation framework.
3. Generated validation artifacts for baseline support, semantic-audit representativeness, and deterministic semantic proxies.
4. Claim-boundary-aware reporting that separates common-support comparison, artifact-level validation, and incomplete semantic coverage.
