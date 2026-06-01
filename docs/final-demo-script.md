# Final Demo Script: Paper Agent

Updated: 2026-06-01 (codex)

Target duration: 2--3 minutes.

## 1. Research Workflow (45 seconds)

- Open `/dashboard/research`.
- Explain: "Paper Agent is a traceable multi-agent system for scholarly discovery. It does not return only a list of titles; it preserves retrieval, filtering, DOI verification, and reporting evidence."
- Use a conservative keyword search or load a completed fallback job.
- Point to the 12-stage workflow and ranked-paper details.

## 2. Traceability (35 seconds)

- Open `/dashboard/ops`.
- Show Planner, Journal Selector, Retriever, Verifier, Open Access, Ranking, Critic, and Report traces.
- Explain: "The trace view separates live evidence from mock or planned surfaces. Failure evidence remains visible."

## 3. Benchmark v3 (60 seconds)

- Open `/dashboard/evaluation`.
- State: "Benchmark v3 has six layers and 30 metrics. Its current readiness is **PASS WITH CLAIM BOUNDARIES**."
- Explain the boundary:
  - T001--T003: partial common-support comparison.
  - T004--T020: artifact-level validation unless baseline parity is proven.
  - T007: `proposed_agent_missing`.
  - Layer 5A: quota-limited partial implementation audit, 22/125 rows or 17.6%.
  - Layer 5B: deterministic semantic proxy for 125 rows, supplementary only.
- State: "The current evidence does not support full T001--T020 comparative superiority or full semantic-quality validation claims."

## 4. Close (30 seconds)

- Download or show a report artifact.
- Explain: "Paper Agent's contribution is reproducible, claim-boundary-aware evaluation for a traceable literature-discovery workflow. Human scholarly review remains the final authority."

## Fallback

If a live provider is slow or quota-limited, use a previously completed job and continue the trace, evaluation, and report walkthrough. Do not describe fallback evidence as a new live benchmark run.
