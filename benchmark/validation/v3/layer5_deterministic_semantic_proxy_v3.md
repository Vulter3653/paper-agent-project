# Benchmark v3 Layer 5B Deterministic Semantic Proxy

## Boundary
- Layer 5B deterministic proxy supplements the quota-limited LLM judge audit. It does not replace LLM or human semantic evaluation and must not be reported as full semantic-quality validation.
- Caveat: Abstracts are not consistently available. candidate_notes are used when available and may contain scoring notes rather than abstracts.

## Method Summary
| Method | Rows | Query / Title | Query / Notes | Construct Proxy | Context Proxy | Evidence Fields |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| proposed_agent | 95 | 0.1882 | 0.0000 | 0.3009 | 0.1882 | 1.0000 |
| rule_based | 15 | 0.0636 | 0.0000 | 0.0857 | 0.0636 | 1.0000 |
| single_llm | 15 | 0.1249 | 0.0551 | 0.2967 | 0.1800 | 1.0000 |
