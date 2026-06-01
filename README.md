# Paper Agent Project

## 한국어 요약

Paper Agent는 사용자가 입력한 연구 주제에 대해 관련 학술논문을 검색하고, DOI와 metadata를 검증하며, 추천 결과와 산출물을 생성하는 AI literature review agent입니다.

최종 상태는 **PASS WITH CLAIM BOUNDARIES**입니다.

> 주장 범위를 제한한 조건부 통과

이 프로젝트는 Paper Agent가 모든 task에서 baseline보다 우수하다고 주장하지 않습니다. 핵심 기여는 AI Agent 결과를 재현 가능하고, 추적 가능하며, 주장 범위가 명확한 방식으로 평가하는 Benchmark v3 framework를 구축한 것입니다.

발표용 메인 화면은 [`/dashboard`](https://paper-agent-project.pages.dev/dashboard)이고, 실제 2~3분 AI Agent 시연은 [`/dashboard/demo`](https://paper-agent-project.pages.dev/dashboard/demo)에서 진행합니다.

## Final Submission Package

| Submission item | Repository path |
| --- | --- |
| Final paper LaTeX source | [`paper/final-paper-draft.tex`](paper/final-paper-draft.tex) |
| Authoritative presentation content source | [`presentation/final-presentation-essential-content.md`](presentation/final-presentation-essential-content.md) |
| Presentation outline / 8-minute speaker notes | [`presentation/final-presentation-outline.md`](presentation/final-presentation-outline.md) |
| Generated presentation PPTX draft, subject to visual QA | [`presentation/final-paper-agent-benchmark-presentation.pptx`](presentation/final-paper-agent-benchmark-presentation.pptx) |
| Live demo script | [`docs/final-demo-script.md`](docs/final-demo-script.md) |
| Prompt inventory | [`docs/prompts.md`](docs/prompts.md) |
| Used papers list | [`docs/used_papers_list.md`](docs/used_papers_list.md) |
| Benchmark documentation | [`docs/benchmark.md`](docs/benchmark.md) |
| Paper claim-boundary checklist | [`paper/paper_claim_boundary_checklist.md`](paper/paper_claim_boundary_checklist.md) |
| Final submission checklist | [`docs/final-submission-checklist-v3.md`](docs/final-submission-checklist-v3.md) |
| Dashboard | https://paper-agent-project.pages.dev/dashboard |

## Claim Boundary

Current readiness: **PASS WITH CLAIM BOUNDARIES**.

Allowed claims:

- Benchmark v3 provides a reproducible automated evaluation framework with 6 layers and 30 metrics.
- Layers 1--4 and Layer 6 are computed.
- Baseline comparison is limited to the T001--T003 common-support subset.
- T004--T020 are artifact-level validation tasks unless baseline parity is proven.
- T007 is marked `proposed_agent_missing`.
- Layer 5A is a quota-limited partial implementation audit: 22/125 successful rows, or 17.6%.
- The successful Layer 5A subset contains no Proposed Agent rows.
- Proposed Agent Layer 5 score is `not_available_in_subset`.
- Layer 5B deterministic semantic proxies were generated for 125 rows.
- Layer 5B supplements, but does not replace, LLM or human semantic evaluation.
- Paper Agent emphasizes traceability, DOI integrity, hallucination control, journal-policy compliance, and visible failure reporting.

Interpretation limits:

- Single LLM has higher Precision@5 and NDCG@5 in the controlled T001--T003 comparison.
- Paper Agent is not claimed to globally outperform the Single LLM or other baselines.
- The current evidence does not support full T001--T020 comparative superiority claims.
- The current evidence does not support full semantic-quality validation claims.
- D1 batch-aware persistence is not implemented end-to-end.

## Claim Boundary 한국어 설명

이 프로젝트는 다음을 주장하지 않습니다.

- Paper Agent가 전체 T001--T020에서 baseline보다 우수하다.
- full semantic validation이 완료되었다.
- Proposed Agent semantic quality가 완전히 검증되었다.
- 모든 task에서 Paper Agent가 우수하다.
- Layer 5가 완전한 의미 품질 검증이다.

Benchmark v3의 목적은 Paper Agent의 완전한 우수성을 증명하는 것이 아니라, AI Agent 결과를 어떤 범위에서 신뢰할 수 있고 어떤 범위에서는 아직 주장할 수 없는지를 명확히 구분하는 것입니다.

현재 수치와 해석 경계:

- Benchmark v3 = 20 tasks / 6 layers / 30 metrics
- T001--T003만 common-support controlled comparison
- T004--T020은 artifact-level validation
- T007은 `proposed_agent_missing`
- Layer 5A = 22/125, 17.6%
- Proposed Agent Layer 5 score = `not_available_in_subset`
- Layer 5B = deterministic semantic proxy, not semantic replacement

## Final Submission Status (2026-06-01)
- **Status**: Benchmark v3 documentation aligned; readiness is **PASS WITH CLAIM BOUNDARIES**. (codex)
- **Live Verification**: [docs/live-benchmark-verification-2026-05-31.md](docs/live-benchmark-verification-2026-05-31.md)
- **Benchmark Coverage**: Controlled T001-T003 performance is served live from Production D1.
- **Evidence**: Raw API responses captured in `docs/api-benchmark-*.json`.
- **Expansion Protocol**: [docs/benchmark-batch-protocol.md](docs/benchmark-batch-protocol.md) (gemini)
- [Batch Design](./docs/benchmark-batch-schema-api-design.md) (gemini)
- [Migration Review](./docs/benchmark-batch-migration-static-review.md) (gemini)
- [Local Schema Test](./docs/benchmark-batch-local-schema-test.md) (gemini)
- [Migration Approval Package](./docs/production-d1-migration-approval-package.md) (Phase 3A) (gemini)


AI Agent 기반 학술논문 탐색 및 문헌검토 자동화 시스템입니다.



이 저장소는 개인 GitHub repo에서 시작해 Cloudflare Pages 대시보드와 Cloudflare Workers backend를 함께 관리하는 monorepo입니다. 이 후 GitHub Organization으로 이전해도 같은 구조를 유지할 수 있습니다.

## Architecture

```text
apps/web
  -> Cloudflare Pages dashboard
  -> calls Workers API

apps/worker
  -> Cloudflare Workers API
  -> D1 metadata
  -> R2 reports
  -> Vectorize opt-in semantic relevance; metadata scoring remains default.
  -> Google Drive / Web of Science / Crossref / Unpaywall tools

apps/mcp
  -> Cloudflare Remote MCP server
  -> read-only D1/R2 inspection tools for agent clients
```

## Repository Structure

```text
apps/
  web/          # Frontend dashboard
  worker/       # Cloudflare Workers backend and agent workflow API
  mcp/          # Cloudflare Remote MCP server
packages/
  shared/       # Shared types and scoring helpers
docs/
  workflow.md
  mcp.md
  prompts.md
  benchmark.md
benchmark/
  keywords.csv
```

## Local Development

Install dependencies after cloning:

```bash
npm install
```

Run the dashboard:

```bash
npm run dev:web
```

Run the Worker locally:

```bash
npm run dev:worker
```

Run the Remote MCP Worker locally:

```bash
npm run dev:mcp
```

Deploy the Remote MCP Worker:

```bash
npm run deploy:mcp
```

Verify the deployed Remote MCP Worker:

```bash
npm run smoke:mcp
```

Verify the latest completed job across Worker API, MCP, and R2 report outputs:

```bash
npm run e2e:reports
```

To verify a specific job:

```bash
JOB_ID=job-... npm run e2e:reports
```

To test another endpoint or a specific D1 job:

```bash
MCP_URL=https://paper-agent-mcp.shch3653.workers.dev/mcp MCP_JOB_ID=job-... npm run smoke:mcp
```

Validate the final dashboard and repository history before presentation:

```bash
npm run typecheck
npm run build:web
npm run benchmark:v3:check
npm run validate:history
npm run validate:agent-rules
```

## Cloudflare Setup

Create three Cloudflare projects from this single GitHub repository.

| Target | Cloudflare Product | Root directory |
| --- | --- | --- |
| Dashboard | Pages | `apps/web` |
| Backend API | Workers | `apps/worker` |
| Remote MCP | Workers | `apps/mcp` |

Recommended names:

- Pages: `paper-agent-dashboard`
- Worker: `paper-agent-project`
- MCP Worker: `paper-agent-mcp`
- D1: `paper_agent_db`
- R2: `paper-agent-outputs`
- Vectorize: `paper-abstract-index`

## 배포 링크 및 상태 확인

아래 링크는 조직 repo 기준으로 팀원이 현재 배포 상태를 빠르게 확인하기 위한 고정 진입점입니다.

| 구분 | 링크 | 확인 기준 |
| --- | --- | --- |
| 발표용 메인 대시보드 | https://paper-agent-project.pages.dev/dashboard | Benchmark v3 evidence landing과 claim boundary를 발표 첫 화면에서 확인합니다. |
| 라이브 데모 모드 | https://paper-agent-project.pages.dev/dashboard/demo | 2~3분 발표용 AI Agent 시연 화면입니다. 연구 질문 입력 → Agent 실행 → Pipeline / Trace 확인 → 추천 논문 결과 확인 → 산출물 / Report 확인 → Benchmark v3 Claim Boundary 연결까지 순차적으로 진행합니다. |
| Research Dashboard | https://paper-agent-project.pages.dev/dashboard/research | 검색 실행, Ranked Papers, Paper Detail, Report Preview를 확인합니다. |
| Ops Dashboard | https://paper-agent-project.pages.dev/dashboard/ops | Worker, D1, R2, MCP, Agent trace 상태 및 Benchmark Seed Diagnostics를 확인합니다. |
| Evaluation Dashboard | https://paper-agent-project.pages.dev/dashboard/evaluation | Rule-based, Single-LLM, Proposed Multi-Agent 비교와 D1-backed controlled benchmark run을 확인합니다. |
| Worker health | https://paper-agent-project.shch3653.workers.dev/api/health | `{ "ok": true }` 형태의 정상 응답이어야 합니다. |
| Worker diagnostics | https://paper-agent-project.shch3653.workers.dev/api/diagnostics | DB missingColumns가 비어 있고 WoS/Crossref/Unpaywall/R2/Google Drive 준비 상태를 확인합니다. |
| 최근 검색 작업 | https://paper-agent-project.shch3653.workers.dev/api/search-jobs?limit=5 | 최근 job id, status, sourceResultCount, allowedResultCount를 확인합니다. |
| MCP health | https://paper-agent-mcp.shch3653.workers.dev/health | MCP Worker가 `{ "ok": true }` 형태로 응답해야 합니다. |
| MCP endpoint | https://paper-agent-mcp.shch3653.workers.dev/mcp | MCP client 연결용 endpoint입니다. 브라우저 직접 접속 확인용이 아닙니다. |

주의: Worker 루트 경로 `https://paper-agent-project.shch3653.workers.dev/`는 `{ "error": "Not found" }`를 반환할 수 있습니다. 이는 오류가 아니며, 상태 확인은 `/api/health`와 `/api/diagnostics`를 기준으로 합니다.

## 라이브 데모 진행 방법

과제 요구사항: **(4) 라이브 데모 — 발표 중 AI Agent 시연, 2~3분 분량 권장**

발표자는 `/dashboard/demo`에서 다음 6단계를 순서대로 진행합니다.

1. **연구 질문 입력**
   - 기본 검색어: `AI hiring fairness`
   - 사용자가 연구 주제를 입력하면 Paper Agent가 관련 논문 후보를 검색할 준비를 합니다.
2. **Agent 실행**
   - 빠른 검증 모드를 사용합니다.
   - `maxResults = 5`, `enrichmentLimit = 5`, `useSemanticRanking = false`, `useLlmCritic = false`
   - 페이지 로드 시 자동 실행되지 않고, 발표자가 버튼을 눌렀을 때만 실행됩니다.
3. **Pipeline / Trace 확인**
   - 검색, DOI 검증, metadata 확인, ranking, report 생성 과정을 Trace로 확인합니다.
4. **추천 논문 결과 확인**
   - title, DOI, journal/publisher, score/relevance, verification status, source를 확인합니다.
5. **산출물 / Report 확인**
   - Markdown report, CSV/XLSX, PDF, R2 저장 상태를 확인합니다.
   - 발표 중에는 Markdown report를 우선 사용합니다.
   - CSV/XLSX는 분석용 원자료입니다.
   - PDF는 영문 제공이며, 다운로드 지연 가능성이 있습니다.
   - 산출물 버튼은 새 탭에서 열기와 링크 복사를 제공합니다.
6. **Benchmark v3 Claim Boundary 연결**
   - **PASS WITH CLAIM BOUNDARIES**
   - 전체 과제에서의 완전한 우수성 주장이 아닙니다.
   - 의미 품질이 완전히 검증된 것은 아닙니다.
   - T001--T003만 통제 비교가 가능합니다.
   - T004--T020은 산출물 수준 검증입니다.
   - Layer 5A는 22/125, 17.6% partial audit입니다.
   - Layer 5B는 의미 평가를 대체하지 않는 deterministic proxy입니다.

지연 대응:

- 실시간 API 응답이 지연되면 **최근 완료된 job 결과 불러오기**를 사용합니다.
- 다운로드가 지연되면 Markdown report를 우선 열고, 나머지는 링크 복사 또는 사후 확인으로 처리합니다.
- 발표 중에는 PDF/CSV/XLSX 다운로드 완료를 기다리지 않고, 산출물이 저장되고 접근 가능하다는 점만 보여준 뒤 다음 단계로 진행합니다.

### 평가자 시연 가이드 (Evaluator Demo Flow)

최종 발표의 2~3분 라이브 데모는 `/dashboard/demo`를 우선 사용합니다. 기존 `/dashboard/research`, `/dashboard/ops`, `/dashboard/evaluation`은 상세 확인 및 백업 경로로 사용합니다.

- 발표용 빠른 시연: `/dashboard/demo`
- 전체 평가 결과 확인: `/dashboard`
- 실제 검색 상세 확인: `/dashboard/research`
- 운영 상태 및 Trace 확인: `/dashboard/ops`
- Benchmark evidence 상세 확인: `/dashboard/evaluation`

평가자는 다음 순서에 따라 시스템의 무결성과 Agent 동작을 검증할 수 있습니다:
1. **평가 대시보드(Evaluation)**: D1 기반 실시간 벤치마크 증거 확인 및 모델별 정량 지표 비교.
2. **연구 스튜디오(Research)**: 실제 키워드로 논문 검색 실행 및 12단계 파이프라인(Pipeline) 실시간 추적.
3. **운영 대시보드(Ops)**: 에이전트별 도구 호출(Tool Call) 기록, D1/R2/Drive 저장 상태 및 검토 경고(Critic Flags) 감사.

## Required Secrets

Never commit real credentials. Use `.env.example` as a template and set production secrets in Cloudflare.

```text
SEARCH_PROVIDER
WOS_API_KEY
OPENALEX_EMAIL
OPENALEX_API_KEY
CROSSREF_EMAIL
UNPAYWALL_EMAIL
GOOGLE_CLIENT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_DRIVE_FOLDER_ID
```

## MVP Flow

1. User enters a keyword in the dashboard.
2. Worker creates a search job.
3. Search Agent queries the configured source provider and Crossref.
4. Results are saved to D1.
5. Ranking Agent computes Top 5 papers.
6. CSV and Markdown report outputs are stored in R2 when the `REPORTS` binding is available.
7. Dashboard displays status, ranked papers, scores, and report links.

## Search Provider

Production should use Web of Science after Clarivate approval:

```text
SEARCH_PROVIDER=wos
WOS_API_KEY=...
```

Before the WoS API key is issued, use OpenAlex for integration testing:

```text
SEARCH_PROVIDER=openalex
OPENALEX_EMAIL=...
OPENALEX_API_KEY=optional
```

OpenAlex is a temporary fallback for testing the dashboard, D1, R2, MCP, CSV, and Markdown report flow. Final scholarly quality checks should be repeated after switching back to `SEARCH_PROVIDER=wos`.

## Strict Change Tracking

Every meaningful repository change must update `CHANGELOG.md` in the same commit or pull request. This includes source code, infrastructure configuration, documentation, benchmark data, prompts, schema, and deployment behavior.

Pull requests must use `.github/pull_request_template.md` and confirm the changelog update checklist before merge.

## Session Handoff

Before ending any work session, update `docs/progress.md`. This file is the required handoff source for the next session and must include current status, verification results, deployment URLs, blockers, local-only state, and the next concrete tasks.

Any update to `docs/progress.md` must also be recorded in `CHANGELOG.md`.

## GitHub Remote

The personal repository is configured as `origin`:

```text
https://github.com/Vulter3653/paper-agent-project.git
```

The previous team test repository is preserved as `team-origin`.
