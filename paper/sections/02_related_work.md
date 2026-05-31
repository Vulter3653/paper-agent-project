# 2. Related Work

## 2.1 LLM-Based Scholarly Search and Review Automation

LLM-based assistants can summarize papers, reformulate questions, and generate candidate reading lists. Their usefulness depends on grounding and metadata verification. Large scholarly corpora such as S2ORC show the scale and structure of the evidence that research-support systems must handle. Ungrounded recommendations are risky in scholarly settings because a fabricated title, DOI, venue, or author list can consume researcher time and contaminate a review. Paper Agent therefore separates recommendation from verification and stores evidence for downstream inspection. `\cite{lo2020s2orc}`

## 2.2 Multi-Agent and Tool-Using Systems

Multi-agent systems decompose complex tasks into role-specific components such as planners, executors, critics, and reporters. AutoGen demonstrates how multi-agent conversation can structure LLM application workflows. The value of decomposition is not the number of named agents alone; it is the ability to expose intermediate decisions and isolate failures. Paper Agent applies this principle to scholarly discovery by recording stage-level traces and preserving partial outcomes when a later service fails. `\cite{wu2023autogen}`

## 2.3 Retrieval-Augmented Workflows

Retrieval-augmented generation (RAG) grounds model behavior in external evidence. Paper Agent follows the same grounding principle but emphasizes structured scholarly metadata and policy enforcement. Search results are filtered through an internal business-school journal allowlist and enriched through external metadata services before ranking. `\cite{lewis2020rag}`

## 2.4 Benchmarking and Reproducibility

Evaluation of agentic systems requires more than a single aggregate score. AgentBench provides an example of evaluating LLMs as agents across multiple environments and highlights the importance of explicit evaluation design. Reproducible evaluation should disclose task scope, baselines, metrics, failure evidence, artifact locations, and incomplete runs. Paper Agent explicitly distinguishes controlled benchmark evidence from artifact-only expansion evidence. `\cite{liu2023agentbench}`
