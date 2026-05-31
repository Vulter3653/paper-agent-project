# Benchmark Standard v2: Automated Evaluation Protocol for Traceable Scholarly Discovery

## 1. Purpose

This benchmark evaluates whether the Paper Agent can perform scholarly paper discovery in a traceable, verifiable, and reproducible manner. The benchmark does not rely on human evaluation. It combines deterministic metadata verification, gold DOI matching, ranking metrics, system-level robustness metrics, and fixed LLM-as-a-judge scoring.

이 벤치마크는 Paper Agent가 학술논문 탐색 task를 추적 가능하고 검증 가능하며 재현 가능한 방식으로 수행하는지를 평가한다. 사람 평가는 사용하지 않는다. 대신 DOI 및 메타데이터 검증, gold DOI matching, ranking metrics, 시스템 안정성 지표, 고정된 LLM-as-a-judge scoring을 결합한다.

## 2. Course Requirement Mapping

| Course requirement | Project implementation |
| --- | --- |
| Evaluation metric | Precision@5, NDCG@5, Recall@20, DOI exact match rate, hallucination rate, latency, cost proxy, LLM judge relevance score |
| Evaluation data | Self-built 20-task scholarly discovery dataset: T001-T020 |
| Evaluation scale | 20 tasks, each with up to 20 retrieved results |
| Baseline comparison | Rule-based search baseline and Single LLM recommendation baseline |
| Reproducibility | Frozen prompts, input files, model settings, output schema, run date, scripts |

## 3. Evaluation Data

The benchmark uses the following datasets:
- `benchmark/tasks.jsonl`: 20 structured scholarly discovery tasks.
- `benchmark/gold_relevant_papers.csv`: DOI-based gold relevance set.
- `benchmark/baseline_rule_based_results.csv`: Rule-based baseline outputs.
- `benchmark/baseline_single_llm_results.csv`: Single LLM baseline outputs.
- `benchmark/proposed_agent_results.csv`: Multi-agent system outputs.
- `benchmark/runs/*/proposed_agent_results.csv`: Isolated staged execution artifacts.

Data Characteristics:
- Self-built dataset consisting of 20 tasks (T001-T020).
- Covers various sub-domains of business and management (HR, Marketing, Strategy, Finance, etc.).
- Each task includes a specific research question, keyword, target journal category, and evaluation focus.
- Gold standard is based on audited DOI values.
- Artifact rows are treated as artifact-only evidence until promoted through the v2 validation protocol.

## 4. Evaluation Scale

The benchmark is fixed at 20 tasks (T001-T020). Each method (Rule-based, Single LLM, Proposed Agent) retrieves up to 20 results per task, resulting in a comparison pool of up to 1,200 total paper-level rows.

## 5. Compared Systems

### 5.1 Rule-based baseline
- **Method**: Direct keyword search through scholarly APIs (WoS/OpenAlex).
- **Ranking**: Simple ranking by citation count or publication date.
- **Limitations**: No agent reasoning, no semantic analysis, no DOI verification.

### 5.2 Single LLM baseline
- **Method**: One-shot paper recommendation prompt to a frontier LLM.
- **Ranking**: Natural language output order.
- **Risks**: High hallucination risk, fabricated DOIs, no independent verification.

### 5.3 Proposed Paper Agent
- **Method**: 12-stage multi-agent pipeline with specialized agents (Planner, Selector, Retriever, Verifier, OA, Critic, Report).
- **Verification**: Independent Crossref/Unpaywall lookup.
- **Transparency**: Detailed trace logs and component-level scoring.

## 6. Automated Metrics

### 6.1 Retrieval and Ranking Metrics (Deterministic)
- **Precision@5**: Proportion of retrieved papers that match the gold DOI set in the top 5.
- **NDCG@5**: Normalized Discounted Cumulative Gain, evaluating the quality of ranking.
- **Recall@20**: Proportion of the gold set successfully retrieved within 20 results.
- **Gold Hit Rate**: Percentage of tasks where at least one gold paper was retrieved.
- **MRR (Mean Reciprocal Rank)**: The average of the reciprocal ranks of the first relevant paper.

### 6.2 Scholarly Validity Metrics (Deterministic)
- **DOI Exact Match Rate**: Percentage of DOIs verified as existing and correct by external APIs.
- **Paper Existence Rate**: Percentage of results where metadata matches a real scholarly record.
- **Journal Policy Compliance Rate**: Percentage of papers correctly filtered by the approved journal list.
- **Top Journal Precision**: Precision restricted to S and A1 tier journals.

### 6.3 Hallucination and Integrity Metrics (Deterministic)
- **Nonexistent Paper Rate**: Rate of papers that cannot be found in any scholarly database.
- **Invalid DOI Rate**: Rate of results with malformed or fake DOI strings.
- **Metadata Mismatch Rate**: Discrepancy rate between LLM-reported and verified metadata.

### 6.4 System Robustness Metrics
- **Task Completion Rate**: Percentage of tasks that finished without runner crash.
- **Timeout Rate**: Percentage of jobs reaching infrastructure time limits.
- **Average Latency**: Time elapsed per discovery task.

### 6.5 Automated LLM Judge Metrics (Qualitative Proxy)
- **LLM Relevance Score**: 1-5 score based on the research question and candidate abstract.
- **Construct Coverage Score**: Matches between task constructs and paper findings.
- **Context/Method Match**: Alignment with the requested level of analysis or domain.

*Note: LLM judge metrics are treated as lower-level evidence compared to deterministic DOI matching.*

## 7. Automated LLM-as-a-Judge Protocol

To ensure objectivity without human evaluation:
- **Fixed Prompt**: Use `benchmark/llm_judge_prompt_v2.md`.
- **Model**: Fixed model identifier (e.g., Llama-3-8B-Instruct or GPT-4o).
- **Temperature**: Strictly 0.0.
- **Output**: JSON-only format for automated parsing.
- **Logs**: All judge outputs must be saved with full reasoning strings.

Judge Rubric (1-5):
- 5: Directly answers research question; matches constructs and domain.
- 4: Strongly relevant; minor scope or depth difference.
- 3: Partially relevant; broad theory overlap but no direct answer.
- 2: Weak relevance; keyword overlap only.
- 1: Irrelevant, invalid, or nonexistent.

## 8. Gold DOI and Relevance Label Structure

Labels for v2:
- `core_gold`: Must-retrieve papers identified by research focus.
- `acceptable_gold`: Relevant papers within the approved journal pool.
- `foundational_exception`: Essential papers that might fall outside the specific year/journal filter (documented exceptions).
- `near_miss`: Papers that match keywords but miss evaluation focus (distractor set).

## 9. Task Taxonomy

Tasks are classified in `benchmark/task_taxonomy_template.csv` by:
- Topic domain (HR, Finance, etc.)
- Difficulty (Topic specificity, ambiguity)
- recency requirements
- interdisciplinary level

## 10. Baseline Freezing Protocol

All compared systems must be run under a frozen configuration:
- Same input task file (`tasks.jsonl`).
- Frozen prompt strings for Single LLM and Proposed Agent.
- Recorded model versions and parameters (Temperature, Max Results).
- Fixed search providers and journal category IDs.

## 11. Reproducibility Protocol

- All input files, prompts, and output schemas must be committed to the repository.
- Results must include a unique `run_id` and timestamp.
- Evaluation scripts must be runnable via `npm run benchmark:*` commands.
- Deterministic paths must be separated from stochastic ones.

## 12. Artifact-to-Validation Promotion Rules

Artifact evidence (T004-T020) is promoted to "Validated Benchmark" only if:
1. Artifacts are normalized to the v2 schema.
2. DOI existence is verified by a scripted external source.
3. Metadata consistency is automatically checked.
4. Gold DOI matching is performed by the comparison script.
5. LLM-as-a-judge scores are generated using the v2 protocol.
6. Final metrics are recomputed and committed.

## 13. Pass / Fail and Claim Rules

- Claims of superiority must be tied to specific automated metrics.
- Overclaims (e.g., "Full validation complete" for artifact-only data) are forbidden.
- If a baseline outperforms the Proposed Agent on ranking metrics, the discrepancy must be reported.
- Trustworthiness claims must be supported by DOI accuracy and Hallucination rate data.

## 14. Implementation Roadmap

1. [v] Design automated v2 protocol (Current).
2. [ ] Implement deterministic metric computation script.
3. [ ] Normalize Batch 1-3 artifact rows.
4. [ ] Execute automated LLM-as-a-judge scoring.
5. [ ] Update claim boundaries with expanded validated metrics.
