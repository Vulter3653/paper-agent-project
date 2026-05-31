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

The benchmark is fixed at 20 tasks (T001-T020). Each method (Rule-based, Single LLM, Proposed Agent) retrieves up to 20 results per task. The maximum comparison design is 3 methods × 20 tasks × up to 20 results, or up to 1,200 paper-level candidate rows. This is a design capacity, not a claim that all rows have already been validated.

이는 최대 비교 설계 규모를 의미하며, 모든 row가 이미 validation layer에 포함되었다는 주장이 아니다.

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

## 6. Automated Metrics (6-Layer Architecture)

The benchmark metrics are organized into 6 layers to provide comprehensive evaluation depth. Each layer contains 5 specific metrics, totaling 30 automated indicators.

### Layer 1: Foundation & Reproducibility (기반 및 재현성)
Ensures the system and the benchmark execution are traceable and reproducible.
- **Reproducibility Manifest Completeness**: Checks if `run_id`, prompts, and model params are recorded.
- **Baseline Parity Check**: Ensures all compared methods use the same task set and schema.
- **Claim Boundary Compliance**: Verifies that results distinguish between artifact and validated states.
- **Trace Completeness Rate**: Percentage of agent stages with successful execution logs.
- **Critic Flag Coverage**: Rate of papers analyzed by the rule-based or LLM Critic.

### Layer 2: Schema & Metadata (스키마 및 메타데이터)
Evaluates the structural integrity and data accuracy of the retrieved results.
- **Schema Normalization Rate**: Rate of successful conversion to the v2 benchmark schema.
- **Metadata Completeness Rate**: Rate of results with all required fields (DOI, Title, Journal, Year).
- **DOI Format Validity Rate**: Rate of results with syntactically valid DOI strings.
- **JSON Parsing Success Rate**: Rate of successful automated parsing of agent/judge outputs.
- **Metadata Mismatch Rate**: Discrepancy rate between reported and verified API metadata.

### Layer 3: Deterministic Validity (결정론적 타당성)
Verifies scholarly validity using external ground-truth sources (APIs).
- **DOI Exact Match Rate**: Percentage of DOIs verified as existing by external scholarly APIs.
- **Paper Existence Rate**: Rate of papers confirmed as real scholarly records.
- **Journal Policy Compliance Rate**: Rate of papers correctly matching the approved journal list.
- **Top Journal Precision**: Precision restricted to S and A1 tier journals.
- **OA Success Rate**: Rate of successful Open Access status/URL verification (Unpaywall).

### Layer 4: Retrieval Accuracy (탐색 정확도)
Measures quantitative retrieval performance against the audited Gold Set.
- **Precision@5**: Proportion of retrieved papers that match the gold DOI set in the top 5.
- **NDCG@5**: Normalized Discounted Cumulative Gain for ranking quality.
- **Recall@20**: Proportion of the gold set successfully retrieved within 20 results.
- **Gold Hit Rate**: Percentage of tasks where at least one gold paper was retrieved.
- **MRR (Mean Reciprocal Rank)**: Average reciprocal rank of the first relevant gold paper.

### Layer 5: Semantic Quality (의미적 품질 - LLM Judge)
Uses a fixed LLM-as-a-judge to evaluate semantic alignment.
- **LLM Relevance Score**: 1-5 semantic relevance score from the fixed v2 judge.
- **Construct Coverage Score**: Match rate between task constructs and paper findings.
- **Context/Method Match Score**: Alignment with requested domain or level of analysis.
- **LLM Judge Confidence Score**: Self-reported confidence of the automated judge.
- **LLM Judge Reasoning Validity**: Automated check for logical consistency in judge reasoning.

### Layer 6: Robustness & Risk (안정성 및 위험)
Evaluates system limits, errors, and negative behavioral risks.
- **Negative Distractor Rejection Rate**: Rate of correctly excluding/rejecting known distractors.
- **Hallucination Rate**: Rate of nonexistent or fabricated papers returned.
- **Timeout Rate**: Percentage of jobs reaching infrastructure time limits.
- **Latency per Task**: Average time elapsed per discovery task.
- **Cost Proxy**: Estimated resource/API cost per discovery task.

*Note: LLM-as-a-judge scores (Layer 5) are semantic relevance proxies. They support interpretation but do not override deterministic evidence (Layers 1-3) such as DOI existence or gold DOI matching.

LLM-as-a-judge 점수는 의미적 관련성의 보조 지표이며, DOI 존재 여부, 메타데이터 일치, gold DOI matching과 같은 결정론적 검증(Layer 1-3)보다 강한 증거로 사용하지 않는다.*

## 7. Automated LLM-as-a-Judge Protocol

To ensure objectivity without human evaluation:
- **Fixed Prompt**: Use `benchmark/llm_judge_prompt_v2.md`.
- **Model Identifier**: Must be fixed before execution. The final validation run must record the exact model name/version. Example model names may be listed only as candidates, not as completed configuration.
- **Temperature**: 0.0.
- **Top-p**: Fixed and recorded.
- **Seed**: Recorded if supported; if unsupported, this limitation must be documented.
- **Output**: JSON-only format for automated parsing.
- **Logs**: All judge outputs must be saved with full reasoning strings.

A protocol document does not imply that LLM judge scoring has already been applied. LLM judge scoring becomes evidence only after the fixed prompt, fixed model identifier, fixed parameters, and machine-readable judge outputs are committed.

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
- `negative_distractor`: A paper that may share surface keywords with the task but is clearly wrong for the research question, domain, level of analysis, or scholarly validity. Selecting it counts as an automated false-positive risk.

  `negative_distractor`는 표면적 키워드는 유사하지만 연구질문, 도메인, 분석 수준, 학술적 타당성과 명확히 어긋나는 논문이다. 이를 선택하면 자동 평가에서 false-positive risk로 간주된다.

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
2. [v] Benchmark Standard v3 Metric Specification (Implementation-ready).
3. [ ] Implement deterministic metric computation script.
4. [ ] Normalize Batch 1-3 artifact rows.
5. [ ] Execute automated LLM-as-a-judge scoring.
6. [ ] Update claim boundaries with expanded validated metrics.

Benchmark Standard v3 extends v2 by converting the 30-metric layered architecture into implementation-ready metric specifications. Each metric receives 10 specification fields for script implementation, dashboard mapping, and claim-boundary control.
