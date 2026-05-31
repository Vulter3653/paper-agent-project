# 5. Experiments

## 5.1 Controlled T001-T003 Comparison

The verified controlled layer compares Rule-Based, Single LLM, and Paper Agent baselines on T001-T003. It contains nine comparison rows. This is the only layer used for quantitative baseline claims in the current manuscript.

## 5.2 T004-T006 Artifact-Only Dry-Run

An explicitly approved gated wrapper executed T004-T006 as an artifact-only dry-run. T004 generated 20 rows, T005 generated 12 rows, and T006 generated 18 rows. The run produced three job rows and 50 result rows without failed jobs. These artifacts demonstrate execution coverage, not benchmark validation.

## 5.3 Phase 3L Partial Staged Expansion

Phase 3L produced partial staged expansion evidence. Batch 1 (T007-T012) generated artifacts for T008-T012, while T007 timed out after approximately 250 seconds. Because this failure occurred within Batch 1, later batches T013-T018 and T019-T020 were not started. This result identifies both executable segments and infrastructure boundaries, and it does not constitute full benchmark validation.

## 5.4 What Was Not Evaluated

The manuscript does not report a completed T004-T020 benchmark. It does not merge artifact-only evidence into controlled metrics. It does not claim that D1 batch-aware persistence is implemented. It also does not claim global superiority over the Single LLM baseline.

## 5.5 Artifact Isolation Strategy

Staged wrappers isolate outputs by run ID, expose plan and preflight modes, require explicit execute acknowledgement, and prevent overwriting controlled artifacts.
