export type WorkflowStage = {
  id: string;
  order: number;
  title: string;
  owner: string;
  status: "done" | "running" | "review" | "idle";
  progress: number;
  detail: string;
};

export type JournalPoolGroup = {
  field: string;
  rank: "International S" | "International A1" | "Adjacent Q1";
  q1Status: "Q1 candidate (Static)" | "Manual review";
  journals: string[];
};

export type AgentStatus = {
  name: string;
  role: string;
  state: "done" | "running" | "review" | "idle";
  tool: string;
};

export type ToolLog = {
  level: "ok" | "warn" | "muted";
  message: string;
};

export type SystemStatus = {
  name: string;
  status: string;
  detail: string;
  tone: "green" | "blue" | "amber" | "purple";
};

export type CriticReviewItem = {
  title: string;
  severity: "low" | "medium" | "high";
  note: string;
};

export type LiteraturePreviewItem = {
  title: string;
  body: string;
  desc?: string;
};

export type EvaluationScenarioKey = "strict" | "broad" | "demo";

export type EvaluationScenario = {
  key: EvaluationScenarioKey;
  label: string;
  description: string;
  limitation: string;
  announcement: string;
  metrics: {
    precisionAt5: string;
    doiAccuracy: string;
    topJournalPrecision: string;
    hallucinationRate: string;
    reportCompleteness: string;
    avgLatency: string;
  };
  rows: Array<{ metric: string; ruleBased: string; singleLlm: string; proposed: string; finding: string }>;
  bars: Array<{ label: string; value: number }>;
};

export type FeatureImplementationStatus = "live" | "partial" | "mock" | "planned";

export type FeatureImplementationItem = {
  feature: string;
  status: FeatureImplementationStatus;
  evidence: string;
  next: string;
};

export const implementationLegend: Array<{ status: FeatureImplementationStatus; label: string; detail: string }> = [
  { status: "live", label: "LIVE D1 VERIFIED", detail: "실제 Worker/D1/R2/API 또는 배포된 기능과 연결됨" },
  { status: "partial", label: "PLANNED ONLY / PARTIAL", detail: "일부 실제 기능이 있으나 화면의 일부는 정적 데이터 또는 추가 연결 필요" },
  { status: "mock", label: "MOCK BLUEPRINT", detail: "실제 결과가 아니며 API/DB 연결 전의 자리표시자" },
  { status: "planned", label: "PLANNED ONLY", detail: "설계상 필요하지만 아직 코드/인프라 연결 전" }
];

export const researchImplementationStatus: FeatureImplementationItem[] = [
  { feature: "Run / Search Job", status: "live", evidence: "POST /api/search-jobs, GET /api/search-jobs/:id polling", next: "실제 벤치마크 태스크 실행 도구와 연동" },
  { feature: "Ranked Papers", status: "live", evidence: "Worker 결과 papers 배열, D1 papers/evaluations 기반", next: "Gold overlap 지표 표시 강화" },
  { feature: "Paper Detail", status: "live", evidence: "Crossref, Unpaywall, score breakdown 표시", next: "현재 Rule-based 비평 한정" },
  { feature: "Report Preview", status: "live", evidence: "GET /api/search-jobs/:id/report.md", next: "R2 저장 PDF/XLSX 다운로드 연동" },
  { feature: "12-step Workflow Panel", status: "live", evidence: "agent_traces API 실시간 연동 완료", next: "상세 로그 드릴다운 추가" },
  { feature: "Internal Allowlist Filter Panel", status: "partial", evidence: "내부 저널 allowlist 필터링 (S/A1급) 구현됨", next: "Future: External JCR/SCImago bibliometric enrichment (Planned)" },
  { feature: "Literature Review Preview Cards", status: "mock", evidence: "미완성 Mock: 실제 Report Agent section 연결 전", next: "Report Agent section API 연결" }
];

export const opsImplementationStatus: FeatureImplementationItem[] = [
  { feature: "MCP Worker", status: "live", evidence: "paper-agent-mcp /mcp read-only tools 배포 완료", next: "agent trace 조회 tool 추가" },
  { feature: "D1 / R2 Runtime", status: "live", evidence: "search_jobs, papers, evaluations, R2 reports 저장", next: "실시간 스토리지 용량 모니터링" },
  { feature: "Agent Status Board", status: "live", evidence: "GET /api/search-jobs/:id/traces 기반 D1 trace 표시", next: "실시간 에이전트 상태 전이 감시" },
  { feature: "Trace Summary Console", status: "partial", evidence: "D1 agent_traces 요약을 console log로 표시 (Raw API 로그 아님)", next: "개별 외부 API request/response 상세 로그 저장 (Planned)" },
  { feature: "Vectorize Status", status: "partial", evidence: "Opt-in experimental path implemented; metadata fallback active.", next: "Production scaling and multi-index support" },
  { feature: "Google Drive PDF Archive", status: "partial", evidence: "Unpaywall 확인된 합법적 OA PDF 한정 Drive 업로드", next: "Drive 공유 정책 및 실패 재시도 UI 추가" },
  { feature: "Critic Review", status: "partial", evidence: "Rule-based flags live; LLM qualitative review available as opt-in experimental smoke path.", next: "Full production LLM review pipeline and consistency checks." }
];

export const evaluationImplementationStatus: FeatureImplementationItem[] = [
  { feature: "Benchmark Fixtures", status: "live", evidence: "20 tasks, 60 gold rows, audit scripts", next: "verified gold 100개 이상 확충" },
  { feature: "Proposed Agent Runner", status: "live", evidence: "benchmark:run-proposed 스크립트 구현됨", next: "20 task full runtime collection" },
  { feature: "Baseline Evaluation UI", status: "live", evidence: "/api/benchmark-metrics에서 T001-T003 snapshot 로드", next: "전체 태스크 라이브 집계 연결" },
  { feature: "Rule-based Baseline", status: "live", evidence: "T001-T003 통제 데이터 반영됨", next: "20-task baseline 확장" },
  { feature: "Single LLM Baseline", status: "live", evidence: "T001-T003 통제 데이터 반영됨", next: "외부 모델 실행 프로토콜 정의" },
  { feature: "Automated Baseline Review", status: "live", evidence: "auto-review-baselines 결과 반영됨", next: "판정 규칙 고도화" },
  { feature: "Precision@5 / DOI Accuracy", status: "live", evidence: "T001-T003 제어 레이어 기준 산출", next: "전체 20개 태스크 확장" },
  { feature: "Dashboard Metric Binding", status: "live", evidence: "/api/benchmark-metrics 실시간 스냅샷 연결", next: "D1 aggregation 실시간화" }
];

export const literatureWorkflowStages: WorkflowStage[] = [
  { id: "planner", order: 1, title: "Planner", owner: "Planner Agent", status: "done", progress: 100, detail: "구현됨: 검색 범위 및 제약 조건 정규화" },
  { id: "journal_selector", order: 2, title: "Journal Pool", owner: "Journal Selector", status: "done", progress: 100, detail: "구현됨: 경영대학 S/A1급 저널 풀 필터링" },
  { id: "retriever", order: 3, title: "Search", owner: "Retriever Agent", status: "done", progress: 100, detail: "구현됨: WoS/OpenAlex API 검색 실행" },
  { id: "verifier", order: 4, title: "Crossref", owner: "Verifier Agent", status: "done", progress: 96, detail: "구현됨: DOI 및 서지 정보 무결성 검증" },
  { id: "download", order: 5, title: "OA PDF", owner: "Download Agent", status: "running", progress: 72, detail: "구현됨: Unpaywall 기반 합법적 PDF 경로 탐색" },
  { id: "storage", order: 6, title: "Drive / R2", owner: "Storage Worker", status: "running", progress: 68, detail: "구현됨: R2 저장 및 조건부 Google Drive 백업" },
  { id: "evaluation", order: 7, title: "Journal Eval", owner: "Evaluation Agent", status: "done", progress: 88, detail: "구현됨: 저널 품질 및 메타데이터 정량 스코어링" },
  { id: "embedding", order: 8, title: "Vectorize", owner: "Relevance Agent", status: "review", progress: 100, detail: "Partial / Opt-in: Vectorize semantic relevance path available (Experimental)" },
  { id: "ranking", order: 9, title: "Ranking", owner: "Ranking Agent", status: "idle", progress: 40, detail: "구현됨: 다중 지표 기반 가중 정렬" },
  { id: "critic", order: 10, title: "Critic", owner: "Critic Agent", status: "review", progress: 34, detail: "Live: Rule-based critic flags (LLM opt-in experimental)" },
  { id: "report", order: 11, title: "Report", owner: "Report Agent", status: "idle", progress: 20, detail: "구현됨: Markdown 및 기본 PDF/XLSX 생성" },
  { id: "delivery", order: 12, title: "Delivery", owner: "Dashboard", status: "idle", progress: 10, detail: "구현됨: 인터랙티브 UI 기반 결과 인도" }
];


export const topJournalPool: JournalPoolGroup[] = [
  {
    field: "공통 / Strategy",
    rank: "International S",
    q1Status: "Q1 candidate (Static)",
    journals: ["Academy of Management Journal", "Strategic Management Journal", "Administrative Science Quarterly"]
  },
  {
    field: "조직 인사",
    rank: "International S",
    q1Status: "Q1 candidate (Static)",
    journals: ["Journal of Applied Psychology", "Personnel Psychology", "Organization Science"]
  },
  {
    field: "마케팅",
    rank: "International S",
    q1Status: "Q1 candidate (Static)",
    journals: ["Journal of Marketing", "Journal of Marketing Research", "Marketing Science", "Journal of Consumer Research"]
  },
  {
    field: "경영정보",
    rank: "International A1",
    q1Status: "Q1 candidate (Static)",
    journals: ["MIS Quarterly", "Information Systems Research", "Journal of Management Information Systems"]
  },
  {
    field: "회계 / 재무",
    rank: "International A1",
    q1Status: "Manual review",
    journals: ["The Accounting Review", "Journal of Finance", "Review of Financial Studies"]
  }
];

export const agentStatuses: AgentStatus[] = [
  { name: "Planner", role: "연구 질문을 검색 job으로 구조화", state: "done", tool: "job.plan" },
  { name: "Journal Selector", role: "S급, A1급, Q1 allowlist 적용", state: "done", tool: "journals.match" },
  { name: "Retriever", role: "WoS/OpenAlex 후보 검색", state: "running", tool: "source.search" },
  { name: "Verifier", role: "DOI와 Crossref metadata 검증", state: "done", tool: "crossref.verify" },
  { name: "Downloader", role: "OA PDF, Drive, R2 상태 확인", state: "running", tool: "unpaywall.lookup" },
  { name: "Journal Evaluator", role: "Top Journal, Q1, FT50 판정", state: "done", tool: "journal.evaluate" },
  { name: "Relevance", role: "Vectorize 초록 관련성 계산", state: "idle", tool: "vectorize.score" },
  { name: "Ranker", role: "최종 점수와 순위 산출", state: "idle", tool: "ranking.merge" },
  { name: "Summarizer", role: "논문별 핵심 요약 생성", state: "idle", tool: "summary.create" },
  { name: "Comparator", role: "공통점, 차이점, gap 생성", state: "idle", tool: "review.compare" },
  { name: "Critic", role: "오류와 재검토 대상 표시", state: "review", tool: "critic.review" },
  { name: "Report Agent", role: "PDF, XLSX, Markdown 생성", state: "idle", tool: "report.export" }
];

export const toolCallLogs: ToolLog[] = [
  { level: "muted", message: "[미완성 Mock] create_search_job preview only" },
  { level: "muted", message: "[미완성 Mock] D1 insert log placeholder" },
  { level: "muted", message: "[미완성 Mock] JournalSelector trace placeholder" },
  { level: "muted", message: "[미완성 Mock] Crossref tool log placeholder" },
  { level: "muted", message: "[미완성 Mock] Unpaywall tool log placeholder" },
  { level: "ok", message: "ReportAgent.outputs csv/md/xlsx/pdf endpoint 사용 가능" }
];

export const systemStatuses: SystemStatus[] = [
  { name: "Cloudflare D1", status: "연결됨", detail: "search_jobs / papers / evaluations", tone: "green" },
  { name: "Cloudflare R2", status: "준비됨", detail: "paper-agent-outputs bucket", tone: "green" },
  { name: "Google Drive", status: "부분 구현", detail: "OA PDF (Unpaywall) 업로드 경로 연결됨", tone: "amber" },
  { name: "Vectorize", status: "부분 구현", detail: "Opt-in experimental semantic ranking path", tone: "blue" },
  { name: "Remote MCP", status: "온라인", detail: "paper-agent-mcp /mcp", tone: "purple" },
  { name: "Pages UI", status: "부분 구현", detail: "Research/Ops/Evaluation route; legacy partial artifacts are NOT FINAL", tone: "amber" }
];

export const criticReviews: CriticReviewItem[] = [
  { title: "인접 저널 모호성", severity: "medium", note: "내부 allowlist에는 없지만 Q1 인접 분야로 분류되어 rule-based critic 확인이 필요합니다." },
  { title: "OA PDF 미확보", severity: "low", note: "PDF URL이 없으면 landing page와 metadata 기반 요약으로 대체합니다." },
  { title: "Metadata 불일치", severity: "high", note: "제목, 저자, 연도 불일치가 있으면 Crossref 재검증 후 제외 후보로 이동합니다." }
];

export const literaturePreview: LiteraturePreviewItem[] = [
  { title: "요약", body: "AI 면접 공개와 자동화된 선발 경험이 지원자의 신뢰, 공정성 인식, 고용주 브랜드 평가에 미치는 영향을 정리합니다." },
  { title: "공통점", body: "대부분의 연구는 알고리즘 투명성, 절차적 공정성, 기술 수용성을 핵심 매개 요인으로 다룹니다." },
  { title: "차이점", body: "마케팅 저널은 브랜드 반응을, HRM/조직 저널은 지원자 경험과 선발 공정성을 더 강하게 설명합니다." },
  { title: "Research Gap", body: "AI 사용 공개 수준과 employer branding 간의 인과적 연결을 top journal 근거로 검증한 연구는 제한적입니다." },
  { title: "Critic Note", body: "인접 분야 Q1 논문은 보조 근거로 유지하고, 핵심 가설 개발은 S급 및 A1급 저널 우선으로 제한합니다." },
  { title: "논문 활용", body: "서론 문제제기, 이론적 배경, 가설 개발, 변수 조작화 근거로 연결할 수 있습니다." }
];

export const evaluationScenarios: EvaluationScenario[] = [
  {
    key: "strict",
    label: "엄격한 통제 검증 (Strict)",
    description: "Gold label과 DOI 검증을 가장 엄격하게 비교하는 평가입니다. (T001-T003 통제 레이어 기준)",
    limitation: "LEGACY PARTIAL ARTIFACT T001-T018은 최종 검증이 아닙니다. T019-T020 실패 증거를 유지해야 합니다.",
    announcement: "SCENARIO SIMULATION: 통제된 T001-T003 증거를 보수적으로 해석하는 프론트엔드 예시입니다. 전역 우위를 입증하지 않습니다.",
    metrics: {
      precisionAt5: "NOT LIVE DATA",
      doiAccuracy: "NOT LIVE DATA",
      topJournalPrecision: "NOT LIVE DATA",
      hallucinationRate: "NOT LIVE DATA",
      reportCompleteness: "SIMULATED",
      avgLatency: "SIMULATED"
    },
    rows: [
      { metric: "Precision@5", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "MOCK BLUEPRINT: 통제 증거 로드 전의 시각화 구조입니다." },
      { metric: "NDCG@5", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "SCENARIO SIMULATION: 검증된 성능 비교가 아닙니다." },
      { metric: "DOI Accuracy", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "Crossref 검증 경로를 설명하는 예시이며 전역 정확도 주장이 아닙니다." }
    ],
    bars: [
      { label: "Precision", value: 13 },
      { label: "NDCG", value: 36 },
      { label: "DOI Hits", value: 19 }
    ]
  },
  {
    key: "broad",
    label: "넓은 탐색 평가 (Broad Recall)",
    description: "연구 초기 단계에서 관련 후보 논문을 폭넓게 확보하는 능력을 봅니다.",
    limitation: "넓게 찾는 성능(Recall)이 최종 연구 인용 정확성(Precision)을 보장하지 않습니다.",
    announcement: "SCENARIO SIMULATION: 넓은 탐색 관점을 설명하는 프론트엔드 예시입니다. 검증된 성능 주장이 아닙니다.",
    metrics: {
      precisionAt5: "NOT LIVE DATA",
      doiAccuracy: "NOT LIVE DATA",
      topJournalPrecision: "NOT LIVE DATA",
      hallucinationRate: "NOT LIVE DATA",
      reportCompleteness: "SIMULATED",
      avgLatency: "SIMULATED"
    },
    rows: [
      { metric: "Precision@5", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "MOCK BLUEPRINT: 넓은 탐색 시나리오 구조입니다." },
      { metric: "NDCG@5", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "SCENARIO SIMULATION: 검증된 랭킹 결과가 아닙니다." },
      { metric: "DOI Accuracy", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "Crossref 경로의 계획된 해석 예시입니다." }
    ],
    bars: [
      { label: "Recall/Broad", value: 65 },
      { label: "NDCG", value: 65 },
      { label: "DOI Hits", value: 45 }
    ]
  },
  {
    key: "demo",
    label: "빠른 시연 평가 (Fast Demo)",
    description: "발표 시 제한된 시간 안에 시스템의 12단계 흐름을 보여주기 위한 빠른 설정입니다.",
    limitation: "시연용 성공 지표는 전체 20-task 벤치마크 성능과 다를 수 있습니다.",
    announcement: "SCENARIO SIMULATION: 발표 흐름을 설명하는 프론트엔드 예시입니다. 전체 파이프라인 검증 완료를 의미하지 않습니다.",
    metrics: {
      precisionAt5: "NOT LIVE DATA",
      doiAccuracy: "NOT LIVE DATA",
      topJournalPrecision: "NOT LIVE DATA",
      hallucinationRate: "NOT LIVE DATA",
      reportCompleteness: "SIMULATED",
      avgLatency: "SIMULATED"
    },
    rows: [
      { metric: "Workflow 완료율", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "MOCK BLUEPRINT: 12단계 시연 구조이며 완료율 검증 결과가 아닙니다." },
      { metric: "응답 속도", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "SCENARIO SIMULATION: 실제 latency 측정값이 아닙니다." },
      { metric: "출력 안정성", ruleBased: "SIMULATED", singleLlm: "SIMULATED", proposed: "SIMULATED", finding: "계획된 fallback 설명이며 전체 안정성 검증 완료를 의미하지 않습니다." }
    ],
    bars: [
      { label: "Completion", value: 100 },
      { label: "Speed", value: 85 },
      { label: "Stability", value: 95 }
    ]
  }
];

export const evaluationRubrics: LiteraturePreviewItem[] = [
  { title: "Relevance", body: "사용자 연구 주제와 논문 초록, 이론, 방법론이 얼마나 직접 연결되는가?" },
  { title: "Validity", body: "논문이 실제 존재하며 DOI, 저널명, 저자, 연도가 정확히 검증되었는가?" },
  { title: "저널 품질", body: "Q1, 내부 allowlist, FT50, ABS 등 품질 기준에 부합하는가?" },
  { title: "활용 가능성", body: "서론, 이론적 배경, 가설 개발, 변수 조작화에 활용 가능한가?" },
  { title: "Gap 명확성", body: "기존 연구와 사용자 연구의 차별점 및 research gap이 명확한가?" },
  { title: "근거 추적 가능성", body: "추천 이유와 점수 산출 근거가 검증 가능한 데이터에 기반하는가?" }
];
