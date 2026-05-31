# 2. Related Work

## 2.1 LLM-Based Scholarly Search and Review Automation

LLM-based assistants can summarize papers, reformulate questions, and generate candidate reading lists. Their usefulness depends on grounding and metadata verification. Ungrounded recommendations are risky in scholarly settings because a fabricated title, DOI, venue, or author list can consume researcher time and contaminate a review. Paper Agent therefore separates recommendation from verification and stores evidence for downstream inspection. <!-- TODO: replace placeholder with verified references. --> `\cite{placeholder_scholarly_search}`

## 2.2 Multi-Agent and Tool-Using Systems

Multi-agent systems decompose complex tasks into role-specific components such as planners, executors, critics, and reporters. The value of decomposition is not the number of named agents alone; it is the ability to expose intermediate decisions and isolate failures. Paper Agent applies this principle to scholarly discovery by recording stage-level traces and preserving partial outcomes when a later service fails. <!-- TODO: replace placeholder with verified references. --> `\cite{placeholder_multi_agent}`

## 2.3 Retrieval-Augmented Workflows

Retrieval-augmented generation (RAG) grounds model behavior in external evidence. Paper Agent follows the same grounding principle but emphasizes structured scholarly metadata and policy enforcement. Search results are filtered through an internal business-school journal allowlist and enriched through external metadata services before ranking. <!-- TODO: replace placeholder with verified references. --> `\cite{placeholder_rag}`

## 2.4 Benchmarking and Reproducibility

Evaluation of agentic systems requires more than a single aggregate score. Reproducible evaluation should disclose task scope, baselines, metrics, failure evidence, artifact locations, and incomplete runs. Paper Agent explicitly distinguishes controlled benchmark evidence from artifact-only expansion evidence. <!-- TODO: replace placeholder with verified references. --> `\cite{placeholder_reproducibility}`
