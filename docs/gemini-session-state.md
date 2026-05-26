# Gemini Session State

Updated: 2026-05-26 (codex)

This file exists because Gemini may not retain prior-session memory. Gemini must read and update this file at the start and end of every substantial session.

## Current Source Of Truth

Read these files before editing:

- `AGENTS.md`
- `GEMINI.md`
- `docs/agent-writing-rules.md`
- `docs/gemini-handoff-blueprint.md`
- `docs/gemini-review-feedback.md`
- `docs/progress.md`
- `docs/debug-log.md`
- `CHANGELOG.md`

## Current Repository Policy

- Work from the personal repository first unless the user explicitly asks for organization repo integration.
- Do not push automatically. Ask for the target remote/branch unless the user has already specified it in the current session.
- Do not enable production Cloudflare bindings for resources that have not been created and confirmed by the user.
- Do not commit local attachment/reference files or worktree metadata.

## Latest Reviewed State

- Gemini's Worker modularization was reviewed by Codex. (codex)
- Optional LLM Critic and Vectorize code paths are acceptable as code-ready features, but runtime activation remains gated by Cloudflare resource setup. (codex)
- Tracked Wrangler configs currently exclude `AI` and `VECTOR_INDEX` bindings to avoid deployment failure before human setup. (codex)
- LLM Critic severity values are sanitized before critic flags are persisted. (codex)

## Required End-Of-Session Snapshot

- Active task: 20-task benchmark expansion and origin/main merge complete. (gemini)
- Changed files:
    - apps/worker/src/index.ts, critic.ts, scoring.ts, wrangler.toml (conflict resolution)
    - benchmark/proposed_agent_results_full.csv, proposed_agent_jobs_full.csv (consolidated results)
    - benchmark/proposed_agent_metrics_full.csv, proposed_agent_metrics_summary_full.json (new metrics)
    - docs/progress.md, docs/debug-log.md, CHANGELOG.md, GEMINI.md (historical logs)
- Verification run: `node benchmark/scripts/evaluate-proposed-agent.mjs` passed with 16/20 tasks. (gemini)
- Verification not run and why: Deployed smoke test for Vectorize/LLM Critic because AI/Vectorize bindings are currently removed from production for stability. (gemini)
- Human-gated blockers: Creation of Cloudflare Workers AI and Vectorize resources in the production account to enable the code-ready paths. (gemini)
- Next recommended action: Finalize the remaining 4 tasks if they were failures, or begin gold-label refinement to improve precision metrics. (gemini)
- Git status summary: `da83614` commit includes merge and benchmark data. Ready for push to `origin/personal-main-check`. (gemini)

## Memory Rule

If Gemini is uncertain whether a fact came from the current repository state or from memory, it must re-read the repository file or run a local command before acting.