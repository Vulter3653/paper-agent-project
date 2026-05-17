# Paper-Agent-Bench Summary

Updated: 2026-05-17

## Status

The first benchmark fixture layer is now initialized from `paper_agent_enhanced_report.md`.

Current files:

- `benchmark/tasks.jsonl`: 20 benchmark tasks covering organization/HR, marketing, strategy, accounting/finance, operations, and information systems.
- `benchmark/keywords.csv`: compatibility keyword list expanded from 3 to 20 queries.
- `benchmark/gold_relevant_papers.csv`: 60 seed gold relevance rows, 3 per task.
- `benchmark/gold_relevant_papers.verified.csv`: first Crossref title-query verification pass.
- `benchmark/gold_refinement_queue.csv`: non-verified seed rows that need exact-title replacement or manual review.
- `benchmark/gold_crossref_candidates.csv`: Crossref candidate pool generated from task-level queries.
- `benchmark/gold_candidate_review.csv`: scored candidate review file with allowlist, field, type, DOI, and priority labels.
- `benchmark/evaluation_rubric.md`: human scoring, core metrics, and agent-level checks.
- `benchmark/scripts/verify-gold-crossref.mjs`: local Crossref verification utility.
- `benchmark/scripts/refine-gold-candidates.mjs`: local refinement queue and candidate generation utility.
- `benchmark/scripts/score-gold-candidates.mjs`: local candidate scoring utility based on journal allowlist, field match, type, DOI, recency, and Crossref score.

## Important Constraint

The seed gold rows intentionally do not fabricate DOI values. Each DOI field is blank and marked with:

```text
doi_label_status=needs_crossref_verification
```

The first Crossref title-query pass has been run. It produced:

| Status | Count | Meaning |
| --- | ---: | --- |
| `verified` | 6 | Title match exceeded the automatic verification threshold. |
| `ambiguous` | 17 | Crossref returned a possible DOI, but the title match is not strong enough for final gold use. |
| `no_match` | 37 | No acceptable Crossref title candidate was found. |

This confirms that the seed labels are useful as benchmark topics, but not yet strong enough as final DOI gold labels. Before computing final DOI Accuracy, the ambiguous and no-match rows need manual title refinement or replacement with exact known papers.

## Gold Refinement Queue

The first refinement queue has been generated:

| File | Rows | Purpose |
| --- | ---: | --- |
| `benchmark/gold_refinement_queue.csv` | 54 | Non-verified gold rows requiring exact-title replacement or manual review. |
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
