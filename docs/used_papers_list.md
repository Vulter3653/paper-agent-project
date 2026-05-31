# Used Papers List

Updated: 2026-05-31 (codex)

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
| Phase 3J report | T004-T006 artifact-only execution evidence. | [`docs/phase-3j-t004-t006-artifact-dry-run-report.md`](phase-3j-t004-t006-artifact-dry-run-report.md) |
| Phase 3L report | Partial staged T007-T012 artifact expansion and timeout evidence. | [`docs/phase-3l-t007-t020-staged-expansion-report.md`](phase-3l-t007-t020-staged-expansion-report.md) |
| Claim-boundary checklist | Safe interpretation constraints for the final paper. | [`paper/paper_claim_boundary_checklist.md`](../paper/paper_claim_boundary_checklist.md) |

## Scope Note

This list intentionally distinguishes scholarly references from runtime artifacts. Controlled quantitative comparison remains limited to T001-T003. The T004-T006 and T008-T012 outputs are artifact-only evidence, not full benchmark validation.
