# Method / System Design

Paper Agent is a 12-stage multi-agent and tool-use pipeline rather than a single LLM wrapper.

| Stage | Role | Main purpose | Tool or output evidence |
| --- | --- | --- | --- |
| 1 | Planner | Convert the research request into a structured plan | plan trace |
| 2 | Journal Selector | Apply the internal business-school allowlist | journal-policy trace |
| 3 | Search / Retriever | Retrieve candidate papers | configured scholarly search backend |
| 4 | Journal Filtering | Exclude out-of-policy candidates | filter decisions |
| 5 | Verifier | Normalize metadata and validate DOI fields | Crossref metadata evidence |
| 6 | Open Access | Resolve OA status where available | Unpaywall evidence |
| 7 | Storage | Persist artifacts and workflow traces | storage artifact / D1 trace |
| 8 | Evaluation Prep | Shape reproducible benchmark inputs | evaluation rows |
| 9 | Relevance | Assess query-candidate fit | relevance evidence |
| 10 | Ranking | Produce ordered recommendations | ranked output |
| 11 | Critic | Review evidence and visible failures | critic trace |
| 12 | Report / Delivery | Deliver reports and dashboard summaries | report artifact |

The pipeline combines Multi-Agent decomposition, retrieval-augmented processing, and MCP-style tool-use principles where accurate. External services are treated as evidence sources rather than unquestioned authorities. DOI normalization, metadata checks, OA lookup, and report delivery create inspectable intermediate artifacts. Cloudflare Workers support execution; Cloudflare D1 supports trace and benchmark evidence. Dashboard reporting presents claim-bounded summaries while preserving access to technical traces.

The architecture is intended to isolate errors. Retrieval failure, metadata mismatch, unavailable OA data, semantic-audit quota limits, hallucination risk, and timeout behavior should remain visible rather than being collapsed into an unsupported success claim.
