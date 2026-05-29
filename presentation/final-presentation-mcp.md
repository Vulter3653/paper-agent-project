---
discipline: AI Agent 기반 도메인 문제 해결 프로젝트
type: lecture
module: "Final Team Project"
lesson: "Paper Agent: From Black-Box AI to Traceable and Trustworthy Research"
attribution: "(gemini)"
---

## [plan] 발표 구성

- 1. Problem: The Traceability Gap (문제 정의)
- 2. Architecture: Agent-as-a-Module (설계 근거)
- 3. Implementation: Deployed Rigor (구현)
- 4. Live Demo Sequence (데모)
- 5. Benchmark & Results: Quality over Popularity (평가)
- 6. Ethics: Algorithmic Gatekeeping (한계 및 윤리)
- 7. Conclusion (결론)

## [divider] 1. Problem: The Traceability Gap

## [content] Literature Review Bottleneck

Business-school literature review는 고도의 엄밀성이 요구되나, 현재 도구들은 파편화되어 있습니다.

- **Tool Fragmentation**: WoS(검색), Crossref(검증), Unpaywall(접근) 사이의 전환 비용
- **Opaque Selection Bias**: 왜 이 논문이 선택되었는지에 대한 근거 유실
- **The LLM Risk**: "Black-box"형 AI의 환각 및 학술적 gatekeeping 무력화

단일 LLM 호출은 신뢰할 수 있는 학술적 증거를 보장하지 못합니다.

## [divider] 2. Architecture: Agent-as-a-Module

## [content] 12-Step "White-box" Workflow

| Step | Agent | Design Rationale |
| --- | --- | --- |
| 1-2 | Planner/Selector | 학술지 품질 기준(FT50, S급) 강제 집행 |
| 3-5 | Retriever/Verifier | 실시간 API 연동 및 DOI 기반 무결성 검증 |
| 6-9 | Scoring/Ranking | 다중 지표(Relevance, Journal Fit, Recency) 가중 정렬 |
| 10-12 | Critic/Reporting | 환각 감지 및 서사적 리포트(Findings/Gaps) 생성 |

## [content] Why Multi-Agent?

분리된 Agent Trace는 "White-box" 연구 환경을 제공합니다.

- **Error Isolation**: 특정 단계(예: 원문 확보)의 실패가 전체 파이프라인을 오염시키지 않음.
- **Auditability**: 각 단계의 입력/출력/의도가 D1에 영구 기록되어 인간 연구자가 검증 가능.

## [divider] 3. System Implementation

## [content] Deployed Rigor (Cloudflare Stack)

| Component | Role | Status |
| --- | --- | --- |
| Cloudflare Pages | Interactive Research Studio UI | Live |
| Cloudflare Worker | 12-stage Multi-Agent Pipeline | Live |
| Cloudflare D1 | Job Traces & Metadata Persistence | Live |
| Cloudflare R2 | Narrative Report Artifact Storage | Live |
| AI / Vectorize | Opt-in semantic scoring & critic paths | **Planned / Future** |

## [divider] 4. Demo Sequence

## [content] From Keyword to Narrative

1. **Research Studio**: 검색어 입력 및 실시간 진행 확인
2. **Agent Board**: 12단계 에이전트의 실행 로그(Trace) 감시
3. **Paper Detail**: 점수 산출 근거(Score Breakdown) 확인
4. **Final Synthesis**: 서사적 리포트 미리보기 및 저장 상태 확인

## [divider] 5. Evaluation & Results

## [content] Paper-Agent-Bench

- **Primary**: T001-T003 Controlled Comparison Layer (High fidelity)
- **Expanded**: T001-T018 **Partial Expanded Evidence** (90% success)
- **Failure**: T019-T020 Resource limit (Cloudflare 503)
- **Integrity**: DOI 기반 Gold Label 매칭 및 자동 감사 스크립트 실행

## [content] Results: Proposed vs Single-LLM

T001-T003 제어 레이어 결과:
- **Proposed Agent**: **100% Top-Journal Precision**, 100% DOI Presence
- **Single-LLM**: 높은 Overlap을 보이나 품질 준수율(93%) 및 실시간 검색 실행력 부재
- **Core Claim**: 본 시스템은 18/20 수준의 확장성을 증명함과 동시에, **검증 가능한 학술 워크플로우를 기록하고 강제**합니다.

## [divider] 6. Limitations And Ethics

## [content] Algorithmic Gatekeeping

- **Selection Bias**: 승인된 저널 리스트(Allowlist) 외부의 신규/학간 연구 배제 가능성
- **Planned Enrichment**: JCR/SCImago 등 외부 서지 지표 연동은 현재 **미구현 (Planned)**
- **Ethical Guideline**: 본 도구는 의사결정 지원 도구이며, 인간의 비판적 읽기를 대체할 수 없음.

## [divider] 7. Conclusion

## [content] Beyond Generative AI

Paper Agent는 학계가 요구하는 **책임성(Accountability)**과 **재현성(Reproducibility)**을 AI 에이전트 설계로 구현했습니다.

- 12단계 모듈형 아키텍처를 통한 투명성 확보
- 실시간 학술 데이터 연동을 통한 무결성 보장
- Cloudflare 기반의 확장 가능하고 재현 가능한 배포 모델

**Next Work**: 20개 Task 전체 Proposed Agent 런타임 벤치마크 완결 및 의미론적 인용 맵핑 고도화
