# Experiments

The Benchmark v3 experiment set contains T001--T020 tasks. The evaluation distinguishes common-support comparison from artifact-level validation.

## T001--T003 Common-Support Comparison

T001--T003 are the only tasks with the support needed for controlled baseline comparison among Rule-Based, Single LLM, and Paper Agent methods. Proposed Agent metrics in this layer are Precision@5 = 0.1333, NDCG@5 = 0.3579, and Recall@20 = 0.5000.

## T004--T020 Artifact-Level Validation

T004--T020 are artifact-level validation tasks. They must not be interpreted as a parity-controlled comparative benchmark. T007 is explicitly marked `proposed_agent_missing` in the Baseline Support Matrix.

## Semantic Audit

Layer 5A submitted 125 judge inputs and obtained 22 successful evaluated rows. The evaluated subset has 17.6% coverage and contains no Proposed Agent rows. Layer 5B deterministically generated supplementary proxy metrics for all 125 rows. This design records useful implementation evidence without converting incomplete semantic coverage into a performance claim.
