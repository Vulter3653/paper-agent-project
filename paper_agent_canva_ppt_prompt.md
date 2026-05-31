# Canva 입력용 PPT 초안 프롬프트

## 목적
이 문서는 Canva에 입력하여 추후 PPT 초안을 생성하기 위한 프롬프트 기록본이다.

## 사용 방식
1. Canva에서 프레젠테이션 생성 기능을 연다.
2. 아래 `Canva 입력 프롬프트` 전체를 복사하여 입력한다.
3. 생성된 초안은 이후 benchmark 결과, dashboard 상태, claim boundary에 맞춰 수동 보정한다.
4. 특히 T004~T020 benchmark 확장 전에는 “full 20-task validation 완료”라고 표현하지 않는다.

## Canva 입력 프롬프트

```text
monaiteamproject-07360303:~/monaiteamproject{main}$ npx wrangler d1 execute paper_agent_db --remote --file=benchmark/runs/2026-05-30-controlled-t001-t003/insert_run.sql

 ⛅️ wrangler 4.86.0 (update available 4.95.0)
─────────────────────────────────────────────
Resource location: remote 

✔ ⚠️ This process may take some time, during which your D1 database will be unavailable to serve queries.
  Ok to proceed? … yes
🌀 Executing on remote database paper_agent_db (4d622431-3574-4e04-a359-dada93e97438):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
Note: if the execution fails to complete, your DB will return to its original state and you can safely retry.
🌀 File already uploaded. Processing.
🌀 Starting import...
🌀 Processed 13 queries.
🚣 Executed 13 queries in 2.35ms (0 rows read, 38 rows written)
   Database is currently at bookmark 000000f9-0000000e-0000507c-018ae574bc31b577c2c7f515d117b219.
┌────────────────────────┬───────────┬──────────────┬────────────────────┐
│ Total queries executed │ Rows read │ Rows written │ Database size (MB) │
├────────────────────────┼───────────┼──────────────┼────────────────────┤
│ 13                     │ 0         │ 38           │ 8.50               │
└────────────────────────┴───────────┴──────────────┴────────────────────┘
monaiteamproject-07360303:~/monaiteamproject{main}$ npx wrangler d1 execute paper_agent_db --remote --command "SELECT id, run_label, benchmark_scope, task_range, status, source_commit, gold_version, created_at FROM benchmark_runs WHERE id = '2026-05-30-controlled-t001-t003';"

 ⛅️ wrangler 4.86.0 (update available 4.95.0)
─────────────────────────────────────────────
Resource location: remote 

🌀 Executing on remote database paper_agent_db (4d622431-3574-4e04-a359-dada93e97438):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 command in 0.26ms
┌─────────────────────────────────┬────────────────────────────────────────┬─────────────────┬────────────────┬───────────┬──────────────────────────────────────────┬──────────────┬──────────────────────────┐
│ id                              │ run_label                              │ benchmark_scope │ task_range     │ status    │ source_commit                            │ gold_version │ created_at               │
├─────────────────────────────────┼────────────────────────────────────────┼─────────────────┼────────────────┼───────────┼──────────────────────────────────────────┼──────────────┼──────────────────────────┤
│ 2026-05-30-controlled-t001-t003 │ Independent Benchmark Run - controlled │ controlled      │ T001,T002,T003 │ completed │ f36a9c25b72bc7a6a58bd3d02bb69cf1bedce2fd │ verified     │ 2026-05-30T19:43:23.149Z │
└─────────────────────────────────┴────────────────────────────────────────┴─────────────────┴────────────────┴───────────┴──────────────────────────────────────────┴──────────────┴──────────────────────────┘
monaiteamproject-07360303:~/monaiteamproject{main}$ npx wrangler d1 execute paper_agent_db --remote --command "SELECT method, task_id, precision_at_5, ndcg_at_5, gold_doi_hit_rate_at_5 FROM benchmark_run_metrics WHERE run_id = '2026-05-30-controlled-t001-t003' ORDER BY method, task_id;"

 ⛅️ wrangler 4.86.0 (update available 4.95.0)
─────────────────────────────────────────────
Resource location: remote 

🌀 Executing on remote database paper_agent_db (4d622431-3574-4e04-a359-dada93e97438):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 command in 0.23ms
┌────────────────┬─────────┬────────────────┬───────────┬────────────────────────┐
│ method         │ task_id │ precision_at_5 │ ndcg_at_5 │ gold_doi_hit_rate_at_5 │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ proposed_agent │ T001    │ 0.2            │ 0.6463    │ 0.3333                 │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ proposed_agent │ T002    │ 0              │ 0         │ 0                      │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ proposed_agent │ T003    │ 0.2            │ 0.4275    │ 0.25                   │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ rule_based     │ T001    │ 0.2            │ 0.6463    │ 0.3333                 │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ rule_based     │ T002    │ 0              │ 0         │ 0                      │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ rule_based     │ T003    │ 0.2            │ 0.4275    │ 0.25                   │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ single_llm     │ T001    │ 0.6            │ 1         │ 1                      │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ single_llm     │ T002    │ 0.6            │ 1         │ 1                      │
├────────────────┼─────────┼────────────────┼───────────┼────────────────────────┤
│ single_llm     │ T003    │ 0.8            │ 0.9847    │ 1                      │
└────────────────┴─────────┴────────────────┴───────────┴────────────────────────┘
monaiteamproject-07360303:~/monaiteamproject{main}$
```

---

## Benchmark v3 업데이트 Canva 입력 프롬프트

### 업데이트 목적

이 섹션은 기존 Phase 3J / Phase 3L / controlled T001–T003 중심 PPT 초안을 최신 Benchmark v3 상태에 맞게 갱신하기 위한 Canva 입력용 프롬프트이다.

기존 내용은 과거 실행 로그와 controlled benchmark 기록으로 보존하되, 최종 발표자료 생성 시에는 아래 Benchmark v3 프롬프트를 우선 사용한다.

### Canva 입력 프롬프트 v3

```text
Create an 8-minute academic presentation for a university AI Agent final project.

Presentation title:
Paper Agent: A Reproducible AI Agent Benchmark with Explicit Claim Boundaries

Project summary:
This project presents Paper Agent, an AI Agent-based literature discovery and evaluation system. The system uses a multi-agent, RAG, and tool-augmented workflow to retrieve papers, validate metadata, check DOI records, integrate open-access information, and report traceable artifacts through a dashboard.

The main contribution is not a claim that the system fully outperforms all baselines. Instead, the project contributes a reproducible automated benchmark framework with explicit claim boundaries.

Core benchmark status:
- Benchmark version: Benchmark v3
- Evaluation framework: 6 layers, 30 metrics
- Overall readiness: PASS WITH CLAIM BOUNDARIES
- Layers 1–4: computed
- Layer 6: computed
- Layer 5A: quota-limited partial implementation audit
- Layer 5A coverage: 22/125 = 17.6%
- Layer 5A successful Proposed Agent rows: 0
- Proposed Agent Layer 5 score: not_available_in_subset
- Layer 5B: deterministic semantic proxy for 125 rows
- Layer 5B is supplementary and does not replace LLM or human semantic evaluation
- Baseline comparison: limited to T001–T003 common-support subset
- T004–T020: artifact-level validation
- T007: proposed_agent_missing
- Full T001–T020 comparative superiority is not supported
- Full semantic-quality validation is not supported

Create approximately 10–12 slides.

Slide 1. Title
- Paper Agent
- Reproducible AI Agent Benchmark
- PASS WITH CLAIM BOUNDARIES
Speaker note:
Introduce the project as an AI Agent system for scholarly discovery and evaluation. Emphasize that the main contribution is responsible evaluation, not overclaimed superiority.

Slide 2. Problem
- Literature review agents can hallucinate
- Metadata and DOI errors reduce trust
- AI Agent outputs require reproducible evaluation
- Simple retrieval metrics are insufficient
Speaker note:
Explain why AI agents for academic paper search must be evaluated beyond whether they return plausible-looking papers.

Slide 3. System Overview
- Multi-Agent workflow
- RAG-based scholarly retrieval
- Tool Use / MCP-style external validation
- Crossref DOI validation
- Unpaywall open-access check
- Dashboard and artifact reporting
Speaker note:
Explain that Paper Agent is not a single prompt but a traceable pipeline with external tools and structured artifacts.

Slide 4. Paper Agent Pipeline
- Query planning
- Retrieval
- Metadata normalization
- DOI and journal validation
- Open-access checking
- Benchmark artifact generation
- Dashboard reporting
Speaker note:
Show the end-to-end process from user query to validated benchmark artifacts.

Slide 5. Benchmark v3 Design
- 20 tasks: T001–T020
- 6 evaluation layers
- 30 metrics
- Deterministic metrics plus semantic audit
- Reproducible scripts and artifacts
Speaker note:
Introduce Benchmark v3 as the core evaluation contribution.

Slide 6. Six Evaluation Layers
Layer 1: Foundation & Reproducibility
Layer 2: Schema & Metadata
Layer 3: Deterministic Validity
Layer 4: Retrieval Accuracy
Layer 5: Semantic Quality
Layer 6: Robustness & Risk
Speaker note:
Explain that each layer checks a different failure mode of the agent system.

Slide 7. Baseline Support Matrix
- T001–T003: controlled common-support comparison
- T004–T020: artifact-level validation
- T007: proposed_agent_missing
- Full T001–T020 superiority claim is not supported
Speaker note:
Emphasize that baseline comparison is intentionally limited to comparable tasks only.

Slide 8. Key Results
- Schema Normalization: 1.0000
- Metadata Completeness: 0.9854
- DOI Format Validity: 0.9678
- DOI Exact Match Rate: 0.6930
- Paper Existence Rate: 0.6930
- Top Journal Precision: 0.8129
Speaker note:
Present deterministic validation as the strongest evidence.

Slide 9. Retrieval Results for Common-Support Subset
- Scope: T001–T003 only
- Proposed Agent Precision@5: 0.1333
- NDCG@5: 0.3579
- Recall@20: 0.5000
- Claim boundary: no full 20-task comparative superiority
Speaker note:
Make clear that these retrieval metrics apply only to the controlled common-support subset.

Slide 10. Semantic Quality Boundary
- Layer 5A: quota-limited partial implementation audit
- Coverage: 22/125 = 17.6%
- Proposed Agent successful rows: 0
- Proposed Agent score: not_available_in_subset
- Layer 5B: deterministic supplementary proxy for 125 rows
- Layer 5B does not replace LLM or human semantic evaluation
Speaker note:
This slide must be honest. Do not claim full semantic validation.

Slide 11. Robustness and Risk
- Hallucination rate: 0.3070
- Timeout rate: 0.1111
- Latency per task: 204.60s
- External API dependency remains a material risk
Speaker note:
Explain that the benchmark is valuable because it exposes weaknesses instead of hiding them.

Slide 12. Final Status and Contribution
- Benchmark readiness: PASS WITH CLAIM BOUNDARIES
- Reproducible automated benchmark framework
- Explicit claim boundaries
- Artifact-level validation beyond comparable tasks
- Future work: full baseline parity, full semantic judge coverage, human evaluation
Speaker note:
Close with the message: We do not claim Paper Agent is fully superior across all tasks. We show how to evaluate AI Agent systems responsibly and reproducibly.

Design style:
- Academic and professional
- Clean dark or white background
- Use diagrams, tables, and badges
- Use clear warning badges for partial audit and claim boundaries
- Avoid exaggerated success visuals

Important forbidden phrases:
Do not use:
- Full validation complete
- Layer 5 validation complete
- Full semantic validation
- Proposed Agent semantic quality validated
- Proposed Agent outperforms baselines across T001–T020
- Complete benchmark validation
- Full semantic coverage achieved
- 18/20 success
- 90% validated

Use instead:
- PASS WITH CLAIM BOUNDARIES
- quota-limited partial implementation audit
- evaluated subset only
- partial common-support comparison
- artifact-level validation
- not full semantic coverage
- not available in evaluated subset
- deterministic supplementary proxy
- reproducible automated benchmark framework
- explicit claim boundaries
```
