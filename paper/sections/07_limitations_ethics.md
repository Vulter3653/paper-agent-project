# Limitations and Ethics

Benchmark v3 has explicit limitations. Baseline parity is partial and restricted to T001--T003. Layer 5A is quota-limited: 22 of 125 rows were successfully evaluated, and none of those successful rows are Proposed Agent rows. The Proposed Agent Layer 5 score is therefore `not_available_in_subset`. Layer 5B deterministic proxies do not replace semantic evaluation by an LLM judge or human reviewers. Full semantic-quality validation is not supported, and full T001--T020 comparative superiority is not supported.

Material risks remain visible. The hallucination rate is 0.3070 and the timeout rate is 0.1111. Automated journal filtering can reproduce disciplinary gatekeeping. Metadata services can contain incomplete or conflicting records. Ranking systems can amplify citation hierarchies. Human scholarly review remains the final authority.

Future work should expand baseline parity, obtain full judge coverage through an approved API budget or human evaluation, strengthen timeout handling, and audit gold labels with human oversight.
