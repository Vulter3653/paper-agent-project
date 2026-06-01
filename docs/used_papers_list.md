# Used Papers List

Updated: 2026-06-01 (codex)

This file records the scholarly references used in the Paper Agent final manuscript and explains their role. It is a submission artifact for reproducibility. The references support design and evaluation framing; they are not benchmark outputs or recommended papers returned by a live Paper Agent run.

| Reference | Role in project | Where used | Why it matters | Support area |
| --- | --- | --- | --- | --- |
| Kyle Lo et al. "S2ORC: The Semantic Scholar Open Research Corpus." ACL 2020. | Scholarly-corpus context for literature-search systems. | `paper/final-paper-draft.tex`, Related Work. | Shows the scale and structured nature of scholarly metadata that research-support workflows must handle. | Scholarly search; reproducibility. |
| Qingyun Wu et al. "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation." arXiv:2308.08155, 2023. | Multi-agent design context. | `paper/final-paper-draft.tex`, Related Work. | Supports the architectural discussion of role decomposition and multi-agent workflow orchestration. | Multi-agent design; tool use. |
| Patrick Lewis et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." NeurIPS 2020. | Retrieval grounding context. | `paper/final-paper-draft.tex`, Related Work. | Establishes the rationale for grounding model behavior in external evidence rather than relying on unsupported generation. | RAG; search. |
| Xiao Liu et al. "AgentBench: Evaluating LLMs as Agents." arXiv:2308.03688, 2023. | Agent-evaluation and reproducibility context. | `paper/final-paper-draft.tex`, Related Work. | Motivates explicit task scope, evaluation protocol, and reproducible evidence when evaluating agentic systems. | Benchmark design; reproducibility; limitations. |

## Project Evidence References

The project also relies on non-paper evidence sources that are documented separately:

| Evidence source | Role | Repository location |
| --- | --- | --- |
| Paper-Agent-Bench specification | Domain benchmark protocol and metrics. | [`docs/benchmark.md`](benchmark.md) |
| Controlled T001-T003 evidence | Audited quantitative comparison layer. | [`benchmark/`](../benchmark/) |
| Benchmark v3 deterministic report | Six-layer, 30-metric validation summary and promotion-gate context. | [`docs/benchmark-v3-deterministic-validation-report.md`](benchmark-v3-deterministic-validation-report.md) |
| Baseline support supplement | T001-T003 common-support boundary and T004-T020 artifact-level boundary. | [`benchmark/validation/v3/baseline_support_matrix_v3.md`](../benchmark/validation/v3/baseline_support_matrix_v3.md) |
| Layer 5 representativeness supplement | 22/125 quota-limited subset audit and no-Proposed-Agent-row boundary. | [`benchmark/validation/v3/layer5_representativeness_v3.md`](../benchmark/validation/v3/layer5_representativeness_v3.md) |
| Layer 5B proxy supplement | Deterministic semantic proxy coverage for 125 rows. | [`benchmark/validation/v3/layer5_deterministic_semantic_proxy_v3.md`](../benchmark/validation/v3/layer5_deterministic_semantic_proxy_v3.md) |
| Claim-boundary checklist | Safe interpretation constraints for the final paper. | [`paper/paper_claim_boundary_checklist.md`](../paper/paper_claim_boundary_checklist.md) |

## Scope Note

This list intentionally distinguishes scholarly references from runtime artifacts. Controlled quantitative comparison remains limited to T001-T003 common support. T004-T020 remain artifact-level validation tasks unless baseline parity is proven. Layer 5A is quota-limited and Layer 5B is supplementary.
