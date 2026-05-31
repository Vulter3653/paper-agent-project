# Paper Claim Boundary Checklist

## Accepted Reporting State

- Benchmark v3 readiness: **PASS WITH CLAIM BOUNDARIES**.
- Benchmark v3 includes six layers and 30 metrics.
- Layers 1--4 and Layer 6 are computed.
- Layer 5A is a quota-limited partial implementation audit: 22/125 rows, or 17.6%.
- The successful Layer 5A subset contains no Proposed Agent rows.
- Proposed Agent Layer 5 score: `not_available_in_subset`.
- Layer 5B deterministic semantic proxy covers 125 rows and is supplementary only.
- Baseline comparison is restricted to T001--T003 common support.
- T004--T020 remain artifact-level validation tasks.
- T007 is marked `proposed_agent_missing`.

## Allowed Claims

- Paper Agent provides a reproducible automated benchmark framework with explicit claim boundaries.
- Baseline comparison is a partial common-support comparison.
- Layer 5A is an evaluated-subset-only implementation audit.
- Layer 5B supplements, but does not replace, LLM or human semantic evaluation.
- The current evidence does not support full T001--T020 comparative superiority claims.
- The current evidence does not support full semantic-quality validation claims.

## Prohibited Interpretations

- Do not present partial baseline support as an all-task comparison.
- Do not present Layer 5A as representative semantic coverage.
- Do not assign a Proposed Agent Layer 5 score when it is unavailable in the evaluated subset.
- Do not present deterministic semantic proxies as semantic ground truth.
- Do not describe readiness without the claim-boundary qualifier.

## Section Risk Map

| Section | Primary risk | Required guardrail |
| --- | --- | --- |
| Abstract | compressing partial evidence into a broad claim | state readiness qualifier and Layer 5A limitation |
| Benchmark Design | treating all metrics as equally complete | separate Layer 5A and Layer 5B |
| Experiments | implying baseline parity across all tasks | limit comparison to T001--T003 |
| Results | interpreting proxies as semantic scores | label Layer 5B supplementary |
| Conclusion | claiming superiority | emphasize reproducible framework and boundaries |

## Final Search Terms

Before submission, search for unqualified readiness language, broad all-task superiority language, representative semantic-coverage language, and any statement that treats Layer 5B as a replacement for human or LLM evaluation.
