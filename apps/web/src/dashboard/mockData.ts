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
  q1Status: "Q1 verified" | "Q1 candidate" | "Manual review";
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
};

export type EvaluationScenarioKey = "strict" | "broad" | "fast";

export type EvaluationScenario = {
  key: EvaluationScenarioKey;
  label: string;
  metrics: {
    precisionAt5: string;
    doiAccuracy: string;
    topJournalPrecision: string;
    hallucinationRate: string;
    reportCompleteness: string;
    avgLatency: string;
  };
  rows: Array<{
    metric: string;
    ruleBased: string;
    singleLlm: string;
    proposed: string;
    finding: string;
  }>;
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
  { status: "live", label: "구현됨", detail: "실제 Worker/D1/R2/API 또는 배포된 기능과 연결됨" },
  { status: "partial", label: "부분 구현", detail: "일부 실제 기능이 있으나 화면의 일부는 정적 데이터 또는 추가 연결 필요" },
  { status: "mock", label: "미완성 Mock", detail: "실제 결과가 아니며 API/DB 연결 전의 자리표시자" },
  { status: "planned", label: "미구현", detail: "설계상 필요하지만 아직 코드/인프라 연결 전" }
];

export const researchImplementationStatus: FeatureImplementationItem[] = [
  { feature: "Run / Search Job", status: "live", evidence: "POST /api/search-jobs, GET /api/search-jobs/:id polling", next: "실제 벤치마크 태스크 실행 도구와 연동" },
  { feature: "Ranked Papers", status: "live", evidence: "Worker 결과 papers 배열, D1 papers/evaluations 기반", next: "Gold overlap 지표 표시 강화" },
  { feature: "Paper Detail", status: "live", evidence: "Crossref, Unpaywall, score breakdown 표시", next: "Critic 에이전트 상세 분석 연동" },
  { feature: "Report Preview", status: "live", evidence: "GET /api/search-jobs/:id/report.md", next: "R2 저장 PDF/XLSX 다운로드 연동" },
  { feature: "12-step Workflow Panel", status: "live", evidence: "agent_traces API 실시간 연동 완료", next: "상세 로그 드릴다운 추가" },
  { feature: "Top Journal Pool Panel", status: "partial", evidence: "내부 저널 allowlist 필터링은 구현됨 (S/A1급)", next: "외부 JCR/SCImago/Q1 API 실시간 연동 예정" },
  { feature: "Literature Review Preview Cards", status: "mock", evidence: "미완성 Mock: 실제 Report Agent section 연결 전", next: "Report Agent section API 연결" }
];

export const opsImplementationStatus: FeatureImplementationItem[] = [
  { feature: "MCP Worker", status: "live", evidence: "paper-agent-mcp /mcp read-only tools 배포 완료", next: "agent trace 조회 tool 추가" },
  { feature: "D1 / R2 Runtime", status: "live", evidence: "search_jobs, papers, evaluations, R2 reports 저장", next: "실시간 스토리지 용량 모니터링" },
  { feature: "Agent Status Board", status: "live", evidence: "GET /api/search-jobs/:id/traces 기반 D1 trace 표시", next: "실시간 에이전트 상태 전이 감시" },
  { feature: "Tool Call Console", status: "partial", evidence: "agent_traces summary를 console log로 표시 (Raw 로그 아님)", next: "개별 외부 API request/response 상세 로그 저장" },
  { feature: "Vectorize Status", status: "planned", evidence: "UI 위치만 확보 (Production 미적용)", next: "Vectorize index와 embedding relevance 구현" },
  { feature: "Google Drive PDF Archive", status: "partial", evidence: "Unpaywall 확인된 OA PDF 한정 Drive 업로드", next: "Drive 공유 정책 및 실패 재시도 UI 추가" },
  { feature: "Critic Review", status: "live", evidence: "D1 critic_flags 기반 rule-based 리스크 표시", next: "LLM Critic 정성적 분석 내용 연동" }
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
  { id: "embedding", order: 8, title: "Vectorize", owner: "Relevance Agent", status: "idle", progress: 42, detail: "미구현: Vectorize 기반 의미론적 유사도 계산 예정" },
  { id: "ranking", order: 9, title: "Ranking", owner: "Ranking Agent", status: "idle", progress: 40, detail: "구현됨: 다중 지표 기반 가중 정렬" },
  { id: "critic", order: 10, title: "Critic", owner: "Critic Agent", status: "review", progress: 34, detail: "구현됨: Rule-based 리스크 플래그 생성" },
  { id: "report", order: 11, title: "Report", owner: "Report Agent", status: "idle", progress: 20, detail: "구현됨: Markdown 및 기본 PDF/XLSX 생성" },
  { id: "delivery", order: 12, title: "Delivery", owner: "Dashboard", status: "idle", progress: 10, detail: "구현됨: 인터랙티브 UI 기반 결과 인도" }
];


export const topJournalPool: JournalPoolGroup[] = [
  {
    field: "공통 / Strategy",
    rank: "International S",
    q1Status: "Q1 verified",
    journals: ["Academy of Management Journal", "Strategic Management Journal", "Administrative Science Quarterly"]
  },
  {
    field: "조직 인사",
    rank: "International S",
    q1Status: "Q1 verified",
    journals: ["Journal of Applied Psychology", "Personnel Psychology", "Organization Science"]
  },
  {
    field: "마케팅",
    rank: "International S",
    q1Status: "Q1 verified",
    journals: ["Journal of Marketing", "Journal of Marketing Research", "Marketing Science", "Journal of Consumer Research"]
  },
  {
    field: "경영정보",
    rank: "International A1",
    q1Status: "Q1 verified",
    journals: ["MIS Quarterly", "Information Systems Research", "Journal of Management Information Systems"]
  },
  {
    field: "회계 / 재무",
    rank: "International A1",
    q1Status: "Q1 candidate",
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
  { name: "Google Drive", status: "부분 구현", detail: "OA PDF service-account upload path 연결됨", tone: "amber" },
  { name: "Vectorize", status: "미완성", detail: "abstract embedding index 연결 전", tone: "blue" },
  { name: "Remote MCP", status: "온라인", detail: "paper-agent-mcp /mcp", tone: "purple" },
  { name: "Pages UI", status: "부분 구현", detail: "Research/Ops/Evaluation route 연결됨; 일부 planned 패널 유지", tone: "amber" }
];

export const criticReviews: CriticReviewItem[] = [
  { title: "인접 저널 모호성", severity: "medium", note: "Top Journal Pool에는 없지만 Q1 인접 분야로 분류되어 rule-based critic 확인이 필요합니다." },
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
    label: "엄격 Top Journal",
    metrics: { precisionAt5: "33.3%", doiAccuracy: "100%", topJournalPrecision: "100%", hallucinationRate: "0%", reportCompleteness: "85%", avgLatency: "145s" },
    rows: [
      { metric: "Precision@5", ruleBased: "15%", singleLlm: "22%", proposed: "33.3%", finding: "Proposed Agent가 S급 저널 매칭에서 우수한 성과를 보입니다." },
      { metric: "Paper Validity Rate", ruleBased: "85%", singleLlm: "60%", proposed: "100%", finding: "Crossref 검증을 통해 실존하지 않는 논문을 완벽히 필터링합니다." },
      { metric: "DOI Accuracy", ruleBased: "70%", singleLlm: "40%", proposed: "100%", finding: "생성형 AI의 고질적인 DOI 환각 문제를 해결했습니다." },
      { metric: "Top Journal Precision", ruleBased: "90%", singleLlm: "80%", proposed: "100%", finding: "경영대학 allowlist 기반 엄격한 품질 관리가 적용됩니다." },
      { metric: "Hallucination Rate", ruleBased: "5%", singleLlm: "35%", proposed: "0%", finding: "검증 파이프라인을 통해 지식 왜곡 가능성을 최소화합니다." },
      { metric: "Report Completeness", ruleBased: "40%", singleLlm: "70%", proposed: "85%", finding: "Multi-agent 협업으로 체계적인 리포트 섹션을 생성합니다." }
    ],
    bars: [
      { label: "Precision", value: 33 },
      { label: "NDCG", value: 56 },
      { label: "Validity", value: 100 },
      { label: "DOI Accuracy", value: 100 },
      { label: "Top Journal", value: 100 }
    ]
  },
  {
    key: "broad",
    label: "확장 Q1 검색",
    metrics: { precisionAt5: "미완성", doiAccuracy: "미완성", topJournalPrecision: "미완성", hallucinationRate: "미완성", reportCompleteness: "미완성", avgLatency: "미완성" },
    rows: [
      { metric: "Precision@5", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Paper Validity Rate", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "DOI Accuracy", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Top Journal Precision", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Hallucination Rate", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Report Completeness", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." }
    ],
    bars: [
      { label: "Relevance", value: 0 },
      { label: "Validity", value: 0 },
      { label: "DOI Accuracy", value: 0 },
      { label: "Top Journal Precision", value: 0 },
      { label: "Report Completeness", value: 0 }
    ]
  },
  {
    key: "fast",
    label: "빠른 Demo Mode",
    metrics: { precisionAt5: "미완성", doiAccuracy: "미완성", topJournalPrecision: "미완성", hallucinationRate: "미완성", reportCompleteness: "미완성", avgLatency: "미완성" },
    rows: [
      { metric: "Precision@5", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Paper Validity Rate", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "DOI Accuracy", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Top Journal Precision", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Hallucination Rate", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." },
      { metric: "Report Completeness", ruleBased: "미완성", singleLlm: "미완성", proposed: "미완성", finding: "baseline CSV와 proposed full-run 결과 연결 전입니다." }
    ],
    bars: [
      { label: "Relevance", value: 0 },
      { label: "Validity", value: 0 },
      { label: "DOI Accuracy", value: 0 },
      { label: "Top Journal Precision", value: 0 },
      { label: "Report Completeness", value: 0 }
    ]
  }
];

export const evaluationRubrics: LiteraturePreviewItem[] = [
  { title: "Relevance", body: "사용자 연구 주제와 논문 초록, 이론, 방법론이 얼마나 직접 연결되는가?" },
  { title: "Validity", body: "논문이 실제 존재하며 DOI, 저널명, 저자, 연도가 정확히 검증되었는가?" },
  { title: "저널 품질", body: "Q1, Top Journal Pool, FT50, ABS 등 품질 기준에 부합하는가?" },
  { title: "활용 가능성", body: "서론, 이론적 배경, 가설 개발, 변수 조작화에 활용 가능한가?" },
  { title: "Gap 명확성", body: "기존 연구와 사용자 연구의 차별점 및 research gap이 명확한가?" },
  { title: "근거 추적 가능성", body: "추천 이유와 점수 산출 근거가 검증 가능한 데이터에 기반하는가?" }
];
