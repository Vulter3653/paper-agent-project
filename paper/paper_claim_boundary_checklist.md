# Paper Claim Boundary Checklist

Updated: 2026-05-31

## Allowed Claims

- Controlled T001-T003 benchmark verified.
- Quantitative baseline comparison is limited to controlled T001-T003 evidence with nine comparison rows.
- T004-T006 artifact-only dry-run executed through a gated wrapper and produced three job rows and 50 result rows.
- Phase 3L produced partial staged artifact-expansion evidence: T007 timed out and T008-T012 produced 87 result rows.
- T013-T018 and T019-T020 were not started after the Phase 3L Batch 1 timeout.
- Legacy T019-T020 resource-limit / HTTP 503 evidence remains visible.
- Full T004-T020 validation remains incomplete.
- D1 batch-aware persistence is not implemented.

## Forbidden Claims

- T004-T006 benchmark validated.
- T007-T020 validation completed.
- T004-T018 validation completed.
- T004-T020 benchmark completed.
- Full 20-task validation complete.
- Proposed Agent globally outperforms baseline.
- 18/20 success.
- 90% success.
- 90% validated.
- D1 batch-aware persistence completed.
- System superiority perfectly proven.

## Section-by-Section Risk Map

| Section | Primary risk | Required mitigation |
| --- | --- | --- |
| Abstract | compressing artifact evidence into a validation claim | state controlled scope and incomplete expansion |
| Introduction | product-style claims | frame as decision support, not autonomous scholarship |
| Method | inventing integrations | describe only WoS primary, OpenAlex fallback, Crossref, Unpaywall, D1, Workers, and implemented reporting |
| Benchmark Design | merging legacy artifacts with controlled metrics | isolate T001-T003 quantitative layer |
| Experiments | implying later batches ran | state T013-T020 were not started after timeout |
| Results | implying global outperform | report Single LLM overlap advantage explicitly |
| Limitations | hiding failure evidence | retain T007 timeout and legacy T019-T020 HTTP 503 evidence |
| Conclusion | overstating completion | state full T004-T020 validation remains incomplete |

## Final Grep Terms

```bash
rg -n "18/20 success|90% success|90% validated|full validation complete|T004-T020 benchmark completed|T004-T006 benchmark validated|T007-T020 validation completed|globally outperforms|D1 batch-aware persistence completed|완벽히 증명|전반적으로 우수함이 입증" paper docs presentation --glob '!node_modules'
```
