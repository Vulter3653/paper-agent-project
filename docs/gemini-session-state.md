# Gemini Session State

Updated: 2026-05-28 (codex baseline comparison follow-up)

## Current Source Of Truth
- `AGENTS.md`
- `GEMINI.md`
- `docs/agent-writing-rules.md`
- `docs/progress.md`
- `docs/agent-work-queue.md`
- `docs/team-task-briefing.md`
- `docs/debug-log.md`
- `CHANGELOG.md`
- `docs/member-c-baseline-review-2026-05-28.md`

## Current Personal Repo State

- Personal `origin/main` is the active working baseline.
- Working branch: `benchmark/gemini-t004-t006-gold-refinement`.
- Baseline input data (T001-T003) for Rule-based, Single-LLM, and Proposed Agent verified for consistency.

## Latest Reviewed State

- Gold audit is complete (60 rows).
- Fresh Single-LLM baseline rows (15 rows) exist for T001-T003.
- Input CSVs reviewed; baseline schema differences are handled by `benchmark/scripts/compare-baselines.mjs`.
- Baseline comparison outputs now exist at `benchmark/baseline_comparison_metrics.csv` and `benchmark/baseline_comparison_summary.json`.

## What Gemini Must Do Next

Next task: QA and interpret the generated baseline comparison outputs.

Required focus:

1. Run `npm run benchmark:compare-baselines` after any benchmark input change.
2. Review whether Single-LLM gains are inflated by repository-grounded gold overlap.
3. Review accepted exception effects, especially `T001/G003` and duplicate DOI `10.1016/j.chb.2022.107179`.
4. Do not modify Worker, Cloudflare, deployment, or dashboard files for this benchmark QA task.
5. Update `CHANGELOG.md`, `docs/progress.md`, `docs/debug-log.md`, and this file before ending the session.

## Gemini Constraints

- Do not modify Worker, Cloudflare, deployment, or dashboard files.
- Keep all edits within assigned benchmark/docs files.
- Ensure (gemini) attribution is used.

## Required Verification Baseline

```bash
npm run benchmark:audit-gold
npm run benchmark:evaluate-proposed
npm run benchmark:compare-baselines
git diff --check
```

## Handoff Memory Rule

Repository files are the memory layer.
Gemini must read this file before editing and update it again before ending.
Do not rely on chat history for task status.
