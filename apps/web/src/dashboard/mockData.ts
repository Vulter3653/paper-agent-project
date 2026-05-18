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
  { status: "mock", label: "Mock", detail: "최종 UI 기준의 정적 데이터이며 실제 API 연결 전" },
  { status: "planned", label: "미구현", detail: "설계상 필요하지만 아직 코드/인프라 연결 전" }
];

export const researchImplementationStatus: FeatureImplementationItem[] = [
  { feature: "Run / Search Job", status: "live", evidence: "POST /api/search-jobs, GET /api/search-jobs/:id polling", next: "Benchmark full-run 결과와 연결" },
  { feature: "Ranked Papers", status: "live", evidence: "Worker 결과 papers 배열, D1 papers/evaluations 기반", next: "Gold overlap 지표 추가" },
  { feature: "Paper Detail", status: "live", evidence: "Crossref, Unpaywall, score breakdown 표시", next: "Critic note 저장 후 연결" },
  { feature: "Report Preview", status: "live", evidence: "GET /api/search-jobs/:id/report.md", next: "PDF/XLSX output 추가" },
  { feature: "12-step Workflow Panel", status: "mock", evidence: "최종 UI 기준 정적 단계 데이터", next: "agent_traces table 연결" },
  { feature: "Top Journal Pool Panel", status: "partial", evidence: "저널 allowlist는 실제 shared data, 화면 풀 표시는 축약 mock", next: "shared category 전체 표시" },
  { feature: "Literature Review Preview Cards", status: "mock", evidence: "정적 preview 문구", next: "Report Agent section API 연결" }
];

export const opsImplementationStatus: FeatureImplementationItem[] = [
  { feature: "MCP Worker", status: "live", evidence: "paper-agent-mcp /mcp read-only tools 배포 완료", next: "agent trace 조회 tool 추가" },
  { feature: "D1 / R2 Runtime", status: "live", evidence: "search_jobs, papers, evaluations, R2 reports 저장", next: "화면 상태를 diagnostics/API로 연결" },
  { feature: "Agent Status Board", status: "mock", evidence: "정적 agentStatuses 데이터", next: "agent_traces table과 연결" },
  { feature: "Tool Call Console", status: "mock", evidence: "정적 toolCallLogs 및 클릭 이벤트", next: "실제 Worker step/tool log 저장" },
  { feature: "Vectorize Status", status: "planned", evidence: "UI 위치만 확보", next: "Vectorize index와 embedding relevance 구현" },
  { feature: "Google Drive PDF Archive", status: "planned", evidence: "UI 위치만 확보", next: "OA PDF만 Drive 저장 및 drive_file_id 저장" },
  { feature: "Critic Review", status: "mock", evidence: "정적 critic review cards", next: "Critic Agent flags/risk_level 저장" }
];

export const evaluationImplementationStatus: FeatureImplementationItem[] = [
  { feature: "Benchmark Fixtures", status: "live", evidence: "20 tasks, 60 gold rows, verification/refinement scripts", next: "verified gold 40개 이상 확보" },
  { feature: "Proposed Agent Runner", status: "live", evidence: "benchmark:run-proposed smoke run 완료", next: "20 task full run" },
  { feature: "Baseline Evaluation UI", status: "mock", evidence: "정적 scenario 수치", next: "benchmark_summary 결과 JSON/API 연결" },
  { feature: "Rule-based Baseline", status: "planned", evidence: "평가 설계만 존재", next: "baseline_results.csv 생성" },
  { feature: "Single LLM Baseline", status: "planned", evidence: "평가 설계만 존재", next: "LLM 추천 결과와 hallucination 검증" },
  { feature: "Precision@5 / DOI Accuracy", status: "partial", evidence: "지표 정의와 gold 검증 workflow 존재", next: "proposed_agent_results.csv와 gold overlap 계산" },
  { feature: "Dashboard Metric Binding", status: "planned", evidence: "현재 mockData.ts 수치 사용", next: "실제 benchmark results loader/API 추가" }
];

export const literatureWorkflowStages: WorkflowStage[] = [
  { id: "planner", order: 1, title: "Planner", owner: "Planner Agent", status: "done", progress: 100, detail: "연구 질문을 키워드와 하위 질문으로 분해" },
  { id: "journal_selector", order: 2, title: "Journal Pool", owner: "Journal Selector", status: "done", progress: 100, detail: "경영대학 학술지 목록의 S/A1 우선순위 적용" },
  { id: "retriever", order: 3, title: "Search", owner: "Retriever Agent", status: "done", progress: 100, detail: "WoS 또는 OpenAlex 후보 논문 검색" },
  { id: "verifier", order: 4, title: "Crossref", owner: "Verifier Agent", status: "done", progress: 96, detail: "DOI, 제목, 저자, 연도, 저널명 교차 검증" },
  { id: "download", order: 5, title: "OA PDF", owner: "Download Agent", status: "running", progress: 72, detail: "Unpaywall OA PDF와 landing page 확인" },
  { id: "storage", order: 6, title: "Drive / R2", owner: "Storage Worker", status: "running", progress: 68, detail: "Google Drive와 Cloudflare R2 output 상태 확인" },
  { id: "evaluation", order: 7, title: "Journal Eval", owner: "Evaluation Agent", status: "done", progress: 88, detail: "Q1, Top Journal, FT50, SCImago 기준 평가" },
  { id: "embedding", order: 8, title: "Vectorize", owner: "Relevance Agent", status: "idle", progress: 42, detail: "초록 embedding similarity와 관련성 점수 산출" },
  { id: "ranking", order: 9, title: "Ranking", owner: "Ranking Agent", status: "idle", progress: 40, detail: "관련성, 저널 품질, 인용 수, 최신성 결합" },
  { id: "critic", order: 10, title: "Critic", owner: "Critic Agent", status: "review", progress: 34, detail: "오류, 과대평가, 환각 가능성 재검토" },
  { id: "report", order: 11, title: "Report", owner: "Report Agent", status: "idle", progress: 20, detail: "PDF 보고서, Markdown preview, Excel output 생성" },
  { id: "delivery", order: 12, title: "Delivery", owner: "Dashboard", status: "idle", progress: 10, detail: "D1 job 상태와 다운로드 링크를 사용자에게 표시" }
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
  { level: "muted", message: 'create_search_job keyword="AI interview employer branding"' },
  { level: "ok", message: "D1.insert search_jobs status=running" },
  { level: "ok", message: "JournalSelector loaded approved business-school journal pool" },
  { level: "ok", message: "Crossref.verify DOI matched 96% of candidates" },
  { level: "warn", message: "Unpaywall found OA landing page without PDF for 3 records" },
  { level: "ok", message: "R2.put report.pdf papers.xlsx literature-review.md" }
];

export const systemStatuses: SystemStatus[] = [
  { name: "Cloudflare D1", status: "Connected", detail: "search_jobs / papers / evaluations", tone: "green" },
  { name: "Cloudflare R2", status: "Ready", detail: "paper-agent-outputs bucket", tone: "green" },
  { name: "Google Drive", status: "Queued", detail: "OA PDF archive target", tone: "amber" },
  { name: "Vectorize", status: "Planned", detail: "abstract embedding index", tone: "blue" },
  { name: "Remote MCP", status: "Online", detail: "paper-agent-mcp /mcp", tone: "purple" },
  { name: "Pages UI", status: "Deployed", detail: "dashboard route shell", tone: "green" }
];

export const criticReviews: CriticReviewItem[] = [
  { title: "Adjacent journal ambiguity", severity: "medium", note: "Top Journal Pool에는 없지만 Q1 인접 분야로 분류되어 수동 검토가 필요합니다." },
  { title: "OA PDF unavailable", severity: "low", note: "PDF URL이 없으면 landing page와 metadata 기반 요약으로 대체합니다." },
  { title: "Metadata mismatch", severity: "high", note: "제목, 저자, 연도 불일치가 있으면 Crossref 재검증 후 제외 후보로 이동합니다." }
];

export const literaturePreview: LiteraturePreviewItem[] = [
  { title: "Summary", body: "AI 면접 공개와 자동화된 선발 경험이 지원자의 신뢰, 공정성 인식, 고용주 브랜드 평가에 미치는 영향을 정리합니다." },
  { title: "Commonality", body: "대부분의 연구는 알고리즘 투명성, 절차적 공정성, 기술 수용성을 핵심 매개 요인으로 다룹니다." },
  { title: "Difference", body: "마케팅 저널은 브랜드 반응을, HRM/조직 저널은 지원자 경험과 선발 공정성을 더 강하게 설명합니다." },
  { title: "Research Gap", body: "AI 사용 공개 수준과 employer branding 간의 인과적 연결을 top journal 근거로 검증한 연구는 제한적입니다." },
  { title: "Critic Note", body: "인접 분야 Q1 논문은 보조 근거로 유지하고, 핵심 가설 개발은 S급 및 A1급 저널 우선으로 제한합니다." },
  { title: "Use in Paper", body: "서론 문제제기, 이론적 배경, 가설 개발, 변수 조작화 근거로 연결할 수 있습니다." }
];

export const evaluationScenarios: EvaluationScenario[] = [
  {
    key: "strict",
    label: "Strict Top Journal",
    metrics: { precisionAt5: "0.84", doiAccuracy: "96%", topJournalPrecision: "88%", hallucinationRate: "3%", reportCompleteness: "92%", avgLatency: "4.8m" },
    rows: [
      { metric: "Precision@5", ruleBased: "0.52", singleLlm: "0.68", proposed: "0.84", finding: "상위 추천 논문의 실제 관련성이 가장 높음" },
      { metric: "Paper Validity Rate", ruleBased: "82%", singleLlm: "74%", proposed: "97%", finding: "DOI / Crossref 검증으로 허위 논문 감소" },
      { metric: "DOI Accuracy", ruleBased: "80%", singleLlm: "71%", proposed: "96%", finding: "Verifier Agent가 DOI와 서지정보를 교차 확인" },
      { metric: "Top Journal Precision", ruleBased: "58%", singleLlm: "66%", proposed: "88%", finding: "Top Journal Pool과 Q1 기준을 함께 사용" },
      { metric: "Hallucination Rate", ruleBased: "8%", singleLlm: "21%", proposed: "3%", finding: "Critic Agent와 Crossref 검증으로 오류 감소" },
      { metric: "Report Completeness", ruleBased: "61%", singleLlm: "78%", proposed: "92%", finding: "Summary, Commonality, Difference, Gap, Critic Note 포함" }
    ],
    bars: [
      { label: "Relevance", value: 84 },
      { label: "Validity", value: 97 },
      { label: "DOI Accuracy", value: 96 },
      { label: "Top Journal Precision", value: 88 },
      { label: "Report Completeness", value: 92 }
    ]
  },
  {
    key: "broad",
    label: "Broad Q1 Search",
    metrics: { precisionAt5: "0.79", doiAccuracy: "94%", topJournalPrecision: "81%", hallucinationRate: "4%", reportCompleteness: "89%", avgLatency: "3.9m" },
    rows: [
      { metric: "Precision@5", ruleBased: "0.48", singleLlm: "0.65", proposed: "0.79", finding: "검색 범위가 넓어져 관련도는 소폭 하락" },
      { metric: "Paper Validity Rate", ruleBased: "80%", singleLlm: "76%", proposed: "95%", finding: "검증 단계로 논문 실재성 유지" },
      { metric: "DOI Accuracy", ruleBased: "78%", singleLlm: "73%", proposed: "94%", finding: "Crossref matching이 핵심 안전장치로 작동" },
      { metric: "Top Journal Precision", ruleBased: "50%", singleLlm: "59%", proposed: "81%", finding: "Q1 중심 검색에서 pool precision은 다소 낮아짐" },
      { metric: "Hallucination Rate", ruleBased: "9%", singleLlm: "18%", proposed: "4%", finding: "Critic 검증으로 오류를 낮게 유지" },
      { metric: "Report Completeness", ruleBased: "58%", singleLlm: "76%", proposed: "89%", finding: "비교 분석과 gap 도출이 유지됨" }
    ],
    bars: [
      { label: "Relevance", value: 79 },
      { label: "Validity", value: 95 },
      { label: "DOI Accuracy", value: 94 },
      { label: "Top Journal Precision", value: 81 },
      { label: "Report Completeness", value: 89 }
    ]
  },
  {
    key: "fast",
    label: "Fast Demo Mode",
    metrics: { precisionAt5: "0.73", doiAccuracy: "91%", topJournalPrecision: "77%", hallucinationRate: "6%", reportCompleteness: "83%", avgLatency: "1.6m" },
    rows: [
      { metric: "Precision@5", ruleBased: "0.44", singleLlm: "0.61", proposed: "0.73", finding: "시연 속도를 위해 일부 검증을 축약" },
      { metric: "Paper Validity Rate", ruleBased: "76%", singleLlm: "70%", proposed: "91%", finding: "빠른 모드에서도 DOI 검증은 유지" },
      { metric: "DOI Accuracy", ruleBased: "74%", singleLlm: "68%", proposed: "91%", finding: "metadata enrichment를 제한적으로 수행" },
      { metric: "Top Journal Precision", ruleBased: "49%", singleLlm: "55%", proposed: "77%", finding: "Top journal 판단은 캐시 기반으로 수행" },
      { metric: "Hallucination Rate", ruleBased: "11%", singleLlm: "23%", proposed: "6%", finding: "검증 축약으로 오류율은 소폭 증가" },
      { metric: "Report Completeness", ruleBased: "52%", singleLlm: "72%", proposed: "83%", finding: "보고서 품질은 full mode보다 낮음" }
    ],
    bars: [
      { label: "Relevance", value: 73 },
      { label: "Validity", value: 91 },
      { label: "DOI Accuracy", value: 91 },
      { label: "Top Journal Precision", value: 77 },
      { label: "Report Completeness", value: 83 }
    ]
  }
];

export const evaluationRubrics: LiteraturePreviewItem[] = [
  { title: "Relevance", body: "사용자 연구 주제와 논문 초록, 이론, 방법론이 얼마나 직접 연결되는가?" },
  { title: "Validity", body: "논문이 실제 존재하며 DOI, 저널명, 저자, 연도가 정확히 검증되었는가?" },
  { title: "Journal Quality", body: "Q1, Top Journal Pool, FT50, ABS 등 품질 기준에 부합하는가?" },
  { title: "Usefulness", body: "서론, 이론적 배경, 가설 개발, 변수 조작화에 활용 가능한가?" },
  { title: "Gap Clarity", body: "기존 연구와 사용자 연구의 차별점 및 research gap이 명확한가?" },
  { title: "Evidence Traceability", body: "추천 이유와 점수 산출 근거가 검증 가능한 데이터에 기반하는가?" }
];
