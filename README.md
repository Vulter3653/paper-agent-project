# Paper Agent Project

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
| Dashboard | https://paper-agent-project.pages.dev/ |

## Claim Boundary

Allowed claims:

- Controlled T001-T003 benchmark verified.
- Evidence scope for quantitative comparison is limited to T001-T003.
- T004-T006 artifact-only dry-run executed through a gated wrapper.
- T004-T006 produced 3 job rows and 50 result rows.
- Phase 3L produced partial staged artifact-expansion evidence.
- T008-T012 generated 87 result rows.
- T007 timeout evidence was preserved.
- Later batches T013-T018 and T019-T020 were not started.
- Full T004-T020 validation remains incomplete.
- D1 batch-aware persistence is not implemented.
- Paper Agent emphasizes traceability, DOI integrity, hallucination control, and journal-policy compliance.

Interpretation note:

- Single LLM has higher Precision@5 and NDCG@5 in the controlled T001-T003 benchmark.
- Paper Agent is not claimed to globally outperform the Single LLM.
- Paper Agent's validated strength is traceability, DOI verification, hallucination control, and journal-policy compliance within the controlled evidence boundary.

## Final Submission Status (2026-05-31)
- **Status**: Production Deployment & Verification Complete (gemini)
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
| 대시보드 메인 | https://paper-agent-project.pages.dev/ | 화면이 열리고 Research/Ops/Evaluation 라우트로 이동 가능해야 합니다. |
| Research Dashboard | https://paper-agent-project.pages.dev/dashboard/research | 검색 실행, Ranked Papers, Paper Detail, Report Preview를 확인합니다. |
| Ops Dashboard | https://paper-agent-project.pages.dev/dashboard/ops | Worker, D1, R2, MCP, Agent trace 상태 및 Benchmark Seed Diagnostics를 확인합니다. |
| Evaluation Dashboard | https://paper-agent-project.pages.dev/dashboard/evaluation | Rule-based, Single-LLM, Proposed Multi-Agent 비교와 D1-backed controlled benchmark run을 확인합니다. |
| Worker health | https://paper-agent-project.shch3653.workers.dev/api/health | `{ "ok": true }` 형태의 정상 응답이어야 합니다. |
| Worker diagnostics | https://paper-agent-project.shch3653.workers.dev/api/diagnostics | DB missingColumns가 비어 있고 WoS/Crossref/Unpaywall/R2/Google Drive 준비 상태를 확인합니다. |
| 최근 검색 작업 | https://paper-agent-project.shch3653.workers.dev/api/search-jobs?limit=5 | 최근 job id, status, sourceResultCount, allowedResultCount를 확인합니다. |
| MCP health | https://paper-agent-mcp.shch3653.workers.dev/health | MCP Worker가 `{ "ok": true }` 형태로 응답해야 합니다. |
| MCP endpoint | https://paper-agent-mcp.shch3653.workers.dev/mcp | MCP client 연결용 endpoint입니다. 브라우저 직접 접속 확인용이 아닙니다. |

주의: Worker 루트 경로 `https://paper-agent-project.shch3653.workers.dev/`는 `{ "error": "Not found" }`를 반환할 수 있습니다. 이는 오류가 아니며, 상태 확인은 `/api/health`와 `/api/diagnostics`를 기준으로 합니다.

### 평가자 시연 가이드 (Evaluator Demo Flow)

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
