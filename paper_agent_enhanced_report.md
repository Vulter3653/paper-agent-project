**AI Agent 기반 학술논문 탐색 및 문헌검토 자동화 시스템**

**보강 통합 보고서: Multi-Agent, MCP, 평가 벤치마크, 구현 로드맵**

1번 파일 보강본 / 1번 링크 구현 현황 반영 / 2번 링크 MCP 후보 선별 / 3번
링크 평가 방식 참고

| **구분**        | **내용**                                                                       |
|-----------------|--------------------------------------------------------------------------------|
| 프로젝트명      | Paper Agent Project - Top-Journal-Aware Literature Review Assistant            |
| 기준 문서       | 1번 파일: AI_Agent_프로젝트_전체_통합본.pdf                                    |
| 구현 저장소     | 1번 링크: https://github.com/Vulter3653/paper-agent-project                    |
| MCP 후보 저장소 | 2번 링크: https://github.com/punkpeye/awesome-mcp-servers/tree/main            |
| 벤치마크 참고   | 3번 링크: https://github.com/uiuc-kang-lab/REPRO-Bench                         |
| 작성 기준일     | 2026-05-16                                                                     |
| 작성 목적       | 기말 팀 프로젝트 제출·발표·라이브 데모 준비를 위한 보강 설계 및 실행 계획 정리 |

본 문서는 기존 1번 파일의 설계 내용을 유지하되, 이후 피드백에서 논의된
저장소 현황, 교수자 평가 기준, 멀티 에이전트 부착 방식, REPRO-Bench식
평가 체계, MCP 선별 기준, 향후 구현 우선순위를 통합하여 보강한 제출용
보고서이다.

# 목차

1\. 보강 결론 및 프로젝트 재정의

2\. 교수자 평가 기준 대비 현재 적합성 분석

3\. 1번 링크 기준 현재 구현 현황

4\. 완료된 작업과 확인된 기능

5\. 진행해야 하는 작업과 우선순위

6\. 전체 작업 흐름 및 시스템 워크플로우

7\. Multi-Agent 부착 설계안

8\. REPRO-Bench식 Agent별 평가 설계

9\. 2번 링크 기반 MCP 후보 선별 및 적용 계획

10\. 데이터베이스·저장소·산출물 보강안

11\. 제출물 완성 로드맵

12\. 리스크, 한계, 윤리 및 보안 관리

13\. 발표 및 라이브 데모 구성안

Appendix A. 참고 자료 및 반영 근거

Appendix B. 즉시 실행 체크리스트

# 1. 보강 결론 및 프로젝트 재정의

기존 1번 파일의 핵심 프로젝트 정의는 유지한다. 본 프로젝트는 사용자가
연구 키워드 또는 연구 질문을 입력하면, AI Agent가 관련 학술논문을
탐색하고 DOI, 저널명, 연도, 저자 정보를 검증하며, 저널 품질과 초록
관련성을 평가한 뒤 최종적으로 PDF 보고서와 Excel 정리 파일을 생성하는
시스템이다.

이번 보강의 핵심은 세 가지이다. 첫째, 현재 1번 링크의 구현 상태를
기준으로 이미 완료된 기능과 미완성 기능을 분리한다. 둘째, 단순
pipeline을 명시적 Multi-Agent 구조로 전환하여 수업 평가 요건을 더 강하게
충족한다. 셋째, 3번 링크의 REPRO-Bench처럼 최종 결과뿐 아니라 각 Agent의
중간 산출물까지 평가할 수 있는 벤치마크를 설계한다.

| **보강 전 핵심**                               | **보강 후 핵심**                                                      |
|------------------------------------------------|-----------------------------------------------------------------------|
| Top-Journal-Aware Literature Review Agent 설계 | 구현 현황과 연결된 제출용 실행 계획으로 전환                          |
| Multi-Agent, RAG, MCP, Tool Use 개념 제시      | Planner-Retriever-Verifier-Ranker-Critic-Report Agent의 구체적 모듈화 |
| 평가 지표와 baseline 방향 제시                 | Agent별 metric, 20개 task, baseline 비교, benchmark 결과표 구조 제시  |
| PDF/Excel 산출물 목표                          | 현재 CSV/Markdown 완료 상태를 인정하고 XLSX/PDF 순차 구현 계획 제시   |
| MCP 권한 구조 제안                             | 2번 링크 기반 MCP 후보를 필수·권장·보류·금지로 선별                   |

따라서 본 프로젝트는 “많은 논문을 보여주는 검색기”가 아니라 “검증 가능한
top-tier 문헌검토 보조 Agent”로 정의되어야 한다. 평가와 발표에서는
양보다 신뢰도, 환각 억제, DOI 검증, 저널 품질, 재현 가능한 workflow를
강조해야 한다.

# 2. 교수자 평가 기준 대비 현재 적합성 분석

기말 팀 프로젝트 평가 기준은 문제 정의, Agent 설계 정당성, baseline
비교, 한계와 윤리, 재현 가능성, 평가 벤치마크, 산출물 완성도로 요약된다.
현재 프로젝트는 문제 정의, Tool Use, MCP, 구현 재현성은 강하지만,
benchmark 실행 결과, baseline 비교, Critic/Self-Correction, PDF/Excel
산출물은 보강이 필요하다.

| **평가 항목**       | **현재 수준** | **판단**                                                            | **보강 방향**                                                                       |
|---------------------|---------------|---------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| 문제 정의의 구체성  | 상            | 대학원생·연구자 대상 문헌검토 자동화 문제로 명확함                  | 기존 방식의 한계: 검색 비용, DOI 오류, 환각, 저널 품질 판단 부담을 발표 전면에 배치 |
| Agent 설계의 정당성 | 중상          | Tool Use와 MCP는 강함. Multi-Agent는 역할 기반 pipeline 수준        | Worker 내부 pipeline을 Agent module과 Orchestrator로 분리                           |
| Baseline 비교       | 중하          | 문서상 설계는 있으나 실제 결과표 부족                               | Rule-based baseline, Single LLM baseline, Proposed Agent 결과 비교표 작성           |
| 한계와 윤리         | 상            | paywall 우회 금지, credential 보호, 최소 권한 MCP 원칙이 문서화됨   | journal metric bias, OA 제한, hallucination risk를 Limitations에 명시               |
| 재현 가능성         | 중상          | README, .env.example, progress, debug-log, schema, MCP scripts 존재 | prompts.md, used_papers.md, benchmark results 보강                                  |
| 평가 벤치마크       | 중            | Precision@5 등 지표는 있으나 task 수 부족                           | 20개 keyword/task, gold paper set, human eval rubric 확장                           |
| 산출물              | 중            | CSV/Markdown은 구현, PDF/XLSX는 미구현                              | XLSX 먼저, PDF 이후 구현                                                            |

최종 제출에서 높은 평가를 받으려면 기능 추가보다 “평가 실험”과
“증거화”가 중요하다. 즉, Agent가 단일 LLM 또는 단순 검색 대비 더
정확하고 신뢰도 높은 결과를 제공한다는 표와 사례가 필요하다.

# 3. 1번 링크 기준 현재 구현 현황

현재 1번 링크는 단순 아이디어 저장소가 아니라 Cloudflare Pages,
Cloudflare Workers, D1, R2, Remote MCP, shared package를 포함한 monorepo
형태로 구성되어 있다. README 기준 구조는 apps/web, apps/worker,
apps/mcp, packages/shared, docs, benchmark로 구성된다.

| **영역**  | **현재 구성**                                       | **상태**   | **비고**                                                                              |
|-----------|-----------------------------------------------------|------------|---------------------------------------------------------------------------------------|
| Frontend  | apps/web - React/Vite dashboard                     | 구현       | 키워드 입력, Run, 상태 지표, Ranked Papers, Paper Detail, Recent Jobs, Report Preview |
| Backend   | apps/worker - Cloudflare Workers API                | 구현       | 검색 job 생성, WoS/OpenAlex 검색, Crossref, Unpaywall, D1/R2 저장                     |
| MCP       | apps/mcp - Remote MCP Worker                        | 1단계 구현 | read-only D1/R2 inspection tools 구현                                                 |
| Shared    | packages/shared                                     | 구현       | 공통 타입, 점수 가중치, 경영대학 저널 allowlist/category                              |
| Docs      | docs/workflow.md, mcp.md, progress.md, debug-log.md | 구현       | 구현 현황·MCP·디버깅·handoff 문서화                                                   |
| Benchmark | benchmark/keywords.csv                              | 초기       | 현재 3개 keyword 수준. 20개 이상으로 확장 필요                                        |

현재 Worker는 /api/health, /api/diagnostics, /api/search-jobs,
/api/search-jobs/:id, /papers.csv, /report.md endpoint를 제공한다. 검색
job은 즉시 생성되고, 실제 검색과 검증은 비동기로 수행되며 D1에 진행
상태와 결과가 저장된다.

현재 핵심 실행 흐름

POST /api/search-jobs

-\> create search job in D1

-\> search Web of Science or OpenAlex

-\> filter business-school journal allowlist

-\> enrich with Crossref

-\> check OA with Unpaywall

-\> rank papers

-\> save papers/evaluations in D1

-\> persist CSV/Markdown in R2

# 4. 완료된 작업과 확인된 기능

다음 기능은 현재 완료 또는 실사용 가능한 MVP 기능으로 분류한다. 단, 일부
기능은 local verification 또는 deployment verification 상태가 섞여
있으므로 최종 발표 전 production dashboard에서 다시 확인해야 한다.

| **분류**       | **완료된 작업**                                                                        | **평가상 의미**                    |
|----------------|----------------------------------------------------------------------------------------|------------------------------------|
| Monorepo       | root npm workspace, apps/web, apps/worker, apps/mcp, packages/shared 구성              | 팀 협업과 재현 가능성 확보         |
| Dashboard      | 검색 입력, Max/From/To, Field selector, pipeline progress, diagnostics, report preview | 라이브 데모 가능                   |
| Search         | WoS 기본 provider, OpenAlex fallback, keyword expansion, source-title priority search  | Tool Use와 RAG적 검색 구조 증명    |
| Journal Filter | 경영대학 저널 목록 기반 allowlist, field/rank 표시                                     | Top-Journal-Aware 차별화 구현      |
| Verification   | Crossref DOI/title/year/journal 검증                                                   | 환각과 잘못된 논문 추천 억제       |
| OA Check       | Unpaywall OA/PDF/landing/license metadata 저장                                         | 합법적 PDF 접근 원칙 반영          |
| Ranking        | relevance, journal fit, verification, OA, citation, recency 기반 final score           | 정량적 추천 근거 제공              |
| Output         | CSV 및 Markdown report 생성, R2 저장                                                   | 중간 산출물 완성. PDF/XLSX 전 단계 |
| MCP            | read-only MCP tools와 smoke/e2e script                                                 | MCP/Tool Use 평가 요건 충족        |
| Docs           | workflow, mcp, progress, debug-log, changelog                                          | 프로젝트 재현성과 handoff 강화     |

# 5. 진행해야 하는 작업과 우선순위

남은 작업은 기능 개발, 평가 실험, 제출 산출물 세 범주로 나누어야 한다.
기말 프로젝트 평가를 고려하면 “benchmark와 baseline 비교”가 최우선이며,
그 다음이 Critic Agent, XLSX/PDF 산출물, 발표 자료 완성이다.

| **우선순위** | **작업**            | **구체 내용**                                                                        | **완료 기준**                                                                |
|--------------|---------------------|--------------------------------------------------------------------------------------|------------------------------------------------------------------------------|
| 1            | Benchmark 확장      | benchmark/keywords.csv를 20개 task로 확장, 각 task별 gold relevant papers 3-5개 지정 | 20개 task와 human eval rubric 확보                                           |
| 2            | Baseline 비교       | Rule-based search, Single LLM recommendation, Proposed Agent 결과 비교               | Precision@5, DOI Accuracy, Top Journal Precision, Hallucination Rate 표 작성 |
| 3            | Critic Agent 추가   | DOI 누락, Crossref 불일치, 낮은 relevance, journal mismatch, OA 과장 탐지            | critic_note, risk_level, flags 저장                                          |
| 4            | Agent trace 저장    | agent_traces table 추가, 각 Agent input/output summary 저장                          | workflow가 평가 가능하게 기록됨                                              |
| 5            | XLSX output         | GET /api/search-jobs/:id/papers.xlsx 추가, R2 저장, dashboard button 추가            | reports/\<job_id\>/papers.xlsx 생성                                          |
| 6            | PDF report          | Markdown/HTML 기반 report.pdf 생성, R2 저장                                          | reports/\<job_id\>/report.pdf 생성                                           |
| 7            | Vectorize relevance | keyword overlap에서 embedding similarity로 보강                                      | Relevance Agent 성능 비교 가능                                               |
| 8            | Drive upload        | Unpaywall-confirmed OA PDF만 Google Drive 저장                                       | drive_file_id, drive_web_url 저장                                            |
| 9            | Prompt 문서화       | Planner/Relevance/Critic/Report prompt 작성                                          | docs/prompts.md 완성                                                         |
| 10           | Paper/PPT 제출물    | 8-12쪽 논문, 8분 발표자료, 데모 스크립트                                             | 제출물 패키지 완성                                                           |

# 6. 전체 작업 흐름 및 시스템 워크플로우

최종 workflow는 사용자의 연구 질문 입력부터 논문 검색, 검증, 필터링,
평가, 보고서 생성, MCP를 통한 외부 조회까지 이어지는 end-to-end 구조로
제시한다. 현재 구현은 이 중 검색, 검증, 평가, CSV/Markdown 산출물
단계까지 상당 부분 구현되어 있다.

사용자 입력

-\> Cloudflare Pages Dashboard

-\> POST /api/search-jobs

-\> Orchestrator Agent

-\> Planner Agent

-\> Journal Selector Agent

-\> Retriever Agent

-\> Verifier Agent

-\> Open Access Agent

-\> Relevance Evaluation Agent

-\> Ranking Agent

-\> Critic Agent

-\> Report Agent

-\> Cloudflare D1 / R2 / Google Drive / Vectorize

-\> Dashboard report preview 및 파일 다운로드

-\> MCP client가 read-only tools로 job/result/report 상태 조회

| **단계**           | **현재 구현**                            | **보강 후 목표**                                      |
|--------------------|------------------------------------------|-------------------------------------------------------|
| 1\. 사용자 입력    | Dashboard keyword, max, year, field 입력 | 연구 질문 자동 구조화와 field 추천                    |
| 2\. 검색 job 생성  | D1 search_jobs 저장                      | agent_traces 시작 기록                                |
| 3\. 검색 질의 생성 | keyword variants 함수 존재               | Planner Agent 모듈화                                  |
| 4\. 저널군 선택    | business school category selector 존재   | Journal Selector Agent가 field/rank universe 확정     |
| 5\. 후보 검색      | WoS/OpenAlex 검색 구현                   | Retriever Agent 성능 평가                             |
| 6\. DOI 검증       | Crossref enrichment 구현                 | Verifier Agent 정확도 측정                            |
| 7\. OA 확인        | Unpaywall metadata 구현                  | OA Agent 및 Drive upload 추가                         |
| 8\. 관련성 평가    | keyword overlap                          | Vectorize embedding 및 LLM reason 보강                |
| 9\. Ranking        | weighted score 구현                      | NDCG@5/Precision@5로 평가                             |
| 10\. Critic        | 미구현                                   | risk flag, hallucination check, downgrade/review loop |
| 11\. Report        | CSV/Markdown                             | XLSX/PDF, critic note, agent trace 포함               |
| 12\. MCP           | read-only inspection                     | agent trace/critic reviews 조회 tool 추가             |

# 7. Multi-Agent 부착 설계안

현재 1번 링크는 기능상 Agent pipeline을 이미 수행하지만, 코드 구조상 각
Agent가 명시적으로 분리되어 있지는 않다. 따라서 가장 안전한 보강 방식은
기존 Worker pipeline을 유지하면서 Agent module과 Orchestrator를 추가하는
것이다.

권장 파일 구조

apps/worker/src/

index.ts

orchestrator/runSearchWorkflow.ts

agents/

plannerAgent.ts

journalSelectorAgent.ts

retrieverAgent.ts

verifierAgent.ts

openAccessAgent.ts

relevanceAgent.ts

rankingAgent.ts

criticAgent.ts

reportAgent.ts

tools/

wosTool.ts

openAlexTool.ts

crossrefTool.ts

unpaywallTool.ts

d1Tool.ts

r2Tool.ts

types/agent.ts

| **Agent**        | **역할**                                           | **현재 상태** | **보강 구현**                                   |
|------------------|----------------------------------------------------|---------------|-------------------------------------------------|
| Planner          | keyword, sub-question, field, year constraint 정리 | 부분          | buildKeywordVariants를 Agent로 분리             |
| Journal Selector | field별 journal universe 선택                      | 부분          | businessSchoolJournals category 기반 명시화     |
| Retriever        | WoS/OpenAlex 후보 검색                             | 구현          | searchWebOfScience/searchOpenAlex를 tool로 분리 |
| Verifier         | Crossref DOI/title/year/journal 검증               | 구현          | enrichPapersWithCrossref를 Agent 단계로 분리    |
| Open Access      | Unpaywall OA/PDF 확인                              | 구현          | Drive upload까지 확장                           |
| Relevance        | title/abstract-topic relevance 평가                | 부분          | Vectorize embedding 및 human label 기반 평가    |
| Ranking          | weighted score와 include/review/exclude 결정       | 구현          | 점수 산식 고정 및 benchmark로 검증              |
| Critic           | 오류·환각·부적합 결과 재검토                       | 미구현        | risk flags, critic_note, downgrade rule 추가    |
| Report           | CSV/Markdown/XLSX/PDF 생성                         | 부분          | XLSX/PDF와 agent trace 포함                     |
| MCP Interface    | 외부 Agent의 제한적 tool interface                 | 부분          | read-only 유지 후 trace/critic 조회 추가        |

발표에서는 “현재는 Agent 역할 기반 pipeline이며, 제출 전 Orchestrator와
Agent module로 리팩터링한다”고 설명하는 것이 정확하다. 완전히 별도
Worker를 여러 개 만드는 방식은 배포와 상태 관리가 복잡하므로 기말
프로젝트 단계에서는 권장하지 않는다.

# 8. REPRO-Bench식 Agent별 평가 설계

3번 링크의 REPRO-Bench는 각 task instance에 PDF, code, data, gold
annotation, reproduction report를 포함하고, 여러 agent를 같은 환경에서
평가하는 구조이다. 본 프로젝트는 이를 문헌검토 도메인에 맞춰 변환하여
“Paper-Agent-Bench”를 구성할 수 있다.

| **REPRO-Bench 요소**              | **Paper-Agent-Bench 변환**                                                                |
|-----------------------------------|-------------------------------------------------------------------------------------------|
| 논문 PDF + code + data            | 연구 키워드, field constraint, year range, API search 결과                                |
| Gold reproducibility score        | Gold relevant papers, DOI, journal field/rank, relevance label                            |
| AutoGPT/CORE-Agent/SWE-Agent 비교 | Rule-based search, Single LLM, Proposed Agent 비교                                        |
| Accuracy 중심 평가                | Precision@5, DOI Accuracy, Top Journal Precision, Hallucination Rate, Report Completeness |
| 공개 reproduction report          | benchmark_summary.md, results.csv, report artifacts                                       |

## 8.1 Agent별 평가 지표

| **Agent**        | **평가 지표**                                        | **데이터/정답**                   | **실패 유형**                     |
|------------------|------------------------------------------------------|-----------------------------------|-----------------------------------|
| Planner          | Query Coverage, Field Accuracy                       | 20개 keyword별 gold query/field   | 핵심 개념 누락, field 오분류      |
| Journal Selector | Field Classification Accuracy, Journal Set Precision | gold field, journal rank list     | 부적절한 분야/저널군 선택         |
| Retriever        | Recall@20, Candidate Validity Rate                   | gold relevant papers              | 관련 논문 누락, 중복, 비논문 결과 |
| Verifier         | DOI Accuracy, Metadata Match Accuracy                | gold DOI, Crossref metadata       | 잘못된 DOI, false verification    |
| OA Agent         | OA Status Accuracy, PDF URL Precision                | Unpaywall/manual check            | closed 논문을 OA로 오판           |
| Relevance        | Human Relevance Correlation, Binary Accuracy         | 1-5점 human label                 | 키워드만 맞고 실제 관련성 낮음    |
| Ranking          | Precision@5, NDCG@5, Verified@5                      | human relevance + verified labels | 낮은 관련 논문 상위 배치          |
| Critic           | Error Detection Precision/Recall                     | gold error labels                 | 오류 미탐지, 과도한 false alarm   |
| Report           | Completeness, Format Validity                        | 필수 항목 checklist               | DOI/score/reason 누락             |
| MCP              | Tool Correctness, Safety, E2E Consistency            | Worker API/D1/R2 대조             | 권한 과다, 결과 불일치            |

## 8.2 최소 평가 데이터셋

기말 프로젝트 기준에서는 20개 task를 권장한다. 각 task는 연구 keyword,
field, year range, max_results, gold relevant papers, human relevance
label을 포함한다. 각 task의 Top 5 결과를 평가하면 총 100개 추천 결과를
평가하게 된다.

benchmark/tasks.jsonl 예시

{"task_id":"T001","keyword":"AI interview employer
branding","field":"organization-hr","year_start":2020,"year_end":2026,"max_results":5}

{"task_id":"T002","keyword":"generative AI advertising
effectiveness","field":"marketing","year_start":2020,"year_end":2026,"max_results":5}

## 8.3 Baseline 비교 설계

| **비교 대상**     | **설명**                                                 | **강점**                                  | **약점**                                |
|-------------------|----------------------------------------------------------|-------------------------------------------|-----------------------------------------|
| Rule-based Search | WoS/OpenAlex keyword search 후 citation count 기준 Top 5 | 구현 간단, 재현 쉬움                      | 저널 품질·DOI 검증·관련성 설명 부족     |
| Single LLM        | LLM에 논문 5편 추천 요청                                 | 빠르고 자연어 설명 가능                   | 환각, DOI 오류, 존재하지 않는 논문 위험 |
| Proposed Agent    | 검색, allowlist, Crossref, Unpaywall, scoring, report    | 검증 가능성, 신뢰도, trace, 보고서 자동화 | 구현 복잡도, API quota, latency         |

논문 Experiments에는 최소한 Precision@5, DOI Accuracy, Top Journal
Precision, Hallucination Rate, Report Completeness, Average Latency를
표로 제시해야 한다.

# 9. 2번 링크 기반 MCP 후보 선별 및 적용 계획

2번 링크는 MCP 서버 큐레이션 저장소이며, MCP를 AI 모델이 표준화된 server
implementation을 통해 local/remote resources와 안전하게 상호작용할 수
있게 하는 open protocol로 설명한다. 1번 링크에서는 2번 링크의 MCP를
무작정 많이 연결하는 것이 아니라, 프로젝트 workflow와 권한 원칙에 맞는
MCP만 선별해야 한다.

| **우선순위** | **MCP 후보 범주**                | **1번 링크 적용 목적**                                               | **적용 방식**                         | **주의점**                                 |
|--------------|----------------------------------|----------------------------------------------------------------------|---------------------------------------|--------------------------------------------|
| 필수         | Custom Paper-Agent MCP           | D1/R2 job/result/report 조회, agent trace/critic review 조회         | 현재 apps/mcp read-only를 확장        | write tool은 audit table 이후              |
| 필수         | GitHub / Version Control MCP     | issue, PR, commit, progress, changelog 관리                          | 개발팀 운영용 MCP                     | 최종 사용자에게 repo write 권한 노출 금지  |
| 필수         | Cloudflare MCP                   | Workers, Pages, R2, D1, deployment 상태 점검                         | 개발·운영자용 read-only 우선          | Cloudflare account management 권한 금지    |
| 권장         | Google Drive / Google Sheets MCP | OA PDF 저장, 팀원 검토 파일, 논문 정리표 관리                        | Unpaywall-confirmed PDF만 Drive 저장  | 임의 폴더 선택 및 삭제 금지                |
| 권장         | Research / Academic Search MCP   | Semantic Scholar, OpenAlex, citation graph, paper metadata 탐색 보조 | Retriever Agent 보조 또는 비교 실험용 | 핵심 workflow는 자체 Worker tool 중심 유지 |
| 권장         | Database MCP                     | D1 또는 SQLite 기반 benchmark 결과 조회 보조                         | local benchmark/analysis용            | production D1은 custom MCP로 제한          |
| 조건부       | File System MCP                  | local benchmark fixture, report artifact 검사                        | 로컬 개발용                           | production에서 write_arbitrary_file 금지   |
| 조건부       | Search & Data Extraction MCP     | 공개 웹 기반 보조 탐색                                               | 낮은 우선순위                         | paywall 우회 및 무제한 fetch 금지          |
| 보류         | Aggregator / Meta-MCP            | 여러 MCP discovery와 routing                                         | 후순위                                | 도구 폭발, 권한 과다, 평가 복잡도 증가     |

## 9.1 현재 구현 MCP와 확장 방향

현재 1번 링크의 apps/mcp는 별도 Cloudflare Worker로 구현되어 있으며,
query_recent_jobs, get_search_job, get_paper_results, get_report_links,
get_system_diagnostics를 제공한다. 이는 1단계 read-only MCP로 적절하다.

| **단계** | **MCP Tool**           | **상태**  | **역할**                                 |
|----------|------------------------|-----------|------------------------------------------|
| Phase 1  | get_system_diagnostics | 완료      | DB/R2/MCP 상태 확인                      |
| Phase 1  | query_recent_jobs      | 완료      | 최근 검색 job 목록 조회                  |
| Phase 1  | get_search_job         | 완료      | 단일 job 상태 조회                       |
| Phase 1  | get_paper_results      | 완료      | ranked paper result 조회                 |
| Phase 1  | get_report_links       | 완료      | CSV/Markdown R2/API 링크 확인            |
| Phase 1+ | get_agent_traces       | 추가 필요 | Multi-Agent 실행 trace 조회              |
| Phase 1+ | get_critic_reviews     | 추가 필요 | Critic Agent 판단 근거 조회              |
| Phase 2  | create_search_job      | 후순위    | 제한적 write tool. max_results 제한 필요 |
| Phase 2  | regenerate_outputs     | 후순위    | 기존 D1 결과 기반 산출물 재생성          |
| Phase 3  | upload_oa_pdf_to_drive | 후순위    | Unpaywall-confirmed PDF만 저장           |

## 9.2 MCP 금지 원칙

MCP는 Agent에게 무제한 권한을 주는 장치가 아니라 제한된 tool
interface이다. 따라서 다음 도구는 1번 링크의 production MCP에 노출하지
않는다.

> **•** drop_database, delete_bucket, delete_drive_file과 같은 파괴적
> 도구
>
> **•** manage_cloudflare_account처럼 계정 전체 권한을 다루는 도구
>
> **•** execute_command, write_arbitrary_file처럼 임의 실행·임의 파일
> 쓰기 도구
>
> **•** fetch_any_url_without_allowlist처럼 무제한 URL 접근 도구
>
> **•** paywall 우회 또는 라이선스가 불분명한 PDF 저장 도구

# 10. 데이터베이스·저장소·산출물 보강안

현재 1번 파일은 Google Drive, D1, R2, Vectorize를 분리하는 저장소 설계를
제안했고, 현재 1번 링크는 D1/R2 중심 MVP를 구현하였다. 보강 후에는 agent
trace, critic review, reports metadata, benchmark results를 추가해야
한다.

| **저장소**           | **현재 상태**                         | **보강 대상**                                            | **목적**                          |
|----------------------|---------------------------------------|----------------------------------------------------------|-----------------------------------|
| Cloudflare D1        | search_jobs, papers, evaluations 구현 | agent_traces, critic_reviews, reports, benchmark_results | 상태 추적, 평가 재현성, 결과 검증 |
| Cloudflare R2        | papers.csv, report.md 저장            | papers.xlsx, report.pdf, benchmark_summary.md            | 제출 산출물 및 데모 산출물 저장   |
| Google Drive         | 환경변수만 준비                       | OA PDF 원본 저장, 팀 검토 폴더                           | 논문 PDF 팀 공유 및 수작업 검토   |
| Cloudflare Vectorize | 계획 단계                             | abstract embedding, query embedding                      | semantic relevance scoring        |
| GitHub               | 코드/문서 관리                        | prompts, used_papers, benchmark results                  | 재현 가능성 및 제출 요건 충족     |

## 10.1 추가 D1 테이블 제안

CREATE TABLE IF NOT EXISTS agent_traces (

id TEXT PRIMARY KEY,

job_id TEXT NOT NULL,

agent_name TEXT NOT NULL,

status TEXT NOT NULL,

input_summary TEXT,

output_summary TEXT,

error_message TEXT,

started_at TEXT NOT NULL,

completed_at TEXT,

FOREIGN KEY (job_id) REFERENCES search_jobs(id) ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS critic_reviews (

id TEXT PRIMARY KEY,

paper_id TEXT NOT NULL,

risk_level TEXT NOT NULL,

flags TEXT NOT NULL,

recommendation TEXT NOT NULL,

critic_note TEXT NOT NULL,

created_at TEXT NOT NULL,

FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE

);

CREATE TABLE IF NOT EXISTS mcp_tool_calls (

id TEXT PRIMARY KEY,

tool_name TEXT NOT NULL,

input_json TEXT NOT NULL,

status TEXT NOT NULL,

error_message TEXT,

created_at TEXT NOT NULL

);

# 11. 제출물 완성 로드맵

현재부터 제출 전까지는 “기능 완성 - 평가 실험 - 논문/PPT 정리 - 데모
리허설” 순서로 진행해야 한다. 특히 benchmark 결과와 baseline 비교표가
없으면 프로젝트 완성도가 낮아 보일 수 있으므로, 평가 실험을 가장 먼저
수행한다.

| **단계** | **기간** | **작업**                                             | **산출물**                                       |
|----------|----------|------------------------------------------------------|--------------------------------------------------|
| 1        | 즉시     | 20개 benchmark task 작성, gold paper set 수작업 구성 | benchmark/tasks.jsonl, gold_relevant_papers.csv  |
| 2        | 즉시     | Rule-based baseline과 Single LLM baseline 실행       | baseline_results.csv                             |
| 3        | 즉시     | Proposed Agent 결과 저장 및 metric 계산              | proposed_agent_results.csv, benchmark_summary.md |
| 4        | 단기     | Critic Agent와 agent_traces 추가                     | critic_reviews table, agent_traces table         |
| 5        | 단기     | XLSX output 구현                                     | papers.xlsx endpoint 및 R2 저장                  |
| 6        | 중기     | PDF report 구현                                      | report.pdf endpoint 및 R2 저장                   |
| 7        | 중기     | prompts.md, used_papers.md 정리                      | 프롬프트와 사용 논문 목록                        |
| 8        | 마감 전  | 8-12쪽 논문 작성                                     | paper.pdf 또는 paper.docx                        |
| 9        | 마감 전  | 8분 발표자료 작성                                    | presentation.pptx 또는 PDF                       |
| 10       | 마감 전  | 2-3분 라이브 데모 리허설                             | demo_script.md                                   |

# 12. 리스크, 한계, 윤리 및 보안 관리

| **리스크**             | **설명**                                        | **대응 방안**                                                     |
|------------------------|-------------------------------------------------|-------------------------------------------------------------------|
| API quota / rate limit | WoS, Crossref, Unpaywall 호출 제한과 429 가능성 | candidate cap, retry/backoff, cache, benchmark task batch 분할    |
| 검색 coverage bias     | WoS/OpenAlex가 모든 관련 논문을 포괄하지 못함   | provider 차이를 Limitations에 명시하고 gold set 기반 평가         |
| Top journal bias       | allowlist가 신진/학제간 연구를 배제할 수 있음   | journal metric은 품질의 한 근거로만 사용                          |
| LLM hallucination      | 요약/비교/critic 단계에서 근거 없는 주장 가능   | Crossref/Unpaywall/D1 source 기반으로만 report 생성               |
| 저작권/paywall         | 비OA PDF 저장 위험                              | Unpaywall-confirmed OA 또는 사용자 제공 PDF만 저장                |
| MCP 권한 남용          | write/delete tool 노출 시 위험                  | read-only 우선, audit log, least privilege, destructive tool 금지 |
| 재현성 부족            | 프롬프트/seed/결과 미기록 시 평가 재현 불가     | prompts.md, benchmark results, agent_traces 저장                  |

# 13. 발표 및 라이브 데모 구성안

발표는 8분 기준으로 문제 정의, Agent 구조, 구현 현황, 평가 설계, 데모,
한계와 향후 계획을 압축해야 한다. 데모는 현재 구현된 dashboard 중심으로
진행하고, PDF/XLSX가 미완성인 경우 CSV/Markdown report를 중간 산출물로
보여준 뒤 다음 구현 계획을 설명한다.

| **시간**  | **내용**       | **핵심 메시지**                                                      |
|-----------|----------------|----------------------------------------------------------------------|
| 0:00-1:00 | 문제 정의      | 문헌검토는 검색, 검증, 평가, 보고서화가 필요한 복합 workflow         |
| 1:00-2:20 | Agent 아키텍처 | Planner-Retriever-Verifier-Ranker-Critic-Report 구조와 Tool Use/MCP  |
| 2:20-3:30 | 구현 현황      | Dashboard, Worker API, D1/R2, Crossref, Unpaywall, MCP read-only     |
| 3:30-5:30 | 라이브 데모    | keyword 입력, field 선택, Run, ranked papers, detail, report preview |
| 5:30-6:40 | 평가 벤치마크  | Rule-based vs Single LLM vs Proposed Agent, Agent별 metric           |
| 6:40-7:30 | 한계와 윤리    | 환각, paywall, API coverage, MCP 권한 제한                           |
| 7:30-8:00 | 결론           | 검증 가능한 top-journal literature review assistant                  |

## 13.1 데모 시나리오

1\. Dashboard 접속: https://paper-agent-project.pages.dev/

2\. Keyword: AI interview employer branding

3\. Field: 2. 조직인사 또는 6. 경영정보 선택

4\. Max/From/To 설정 후 Run

5\. Pipeline Progress, Source / Allowed, System Checks 확인

6\. Ranked Papers에서 Field / Rank, DOI, OA, Score 확인

7\. Paper Detail에서 Crossref verification, Unpaywall status, score
breakdown 확인

8\. Report Preview 확인 및 CSV/Markdown 다운로드

9\. MCP smoke/e2e 결과 또는 read-only tool 목록 설명

# Appendix A. 참고 자료 및 반영 근거

| **자료**                                    | **반영 내용**                                                                                                                  |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------|
| 1번 파일: AI_Agent_프로젝트_전체_통합본.pdf | 원 프로젝트 정의, Multi-Agent/RAG/MCP 설계, 저장소 구조, 12주 일정, 평가 설계의 기준 문서                                      |
| 1번 링크 README.md                          | 현재 monorepo 구조, Cloudflare Pages/Workers/MCP, required secrets, MVP flow 확인                                              |
| 1번 링크 docs/progress.md                   | 현재 작업 현황, 완료된 기능, 배포 URL, 남은 작업, XLSX/PDF next plan 반영                                                      |
| 1번 링크 docs/workflow.md                   | 전체 workflow, Agent responsibilities, storage architecture, evaluation plan 반영                                              |
| 1번 링크 docs/mcp.md                        | MCP rollout, read-only tools, controlled write MCP, 금지 tool, audit table 반영                                                |
| 2번 링크 awesome-mcp-servers README         | MCP의 정의, Cloud Platforms, Databases, File Systems, Research, Search, Version Control, Workplace/Productivity 후보 범주 반영 |
| 3번 링크 REPRO-Bench README 및 관련 자료    | task instance, gold annotation, agent 비교, benchmark식 평가 구조 참고                                                         |

# Appendix B. 즉시 실행 체크리스트

| **체크** | **작업**                                                                                                           |
|----------|--------------------------------------------------------------------------------------------------------------------|
| □        | benchmark/keywords.csv를 20개 task로 확장한다.                                                                     |
| □        | 각 task별 gold relevant papers 3-5개와 DOI를 정리한다.                                                             |
| □        | Rule-based baseline 결과와 Single LLM baseline 결과를 생성한다.                                                    |
| □        | Proposed Agent 결과를 동일한 format으로 저장한다.                                                                  |
| □        | evaluate.ts 또는 evaluate.ipynb로 Precision@5, DOI Accuracy, Top Journal Precision, Hallucination Rate를 계산한다. |
| □        | Worker pipeline을 agents/와 orchestrator/ 구조로 분리한다.                                                         |
| □        | Critic Agent와 critic_reviews table을 추가한다.                                                                    |
| □        | agent_traces table을 추가하고 report에 trace summary를 포함한다.                                                   |
| □        | read-only MCP에 get_agent_traces, get_critic_reviews를 추가한다.                                                   |
| □        | XLSX endpoint와 R2 저장을 구현한다.                                                                                |
| □        | PDF report endpoint와 R2 저장을 구현한다.                                                                          |
| □        | docs/prompts.md와 used_papers.md를 완성한다.                                                                       |
| □        | 논문 8-12쪽과 발표자료를 작성한다.                                                                                 |
| □        | 라이브 데모를 2-3분으로 리허설한다.                                                                                |
