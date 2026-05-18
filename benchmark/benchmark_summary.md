# Paper-Agent-Bench Summary

Updated: 2026-05-17

## Status

The first benchmark fixture layer is now initialized from `paper_agent_enhanced_report.md`.

Current files:

- `benchmark/tasks.jsonl`: 20 benchmark tasks covering organization/HR, marketing, strategy, accounting/finance, operations, and information systems.
- `benchmark/keywords.csv`: compatibility keyword list expanded from 3 to 20 queries.
- `benchmark/gold_relevant_papers.csv`: 60 seed gold relevance rows, 3 per task.
- `benchmark/gold_relevant_papers.verified.csv`: first Crossref title-query verification pass.
- `benchmark/gold_promotion_decisions.csv`: manual promotion decisions for high-confidence candidate rows.
- `benchmark/gold_refinement_queue.csv`: non-verified seed rows that need exact-title replacement or manual review.
- `benchmark/gold_crossref_candidates.csv`: Crossref candidate pool generated from task-level queries.
- `benchmark/gold_candidate_review.csv`: scored candidate review file with allowlist, field, type, DOI, and priority labels.
- `benchmark/evaluation_rubric.md`: human scoring, core metrics, and agent-level checks.
- `benchmark/scripts/verify-gold-crossref.mjs`: local Crossref verification utility.
- `benchmark/scripts/refine-gold-candidates.mjs`: local refinement queue and candidate generation utility.
- `benchmark/scripts/score-gold-candidates.mjs`: local candidate scoring utility based on journal allowlist, field match, type, DOI, recency, and Crossref score.
- `benchmark/scripts/run-proposed-agent.mjs`: deployed Worker runner for collecting Proposed Agent benchmark outputs.

## Important Constraint

The seed gold rows intentionally do not fabricate DOI values. Each DOI field is blank and marked with:

```text
doi_label_status=needs_crossref_verification
```

The first Crossref title-query pass has been run. After manual promotion of two high-confidence candidates, the current status is:

| Status | Count | Meaning |
| --- | ---: | --- |
| `verified` | 8 | Title match exceeded the automatic verification threshold or was manually promoted from strict candidate review. |
| `ambiguous` | 17 | Crossref returned a possible DOI, but the title match is not strong enough for final gold use. |
| `no_match` | 35 | No acceptable Crossref title candidate was found. |

This confirms that the seed labels are useful as benchmark topics, but not yet strong enough as final DOI gold labels. Before computing final DOI Accuracy, the ambiguous and no-match rows need manual title refinement or replacement with exact known papers.

## Gold Refinement Queue

The first refinement queue has been generated:

| File | Rows | Purpose |
| --- | ---: | --- |
| `benchmark/gold_refinement_queue.csv` | 52 | Non-verified gold rows requiring exact-title replacement or manual review. |
| `benchmark/gold_crossref_candidates.csv` | 200 | Task-level Crossref candidates, 10 per task, marked `needs_manual_review`. |
| `benchmark/gold_candidate_review.csv` | 200 | Candidate list sorted by task and review score, with automatic priority labels. |

All 20 tasks still need at least one refinement action because none currently has three verified DOI gold labels. Crossref task-level candidates are intentionally not auto-accepted because many results are broad, non-top-journal, book-chapter, dissertation, or otherwise outside the approved journal universe.

The first candidate scoring pass produced:

| Priority | Count | Meaning |
| --- | ---: | --- |
| `promote_candidate` | 2 | Journal article, DOI present, same field, and approved S/A1 journal match. |
| `topic_only_review` | 90 | Journal article with DOI, but outside approved field/journal universe. |
| `reject_low_priority` | 108 | Non-article, missing DOI, old, or otherwise weak candidate. |

The two `promote_candidate` rows still require human relevance review before gold promotion.

## Promotion Decisions

Two `promote_candidate` rows have been reviewed and promoted:

| Task | Gold ID | Title | Journal | DOI | Rank |
| --- | --- | --- | --- | --- | --- |
| T004 | G010 | The Role of Human Managers within Algorithmic Performance Management Systems: A Process Model of Employee Trust in Managers through Reflexivity | Academy of Management Review | 10.5465/amr.2022.0058 | 국제 S급 |
| T019 | G055 | The omnichannel continuum: Integrating online and offline channels along the customer journey | Journal of Retailing | 10.1016/j.jretai.2022.02.003 | 국제 A1급 |

The decisions are recorded in `benchmark/gold_promotion_decisions.csv`. The promoted rows replaced broad seed titles in both `benchmark/gold_relevant_papers.csv` and `benchmark/gold_relevant_papers.verified.csv`.

## Planned Baseline Comparison

The benchmark will compare:

1. Rule-based scholarly search baseline
2. Single LLM recommendation baseline
3. Proposed top-journal-aware multi-agent workflow

Target metrics:

- Precision@5
- NDCG@5
- Paper Validity Rate
- DOI Accuracy
- Top Journal Precision
- Hallucination Rate
- OA PDF Success Rate
- Report Completeness

## Proposed Agent Runner

The Proposed Agent runner is implemented and smoke-tested:

```bash
npm run benchmark:run-proposed -- --limit 1 --max-results 5 --poll-ms 5000 --timeout-ms 300000 --output /tmp/proposed_smoke.csv --jobs-output /tmp/proposed_jobs_smoke.csv
```

Smoke result:

| Task | Job ID | Status | Source | Allowed | Result Rows |
| --- | --- | --- | ---: | ---: | ---: |
| T001 | `job-768671a5-346d-4f0f-af54-6f29014ceb27` | completed | 8 | 5 | 5 |

The full run command should be executed only when ready to spend WoS quota:

```bash
npm run benchmark:run-proposed
```

Default outputs:

```text
benchmark/proposed_agent_jobs.csv
benchmark/proposed_agent_results.csv
```

## Next Step

Refine the gold set:

1. Review `ambiguous` rows and keep only papers from the approved journal universe.
2. Start from `benchmark/gold_candidate_review.csv` rows marked `promote_candidate`.
3. Use `benchmark/gold_crossref_candidates.csv` as a broader candidate list, but only promote rows that are:
   - scholarly journal articles,
   - relevant to the task research question,
   - in or near the approved business-school journal universe,
   - DOI-verifiable through Crossref.
4. Replace `no_match` seed titles with exact paper titles from WoS/Crossref search.
5. Re-run:

```bash
npm run benchmark:verify-gold
```

After enough DOI labels are verified, run the 20 tasks through the deployed Worker and record:

```text
benchmark/proposed_agent_results.csv
benchmark/baseline_results.csv
```
