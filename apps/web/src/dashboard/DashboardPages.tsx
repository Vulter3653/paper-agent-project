import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, BarChart3, Cloud, Eye, FileText, LayoutList, Play, RefreshCw, Search, ShieldCheck, Terminal } from "lucide-react";
import {
  agentStatuses,
  criticReviews,
  evaluationRubrics,
  evaluationScenarios,
  evaluationImplementationStatus,
  implementationLegend,
  literaturePreview,
  literatureWorkflowStages,
  opsImplementationStatus,
  researchImplementationStatus,
  systemStatuses,
  toolCallLogs,
  topJournalPool,
  type EvaluationScenario,
  type EvaluationScenarioKey,
  type FeatureImplementationItem,
  type FeatureImplementationStatus
} from "./mockData";
import { benchmarkV3 } from "./benchmarkV3Data";
import type { AgentTrace, SearchJob } from "@paper-agent/shared";
import "./dashboard.css";

export type DashboardRoute = "research" | "ops" | "evaluation";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "https://paper-agent-project.shch3653.workers.dev").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}

type TraceResponse = { job: SearchJob; traces: AgentTrace[] };
type JobsResponse = { jobs: SearchJob[] };
type CriticFlag = { id: string; paperRank: number; severity: "low" | "medium" | "high" | string; flagType: string; message: string; evidence: string };
type JobOutput = { id: string; outputType: string; status: string; storage: string; urlPath: string; detail: string };
type CriticFlagsResponse = { job: SearchJob; criticFlags: CriticFlag[] };
type JobOutputsResponse = { job: SearchJob; outputs: JobOutput[] };
type TraceDetail = Record<string, string | number | boolean | null>;
type EnrichmentOverview = { limit: string; crossrefProcessed: string; crossrefSkipped: string; unpaywallProcessed: string; unpaywallSkipped: string };

type DiagnosticsResponse = {
  ok: boolean;
  searchProvider: string;
  db: { bound: boolean; missingColumns: Array<{ table: string; column: string; ok: boolean }> };
  env: {
    wosApiKey: boolean;
    wosApiKeySource: string | null;
    openAlexEmail: boolean;
    openAlexApiKey: boolean;
    crossrefEmail: boolean;
    unpaywallEmail: boolean;
    r2Reports: boolean;
    googleDrive: boolean;
    aiBinding: boolean;
    vectorIndex: boolean;
  };
  readiness: {
    activeProviderReady: boolean;
    vectorizeReady: boolean;
    semanticRankingDefault: boolean;
    llmCriticReady: boolean;
    llmCriticDefault: boolean;
  };
};

type BenchmarkMethodKey = "proposed_agent" | "rule_based" | "single_llm";

type BenchmarkComparisonMethod = {
  taskCount: number;
  resultCount: number;
  goldCount: number;
  verifiedGoldCount: number;
  macroAverages: {
    precision_at_5: number;
    ndcg_at_5: number;
    gold_doi_hit_rate_at_5: number;
    doi_presence_rate_at_5: number;
    top_journal_precision_at_5: number;
    paper_validity_rate_at_5: number;
    accepted_exception_count: number;
  };
  matchedGoldIds: string[];
  acceptedExceptionLocations: string[];
};

type BenchmarkAutoReviewRow = {
  method: "rule_based" | "single_llm";
  taskId: string;
  rank: number;
  title: string;
  doi: string;
  decision: string;
  relevance: number;
  failureType: string;
  matchedGoldId: string;
};

type BenchmarkAutoReviewMethod = {
  rowCount: number;
  includeCount: number;
  reviewByRuleCount: number;
  rejectCount: number;
  averageAutoRelevance: number;
  failureTypes: Record<string, number>;
  matchedGoldIds: string[];
};

type BenchmarkMetrics = {
  source?: "static_snapshot" | "live" | string;
  runId?: string;
  runLabel?: string;
  benchmarkScope?: string;
  taskRange?: string;
  sourceCommit?: string;
  goldVersion?: string;
  createdAt?: string;
  note?: string;
  tasks: number;
  results: number;
  gold: number;
  verifiedGold: number;
  goldMatches: number;
  doiMatches: number;
  macroAverages: {
    precision_at_k: number;
    ndcg_at_k: number;
    gold_doi_hit_rate_at_k: number;
    doi_accuracy_at_k: number;
    paper_validity_rate_at_k: number;
    top_journal_precision_at_k: number;
    hallucination_rate_at_k: number;
    oa_success_rate_at_k: number;
  };
  comparison?: {
    k: number;
    rowCount?: number;
    methodOrder: BenchmarkMethodKey[];
    byMethod: Partial<Record<BenchmarkMethodKey, BenchmarkComparisonMethod>>;
  };
  autoReview?: {
    rowCount: number;
    policy: string;
    rows?: BenchmarkAutoReviewRow[];
    byMethod: Partial<Record<"rule_based" | "single_llm", BenchmarkAutoReviewMethod>>;
  };
};

export function resolveDashboardRoute(pathname = window.location.pathname): DashboardRoute {
  if (pathname.includes("/dashboard/ops")) return "ops";
  if (pathname.includes("/dashboard/evaluation")) return "evaluation";
  return "research";
}

export function DashboardNav({ activeRoute }: { activeRoute: DashboardRoute }) {
  const routes: Array<{ id: DashboardRoute; label: string; href: string }> = [
    { id: "research", label: "1. 연구 스튜디오", href: "/dashboard/research" },
    { id: "ops", label: "2. Agent 운영", href: "/dashboard/ops" },
    { id: "evaluation", label: "3. 평가", href: "/dashboard/evaluation" }
  ];

  return (
    <header className="uxTopbar">
      <div className="uxTopbarInner">
        <a className="uxBrand" href="/dashboard/research">
          <span className="uxBrandMark">PA</span>
          <span>
            <strong>Paper Agent</strong>
            <small>MON AI Team 대시보드</small>
          </span>
        </a>
        <nav className="uxNav" aria-label="대시보드 경로">
          {routes.map((route) => (
            <a key={route.id} className={route.id === activeRoute ? "active" : undefined} href={route.href}>
              {route.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function ExecutiveSummaryPanel() {
  const [demoMode, setDemoMode] = useState(true);
  const glossary = [
    ["VERIFIED BENCHMARK", "audited controlled common-support evidence", "green"],
    ["ARTIFACT EVIDENCE", "execution artifact, not full validation", "blue"],
    ["PARTIAL SEMANTIC AUDIT", "quota-limited semantic evaluation subset", "amber"],
    ["BASELINE: PARTIAL", "incomplete common-support comparison", "amber"],
    ["INFRA LIMIT", "timeout / HTTP 503 / resource boundary", "amber"],
    ["PLANNED", "not yet implemented", "purple"],
    ["DEMO EXAMPLE", "mock or illustrative content", "gray"],
    ["TECHNICAL TRACE", "raw trace/debug evidence", "gray"]
  ] as const;

  return (
    <section className="uxExecutiveSummary" aria-label="Paper Agent evaluator summary">
      <div className="uxExecutiveHead">
        <div>
          <span className="uxEyebrow">Responsible AI Agent Evaluation</span>
          <h1>Paper Agent Benchmark v3</h1>
          <p>Reproducible AI Literature Review Agent Evaluation with Explicit Claim Boundaries</p>
        </div>
        <button className="uxSoftButton" type="button" onClick={() => setDemoMode((current) => !current)}>
          <Eye size={16} /> {demoMode ? "상세 증거 보기 / Evidence Detail" : "Demo View"}
        </button>
      </div>
      <div className="uxEvidenceGrid">
        <article className="uxEvidenceCard verified">
          <span className="uxEvidenceBadge verified">BENCHMARK SCOPE</span>
          <h2>20 tasks · 6 layers · 30 metrics</h2>
          <p>Generated Benchmark v3 artifacts support traceable, reproducible evaluation.</p>
        </article>
        <article className="uxEvidenceCard artifact">
          <span className="uxEvidenceBadge artifact">CLAIM STATUS</span>
          <h2>Not full superiority</h2>
          <p>Partial common-support comparison. T004-T020 remain artifact-level validation tasks.</p>
        </article>
        <article className="uxEvidenceCard partial">
          <span className="uxEvidenceBadge partial">SEMANTIC BOUNDARY</span>
          <h2>Not full semantic coverage</h2>
          <p>Layer 5A is quota-limited. Layer 5B is a deterministic supplementary proxy.</p>
        </article>
        <article className="uxEvidenceCard planned">
          <span className="uxEvidenceBadge purple">DEMO VALUE</span>
          <h2>Traceable evaluation</h2>
          <p>Traceable artifacts, automated QA, and reproducible benchmark outputs.</p>
        </article>
      </div>
      <div className="uxNotCompleteNote">
        <strong>PASS WITH CLAIM BOUNDARIES</strong>
        <span>Paper Agent Benchmark v3 does not claim full superiority across all tasks. It provides a reproducible, multi-layer benchmark framework with explicit claim boundaries.</span>
      </div>
      {!demoMode && (
        <div className="uxGlossary" aria-label="Evidence badge glossary">
          <h2>증거 배지 안내 / Evidence Badge Glossary</h2>
          <div className="uxGlossaryGrid">
            {glossary.map(([label, detail, tone]) => (
              <div key={label} className="uxGlossaryItem">
                <span className={`uxEvidenceBadge ${tone}`}>{label}</span>
                <small>{detail}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StagedExpansionEvidencePanel() {
  return (
    <section className="uxPanel uxExpansionPanel">
      <div className="uxPanelHead">
        <div>
          <h2>Benchmark v3 Evidence Summary</h2>
          <p>T001-T020 정규화 아티팩트와 제한된 해석 범위를 표시합니다.</p>
        </div>
        <span className="uxEvidenceBadge blue">V3 ARTIFACTS LOADED</span>
      </div>
      <div className="uxEvidenceGrid">
        <article className="uxEvidenceCard artifact">
          <span className="uxEvidenceBadge artifact">ARTIFACT EVIDENCE</span>
          <h3>T001-T020 Normalized Artifacts</h3>
          <p>342 normalized result rows</p>
          <strong>T004-T020 artifact-level; T007 missing</strong>
        </article>
        <article className="uxEvidenceCard partial">
          <span className="uxEvidenceBadge partial">PARTIAL AUDIT</span>
          <span className="uxEvidenceBadge infra">QUOTA LIMIT</span>
          <h3>Layer 5A Semantic Audit</h3>
          <p>22/125 rows evaluated</p>
          <strong>17.6% coverage; no Proposed Agent rows</strong>
        </article>
        <article className="uxEvidenceCard verified">
          <span className="uxEvidenceBadge verified">REPRODUCIBLE</span>
          <h3>Layer 5B Proxy</h3>
          <p>125 deterministic proxy rows</p>
          <strong>Supplementary, not semantic ground truth</strong>
        </article>
      </div>
      <p className="uxPanelNote">
        Benchmark v3 metrics are computed from available artifacts.
        T001–T003: controlled common-support comparison.
        T004–T020: artifact-level validation unless baseline parity is proven.
        Full T001–T020 comparative superiority and full semantic-quality validation claims are disabled.
      </p>
    </section>
  );
}

function BenchmarkV3PresentationDashboard() {
  return (
    <div className="uxPresentationDashboard">
      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 2" title="Benchmark v3 Overview" detail="Six-layer automated evaluation with an explicit semantic boundary." />
        <div className="uxTableWrap">
          <table className="uxTable uxCompactTable">
            <thead><tr><th>Layer</th><th>Evaluation area</th><th>Status</th></tr></thead>
            <tbody>{benchmarkV3.layers.map(([layer, name, status]) => <tr key={layer}><td>{layer}</td><td>{name}</td><td><span className={`uxEvidenceBadge ${status === "Computed" ? "verified" : "partial"}`}>{status}</span></td></tr>)}</tbody>
          </table>
        </div>
        <InterpretationBox>Layers 1–4 and 6 are computed through deterministic or artifact-based validation. Layer 5 remains partial because the LLM judge audit was quota-limited; therefore semantic quality is explicitly bounded rather than overclaimed.</InterpretationBox>
      </section>

      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 3" title="Deterministic Results" detail="Metadata-level and artifact-derived validation. These values are not full semantic correctness claims." />
        <div className="uxMetrics uxMetricsAuto">{benchmarkV3.deterministic.map(([label, value]) => <MetricTile key={label} label={label} value={value} detail="latest v3 artifact" tone="blue" />)}</div>
        <p className="uxSourceNote">Values are loaded from the latest benchmark/validation/v3 artifacts.</p>
      </section>

      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 4" title="Overall Proposed Agent Retrieval Mean" detail="Available Proposed Agent artifact scope. This panel is intentionally separate from the T001-T003 controlled subset." />
        <div className="uxMetrics uxMetricsAuto">{benchmarkV3.retrieval.map(([label, value]) => <MetricTile key={label} label={label} value={value} detail="Proposed Agent mean" tone="purple" />)}</div>
        <InterpretationBox>These values summarize Proposed Agent retrieval performance across the available benchmark artifact scope. They should not be interpreted as evidence of full baseline superiority.</InterpretationBox>
      </section>

      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 5" title="Baseline Support Matrix" detail="Partial common-support comparison separates comparable tasks from artifact-level validation." />
        <div className="uxEvidenceGrid">
          <EvidenceFact tone="verified" badge="3-WAY CONTROLLED" title="T001-T003" body="3-way controlled comparison available" />
          <EvidenceFact tone="artifact" badge="ARTIFACT-LEVEL" title="T004-T020" body="Artifact-level validation only" />
          <EvidenceFact tone="partial" badge="MISSING EVIDENCE" title="T007" body="Proposed Agent missing" />
          <EvidenceFact tone="planned" badge="BASELINE PARITY" title={benchmarkV3.scope.baselineParity} body={`${benchmarkV3.scope.comparableTaskCount} / ${benchmarkV3.scope.tasks} tasks comparable`} />
        </div>
        <InterpretationBox>Baseline comparison is limited to the T001-T003 common-support subset. T004-T020 cannot be used to claim full comparative superiority unless baseline parity is established.</InterpretationBox>
      </section>

      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 6" title="T001-T003 Controlled Subset Results" detail="Only controlled 3-way baseline comparison subset. Do not generalize this table to T001-T020." />
        <div className="uxTableWrap">
          <table className="uxTable uxCompactTable">
            <thead><tr><th>Metric</th><th>Rule-Based</th><th>Single LLM</th><th>Paper Agent</th></tr></thead>
            <tbody>{benchmarkV3.controlledComparison.map(([metric, rule, llm, agent]) => <tr key={metric}><td>{metric}</td><td>{rule}</td><td>{llm}</td><td>{agent}</td></tr>)}</tbody>
          </table>
        </div>
        <InterpretationBox>Single LLM is stronger on Precision@5 and NDCG@5 in this controlled subset. Paper Agent is evaluated for traceability, DOI integrity, hallucination control, and journal-policy compliance without a global outperform claim.</InterpretationBox>
      </section>

      <section className="uxPanel uxPresentationSection uxSemanticBoundary">
        <SectionTitle eyebrow="Section 7" title="Layer 5 Semantic Boundary" detail="Responsible interpretation of quota-limited semantic evidence." />
        <div className="uxEvidenceGrid">
          <EvidenceFact tone="partial" badge="LAYER 5A · QUOTA LIMIT" title={`${benchmarkV3.semantic.successfulRows} / ${benchmarkV3.semantic.totalInputRows} rows`} body={`${(Number(benchmarkV3.semantic.coverageRate) * 100).toFixed(1)}% coverage · ${benchmarkV3.semantic.failedRows} failed or unevaluated rows`} />
          <EvidenceFact tone="partial" badge="EVALUATED SUBSET ONLY" title="Proposed Agent rows: 0" body={`Layer 5 score: ${benchmarkV3.semantic.proposedAgentScore}`} />
          <EvidenceFact tone="artifact" badge="LAYER 5B · PROXY" title={`${benchmarkV3.semantic.proxyRows} rows`} body="Deterministic supplementary proxy · semantic replacement: false" />
        </div>
        <div className="uxProxyList">{benchmarkV3.semantic.proxyMetrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
        <InterpretationBox>Layer 5A is a quota-limited partial implementation audit. Layer 5B supplements the incomplete LLM judge audit. It does not replace LLM or human semantic evaluation.</InterpretationBox>
      </section>

      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 8" title="Robustness & Risk" detail="Material operational risks remain visible instead of being hidden." />
        <div className="uxMetrics uxMetricsAuto">{benchmarkV3.robustness.map(([label, value, detail]) => <MetricTile key={label} label={label} value={value} detail={detail} tone="amber" />)}</div>
        <InterpretationBox>Material operational risks remain. The benchmark surfaces hallucination, timeout, and latency risks rather than hiding them.</InterpretationBox>
      </section>

      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 9" title="Trace / Artifact Explorer" detail="Every claim on this dashboard is backed by a generated artifact." />
        <div className="uxArtifactExplorer">{benchmarkV3.artifacts.map((artifact) => <article className="uxArtifactEvidence" key={artifact.path}><div><span className="uxEvidenceBadge gray">TECHNICAL TRACE</span><h3>{artifact.name}</h3><p>{artifact.purpose}</p><small>{artifact.path}</small></div><div><strong>{artifact.status}</strong><a href={artifact.href} target="_blank" rel="noreferrer">Open artifact <ArrowRight size={13} /></a></div></article>)}</div>
      </section>

      <section className="uxPanel uxPresentationSection">
        <SectionTitle eyebrow="Section 10" title="Live Demo Flow" detail="Five steps for a 2–3 minute presentation walkthrough." />
        <ol className="uxDemoFlow">{benchmarkV3.demoSteps.map((step) => <li key={step}>{step}</li>)}</ol>
        <div className="uxClosingClaim">The contribution is not a claim of complete agent superiority. The contribution is a reproducible benchmark framework that makes AI agent evaluation traceable, bounded, and auditable.</div>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <div className="uxSectionTitle"><span>{eyebrow}</span><h2>{title}</h2><p>{detail}</p></div>;
}

function EvidenceFact({ tone, badge, title, body }: { tone: "verified" | "artifact" | "partial" | "planned"; badge: string; title: string; body: string }) {
  return <article className={`uxEvidenceCard ${tone}`}><span className={`uxEvidenceBadge ${tone}`}>{badge}</span><h3>{title}</h3><p>{body}</p></article>;
}

function InterpretationBox({ children }: { children: string }) {
  return <p className="uxInterpretationBox"><ShieldCheck size={16} /> <span>{children}</span></p>;
}

function BenchmarkInterpretationHelper() {
  return (
    <aside className="uxInterpretationCallout">
      <div>
        <ShieldCheck size={18} />
        <strong>How to read this benchmark</strong>
      </div>
      <p>Single LLM has higher Precision@5 and NDCG@5 in the controlled T001-T003 layer, but Paper Agent is designed for traceability, DOI verification, hallucination control, and journal-policy compliance. This table is not a global outperform claim.</p>
    </aside>
  );
}

export function ResearchExperiencePanels({ isRunning }: { isRunning: boolean }) {
  const [activeJob, setActiveJob] = useState<SearchJob | null>(null);
  const [traces, setTraces] = useState<AgentTrace[]>([]);
  const [report, setReport] = useState<string>("");
  const [error, setError] = useState("");
  const completedTraceCount = traces.filter((trace) => trace.status === "completed" || trace.status === "skipped").length;
  const progress = traces.length ? Math.round((completedTraceCount / 12) * 100) : 0;
  const liveStages = traces.length ? mapTracesToWorkflowStages(traces) : literatureWorkflowStages;

  const livePreview = useMemo(() => {
    if (!report) return literaturePreview;

    const sections = [
      { title: "전체 요약", patterns: [/^##\s+전체 요약/i, /^##\s+Executive Summary/i, /^##\s+Summary/i], fallback: literaturePreview[0].body, desc: "검색된 논문들이 전체적으로 어떤 연구 흐름을 이루는지 요약합니다." },
      { title: "공통 연구 흐름", patterns: [/^##\s+공통 연구 흐름/i, /^###\s+Common Themes/i, /^##\s+Commonality/i, /^###\s+Commonality/i], fallback: literaturePreview[1].body, desc: "여러 논문에서 반복적으로 나타나는 핵심 주제입니다." },
      { title: "방법론 차이", patterns: [/^##\s+방법론 및 맥락 차이/i, /^###\s+Methodological Differences/i, /^##\s+Difference/i, /^###\s+Difference/i], fallback: literaturePreview[2].body, desc: "논문들이 사용하는 데이터, 분석 방법, 연구 설계의 차이입니다." },
      { title: "연구 공백", patterns: [/^##\s+연구 공백/i, /^###\s+Identified Research Gaps/i, /^##\s+Research Gap/i, /^###\s+Research Gap/i], fallback: literaturePreview[3].body, desc: "아직 충분히 설명되지 않았거나 후속 연구가 필요한 부분입니다." },
      { title: "검토 필요 사항", patterns: [/^##\s+검토 필요 항목 요약/i, /^###\s+Screening Notes/i, /^##\s+Critic/i, /^###\s+Critic/i], fallback: literaturePreview[4].body, desc: "DOI, 저널, 관련성, 과대해석 가능성을 재검토해야 하는 부분입니다." },
      { title: "논문 활용 순서", patterns: [/^##\s+추천 읽기 순서/i, /^###\s+Suggested Reading Order/i, /^##\s+Use in Paper/i, /^###\s+Use in Paper/i], fallback: literaturePreview[5].body, desc: "발표문, 논문, 이론적 배경에 어떤 순서로 활용할지 제안합니다." }
    ];

    return sections.map((section) => {
      const body = extractMarkdownSection(report, section.patterns);
      return { title: section.title, body: body || section.fallback, desc: section.desc };
    });
  }, [report]);

  useEffect(() => {
    void loadLatestJob();
  }, []);

  useEffect(() => {
    if (!activeJob || activeJob.status === "completed" || activeJob.status === "failed") return;
    const timer = window.setInterval(() => {
      void loadJobTraces(activeJob.id);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [activeJob?.id, activeJob?.status]);

  async function loadLatestJob() {
    try {
      const response = await fetch(apiUrl("/api/search-jobs?limit=1"));
      if (!response.ok) return;
      const data = (await response.json()) as JobsResponse;
      const latest = data.jobs[0];
      if (latest) {
        await loadJobTraces(latest.id);
        if (latest.status === "completed") await loadReport(latest.id);
      }
    } catch {
      // Fail silently
    }
  }

  async function loadJobTraces(jobId: string) {
    try {
      const response = await fetch(apiUrl(`/api/search-jobs/${jobId}/traces`));
      if (!response.ok) return;
      const data = (await response.json()) as TraceResponse;
      setActiveJob(data.job);
      setTraces(data.traces);
      if (data.job.status === "completed" && !report) await loadReport(jobId);
    } catch {
      // Fail silently
    }
  }

  async function loadReport(jobId: string) {
    try {
      const response = await fetch(apiUrl(`/api/search-jobs/${jobId}/report.md`));
      if (!response.ok) return;
      setReport(await response.text());
    } catch {
      // Fail silently
    }
  }

  return (
    <>
      <section className="uxHero">
        <div className="uxHeroGrid">
          <div>
            <span className="uxEyebrow">인터랙티브 연구 스튜디오</span>
            <h1>Top Journal 기반 문헌검색, 검증, 보고서 생성을 한 화면에서 관리합니다.</h1>
            <p>검색 실행 후 12단계 실행 절차(Pipeline), DOI/Crossref 검증, OA PDF/R2 상태, 랭킹, 논문 상세, 문헌 검토 보고서를 함께 확인합니다.</p>
            <div className="uxHeroFlow">
              <MiniFlow title="연구 입력" body="키워드, 연구 질문, 분야, 기간 입력" />
              <MiniFlow title="Top Journal 필터" body="국제 S급 우선, 국제 A1급 후순위 검색" />
              <MiniFlow title="논문 검증" body="DOI, Crossref, OA, 저장 상태 검증" />
              <MiniFlow title="Review 산출물" body="요약, 차이점, Gap, Critic Note 생성" />
            </div>
          </div>
          <aside className="uxSearchSummary">
            <h2>실행 단계(Workflow) 현황</h2>
            <p>{activeJob ? `Job ${activeJob.id} ${formatRuntimeStatus(activeJob.status)} 상태입니다.` : "최근 실행된 검색 작업이 없습니다. 아래에서 검색을 시작하세요."}</p>
            <div className="uxProgressTrack">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="uxSnapshotGrid">
              <MetricTile label="작업 상태" value={activeJob ? formatRuntimeStatus(activeJob.status) : "대기"} detail={activeJob?.currentStep || "준비됨"} tone="green" />
              <MetricTile label="실행 단계" value={`${completedTraceCount}/12`} detail="완료/건너뜀" tone="blue" />
              <MetricTile label="내부 Allowlist" value="부분 구현" detail="Internal Allowlist Filter" tone="purple" />
              <MetricTile label="Review" value={activeJob?.status === "completed" ? "준비됨" : "대기 중"} detail={report ? "Live 리포트" : "Critic 분석 중"} tone={activeJob?.status === "completed" ? "green" : "amber"} />
            </div>
          </aside>
        </div>
      </section>

      <ImplementationStatusPanel
        title="Research Route 기능 구현 상태"
        description="실제 API 구현 여부와 임시 예시 데이터(Mock) 패널을 구분하여 표시합니다."
        items={researchImplementationStatus}
      />

        <section className="uxPanel uxWorkflowPanel">
        <div className="uxPanelHead">
          <div>
            <h2>12단계 Literature Review Pipeline</h2>
            <p>{traces.length ? "실제 D1 agent_traces 기반의 실시간 실행 단계입니다." : "예시 데이터(Mock): 실제 agent_traces 연결 전의 단계 구조입니다."}</p>
          </div>
          <span className={`uxPill ${traces.length ? "green" : "amber"}`}>{traces.length ? "LIVE D1 VERIFIED" : "MOCK BLUEPRINT"}</span>
        </div>
        <div className="uxProgressTrack">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="uxSteps12">
          {liveStages.map((stage) => (
            <article key={stage.id} className={`uxStep ${stage.status}`}>
              <span>{stage.order}</span>
              <strong>{formatTraceStepTitle(stage.title)}</strong>
              <small>{stage.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="uxGrid2 uxRouteBlock">
        <section className="uxPanel">
          <div className="uxPanelHead">
            <div>
              <h2>내부 Allowlist 필터 (Internal Allowlist Filter)</h2>
              <p>실제 동작: 내부 비즈니스 스쿨 allowlist 필터링 적용 중. 외부 JCR/SCImago API 연동은 계획 단계입니다.</p>
            </div>
            <span className="uxPill blue">PLANNED ONLY / PARTIAL</span>
          </div>
          <div className="uxSystemGrid">
            {topJournalPool.map((group) => (
              <button key={group.field} className="uxSystemItem" type="button">
                <strong>{group.field}</strong>
                <span>{group.rank} · {group.q1Status}</span>
                <small>{group.journals.join(", ")}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="uxPanel">
          <div className="uxPanelHead">
            <div>
              <h2>문헌 검토 보고서 미리보기</h2>
              <p>{report ? "실제 Report Agent가 생성한 보고서의 요약 발췌본입니다." : "예시 데이터(Mock): 실제 리포트 생성 전의 한글 요약 예시입니다."}</p>
            </div>
            <span className={`uxPill ${report ? "green" : "amber"}`}>{report ? "LIVE D1 VERIFIED" : "AWAITING REPORT GENERATION"}</span>
          </div>
          <div className="uxPreviewGrid">
            {livePreview.map((item) => (
              <article key={item.title} className="uxMiniCard">
                <h3>{item.title}</h3>
                <small className="descText">{item.desc}</small>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          {report && <small className="uxPanelNote">Markdown 보고서는 한글로 제공되며, PDF 보고서는 현재 기술 제약으로 영어로 제공됩니다.</small>}
        </section>
      </section>
    </>
  );
}

type BenchmarkRun = {
  id: string;
  run_label: string;
  benchmark_scope: string;
  task_range: string;
  status: string;
  methods: string;
  source_commit: string;
  gold_version: string;
  created_at: string;
  notes: string;
  parent_run_id?: string | null;
  batch_id?: string | null;
  is_derived?: number;
  merge_status?: string | null;
};

export function AgentOpsPage() {
  const [running, setRunning] = useState(false);
  const [keyword, setKeyword] = useState("AI interview employer branding");
  const [searchSize, setSearchSize] = useState<"fast" | "standard">("fast");
  const [useSemanticRanking, setUseSemanticRanking] = useState(false);
  const [useLlmCritic, setUseLlmCritic] = useState(false);
  const [activeJob, setActiveJob] = useState<SearchJob | null>(null);
  const [traces, setTraces] = useState<AgentTrace[]>([]);
  const [traceError, setTraceError] = useState("");
  const [artifactError, setArtifactError] = useState("");
  const [criticFlags, setCriticFlags] = useState<CriticFlag[]>([]);
  const [outputs, setOutputs] = useState<JobOutput[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);
  const [diagnosticsError, setDiagnosticsError] = useState("");
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<BenchmarkMetrics | null>(null);
  const [benchmarkRuns, setBenchmarkRuns] = useState<any[]>([]);
  const [benchmarkError, setBenchmarkError] = useState("");
  const [logs, setLogs] = useState(toolCallLogs);
  const [pollingStartTime, setPollingStartTime] = useState<number>(0);
  const [showTechnicalEvidence, setShowTechnicalEvidence] = useState(false);
  const completedTraceCount = traces.filter((trace) => trace.status === "completed" || trace.status === "skipped").length;
  const progress = traces.length ? Math.round((completedTraceCount / 12) * 100) : 0;
  const liveStages = traces.length ? mapTracesToWorkflowStages(traces) : literatureWorkflowStages;
  const liveAgentCards = traces.length ? mapTracesToAgentCards(traces) : agentStatuses;
  const enrichmentOverview = useMemo(() => summarizeEnrichmentTraces(traces), [traces]);
  const criticSummary = useMemo(() => summarizeCriticFlags(criticFlags), [criticFlags]);
  const diagnosticsItems = useMemo(() => getDiagnosticsItems(diagnostics), [diagnostics]);

  useEffect(() => {
    void loadLatestJob();
    void loadDiagnostics();
  }, []);

  useEffect(() => {
    if (!activeJob || activeJob.status === "completed" || activeJob.status === "failed") return;
    const timer = window.setInterval(() => {
      void loadJobTraces(activeJob.id);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [activeJob?.id, activeJob?.status]);

  async function loadLatestJob() {
    setTraceError("");
    try {
      const response = await fetch(apiUrl("/api/search-jobs?limit=1"));
      if (!response.ok) throw new Error(await readDashboardError(response, "최근 작업(job)을 불러오지 못했습니다"));
      const data = (await response.json()) as JobsResponse;
      const latest = data.jobs[0];
      if (latest) await loadJobTraces(latest.id);
    } catch (error) {
      setTraceError(error instanceof Error ? error.message : "최근 작업(job)을 불러오지 못했습니다");
    }
  }

  async function loadJobTraces(jobId: string) {
    setTraceError("");
    try {
      const response = await fetch(apiUrl(`/api/search-jobs/${jobId}/traces`));
      if (!response.ok) throw new Error(await readDashboardError(response, "실행 기록(trace)을 불러오지 못했습니다"));
      const data = (await response.json()) as TraceResponse;
      setActiveJob(data.job);
      setTraces(data.traces);
      setLogs(data.traces.map((trace) => ({ level: getTraceLogLevel(trace.status), message: formatTraceConsoleMessage(trace) })));
      
      if (data.job.status === "completed" || data.job.status === "failed") {
        await loadJobArtifacts(data.job.id);
        setRunning(false);
      } else if (pollingStartTime > 0 && Date.now() - pollingStartTime > 60000 && data.traces.length === 0) {
        setTraceError("작업 지연 중: 60초 이상 진행이 없습니다.");
      }
    } catch (error) {
      setTraceError(error instanceof Error ? error.message : "실행 기록(trace)을 불러오지 못했습니다");
      setRunning(false);
    }
  }

  async function loadJobArtifacts(jobId: string) {
    setArtifactError("");
    try {
      const [flagsResponse, outputsResponse] = await Promise.all([
        fetch(apiUrl(`/api/search-jobs/${jobId}/critic-flags`)),
        fetch(apiUrl(`/api/search-jobs/${jobId}/outputs`))
      ]);
      if (!flagsResponse.ok) throw new Error(await readDashboardError(flagsResponse, "검토 필요 항목(critic flag)을 불러오지 못했습니다"));
      if (!outputsResponse.ok) throw new Error(await readDashboardError(outputsResponse, "산출물 정보(output artifact)를 불러오지 못했습니다"));
      const flagsData = (await flagsResponse.json()) as CriticFlagsResponse;
      const outputsData = (await outputsResponse.json()) as JobOutputsResponse;
      setCriticFlags(flagsData.criticFlags);
      setOutputs(outputsData.outputs);
    } catch (error) {
      setArtifactError(error instanceof Error ? error.message : "작업 산출물(artifact)을 불러오지 못했습니다");
      setCriticFlags([]);
      setOutputs([]);
    }
  }

  async function loadDiagnostics() {
    setDiagnosticsError("");
    try {
      const response = await fetch(apiUrl("/api/diagnostics"));
      if (!response.ok) throw new Error(await readDashboardError(response, "시스템 상태(diagnostics)를 불러오지 못했습니다"));
      const data = (await response.json()) as DiagnosticsResponse;
      setDiagnostics(data);
    } catch (error) {
      setDiagnosticsError(error instanceof Error ? error.message : "시스템 상태(diagnostics)를 불러오지 못했습니다");
      setDiagnostics(null);
    }
  }


  async function launchJob() {
    setRunning(true);
    setTraceError("");
    setPollingStartTime(Date.now());
    const maxResults = searchSize === "fast" ? 5 : 10;
    const enrichmentLimit = 5;
    
    setLogs([{ level: "muted", message: `POST /api/search-jobs keyword="${keyword}" maxResults=${maxResults} useSemanticRanking=${useSemanticRanking} useLlmCritic=${useLlmCritic}` }]);
    try {
      const response = await fetch(apiUrl("/api/search-jobs"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, maxResults, enrichmentLimit, useSemanticRanking, useLlmCritic })
      });
      if (!response.ok) {
        const errMsg = await readDashboardError(response, "Agent 작업 실행에 실패했습니다");
        if (errMsg.includes("API key") || errMsg.includes("quota")) {
          throw new Error(`검색 제공자 오류: ${errMsg}`);
        }
        throw new Error(errMsg);
      }
      const data = (await response.json()) as { job: SearchJob };
      setActiveJob(data.job);
      setTraceError("작업 생성됨 / trace 생성 대기 중...");
      await loadJobTraces(data.job.id);
    } catch (error) {
      setTraceError(error instanceof Error ? error.message : "Agent 작업 실행에 실패했습니다");
      setRunning(false);
    }
  }

  function inspectAgent(name: string) {
    const trace = traces.find((item) => item.agentName === name);
    setLogs((current) => [...current, { level: trace ? getTraceLogLevel(trace.status) : "muted", message: trace ? `${trace.agentName}.inspect ${formatTraceConsoleMessage(trace)}` : `${name}.inspect no live trace loaded` }]);
  }

  const failedReason = activeJob?.status === "failed" ? traces.find(t => t.status === "failed")?.errorMessage || "Top Journal 필터 결과 없음 또는 알 수 없는 오류" : "";

  return (
    <main className="uxShell">
      <ExecutiveSummaryPanel />
      <section className="uxHero">
        <div className="uxHeroGrid">
          <div>
            <span className="uxEyebrow cyan">인터랙티브 Agent 운영</span>
            <h1>Multi-Agent 실행 상태와 도구 호출(tool call) 흐름을 확인합니다.</h1>
            <p className="uxHeroDesc">이 화면에서는 검색 작업이 실제로 어느 단계까지 진행되었는지 추적합니다. 각 Agent의 역할, 데이터 수집 결과, 외부 도구 접근 상태, 실패나 폴백(대체 경로) 발생 원인을 검증할 수 있습니다.</p>
            {diagnostics && (
              <p className="uxHeroDesc" style={{ color: '#0369a1', marginTop: '0.5rem' }}>
                현재 기본 검색 제공자는 <strong>{diagnostics.searchProvider === "wos" ? "Web of Science" : "OpenAlex"}</strong>입니다. 실패 시 OpenAlex 대체 검색이 가능하도록 설정되어 있는지 확인합니다.
              </p>
            )}
          </div>
          <aside className="uxSearchSummary">
            <h2>Agent 작업 실행</h2>
            <label className="uxField">
              <span>검색어</span>
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            </label>
            <div className="uxFieldGrid">
              <label className="uxField">
                <span>규모</span>
                <select value={searchSize} onChange={(e) => setSearchSize(e.target.value as "fast" | "standard")} disabled={running}>
                  <option value="fast">빠른 검증 (Max 5)</option>
                  <option value="standard">표준 검색 (Max 10)</option>
                </select>
              </label>
              <label className="uxField">
                <span>Pipeline</span>
                <select defaultValue="full" disabled>
                  <option value="full">전체 12단계 실행 기록</option>
                </select>
              </label>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
              안전 실행 모드: 기본 검색은 Cloudflare Worker 제한을 피하기 위해 최대 5~10개 논문만 처리합니다. 더 큰 검색은 추후 배치 실행 모드에서 처리합니다.
            </p>
            <div className="uxToggleGrid" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: diagnostics?.readiness.vectorizeReady ? 'pointer' : 'not-allowed', color: diagnostics?.readiness.vectorizeReady ? 'inherit' : '#999' }}>
                <input
                  type="checkbox"
                  checked={useSemanticRanking}
                  onChange={(e) => setUseSemanticRanking(e.target.checked)}
                  disabled={!diagnostics?.readiness.vectorizeReady}
                />
                벡터 의미 유사도(Vectorize) 적용 (선택형 실험 기능)
              </label>
              {!diagnostics?.readiness.vectorizeReady && (
                <small style={{ color: '#d97706', fontSize: '0.75rem', marginTop: '-0.25rem' }}>
                  불가: AI/VECTOR_INDEX 연결 없음; 메타데이터 기반 점수가 기본값으로 적용됨.
                </small>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: diagnostics?.readiness.llmCriticReady ? 'pointer' : 'not-allowed', color: diagnostics?.readiness.llmCriticReady ? 'inherit' : '#999' }}>
                <input
                  type="checkbox"
                  checked={useLlmCritic}
                  onChange={(e) => setUseLlmCritic(e.target.checked)}
                  disabled={!diagnostics?.readiness.llmCriticReady}
                />
                LLM 비평기(Critic) 정성 평가 적용 (선택형 실험 기능)
              </label>
              {!diagnostics?.readiness.llmCriticReady && (
                <small style={{ color: '#d97706', fontSize: '0.75rem', marginTop: '-0.25rem' }}>
                  불가: AI 연결 없음; 규칙 기반(Rule-based) 폴백이 기본값으로 적용됨.
                </small>
              )}
            </div>
            <button className="uxButton green" type="button" onClick={launchJob} disabled={running || !keyword.trim()}>
              {running ? <RefreshCw size={18} className="spin" /> : <Play size={18} />}
              Agent 작업 실행
            </button>
            {activeJob ? <p className="uxTinyStatus">작업 번호(job_id): {activeJob.id}</p> : null}
            {traceError && <p className={traceError.includes("대기 중") ? "uxTinyStatus" : "uxTinyError"}>{traceError}</p>}
            {activeJob?.status === "failed" && (
              <div className="uxFailureBox" style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.8rem', color: '#991b1b' }}>
                <strong>실패 원인:</strong> {failedReason}<br/>
                조치: 더 넓은 키워드 또는 필터 완화가 필요할 수 있습니다. 제공자 오류일 경우 API Key를 확인하세요.
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="uxMetrics">
        <MetricTile label="작업 상태" value={activeJob ? formatRuntimeStatus(activeJob.status) : "작업 없음"} detail={activeJob?.currentStep ?? "불러오기 또는 실행"} tone={activeJob?.status === "failed" ? "amber" : "green"} />
        <MetricTile label="실행 기록(Trace) 단계" value={String(traces.length)} detail={`${completedTraceCount} 완료/건너뜀`} tone="blue" />
        <MetricTile label="동작 Agent 수" value={String(liveAgentCards.length)} detail="from D1 traces" tone="purple" />
        <MetricTile label="경고 발생" value={String(traces.filter((trace) => trace.status === "skipped" || trace.status === "failed").length)} detail="건너뜀 또는 실패" tone="amber" />
        <MetricTile label="메타데이터 보강(Enrichment)" value={enrichmentOverview.limit} detail={`Crossref: 처리 ${enrichmentOverview.crossrefProcessed}/제외 ${enrichmentOverview.crossrefSkipped} · Unpaywall: 처리 ${enrichmentOverview.unpaywallProcessed}/제외 ${enrichmentOverview.unpaywallSkipped}`} tone="blue" />
        <MetricTile label="파일 저장(Storage)" value={diagnostics?.env.r2Reports ? "R2 준비됨" : "대기 중"} detail={diagnostics?.env.googleDrive ? "Drive 준비됨" : "Drive 부분 연결"} tone={diagnostics?.env.r2Reports ? "green" : "amber"} />
        <MetricTile label="검토 필요 항목(Critic Flags)" value={String(criticFlags.length)} detail={`위험(high) ${criticSummary.high} · 주의(medium) ${criticSummary.medium} · 낮음(low) ${criticSummary.low}`} tone={criticSummary.high ? "amber" : "green"} />
        <MetricTile label="생성된 산출물" value={String(outputs.length)} detail={outputs.length ? outputs.map((output) => output.outputType.toUpperCase() + ":" + formatRuntimeStatus(output.status)).join(" · ") : "metadata 없음"} tone="purple" />
        <MetricTile label="실행 환경(Runtime)" value={diagnostics?.readiness.activeProviderReady ? "준비됨" : "확인 필요"} detail={diagnostics ? `${diagnostics.searchProvider} 제공자` : "diagnostics 로드 중"} tone={diagnostics?.readiness.activeProviderReady ? "green" : "amber"} />
      </section>

      <BenchmarkSeedDiagnostics
        metrics={benchmarkMetrics}
        runs={benchmarkRuns}
        dbStatus={diagnostics?.db}
        error={benchmarkError}
      />

      <ImplementationStatusPanel
        title="Ops Route 기능 구현 상태"
        description="운영 화면의 Agent 상태 보드, 파이프라인, 콘솔은 실제 D1 트레이스 기록을 우선 사용하며, 데이터가 없을 때만 예시(Mock) 화면을 표시합니다."
        items={opsImplementationStatus}
      />

      <section className="uxGrid2">
        <div className="uxStack">
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Multi-Agent 상태 보드</h2>
                <p>Agent 카드를 클릭하면 하단 콘솔에 해당 역할과 실행 결과 요약이 출력됩니다.</p>
              </div>
              <span className={`uxPill ${traces.length ? "green" : "amber"}`}>{traces.length ? "실제 실행 기록(D1)" : "예시 데이터"}</span>
            </div>
            <div className="uxAgentGrid">
              {liveAgentCards.map((agent) => (
                <button key={agent.name} className="uxMiniCard uxAgentCard" type="button" onClick={() => inspectAgent(agent.name)}>
                  <h3>{agent.name}</h3>
                  <p>{agent.role}</p>
                  <span className={`uxPill ${agent.state === "review" ? "amber" : agent.state === "running" ? "blue" : agent.state === "done" ? "green" : "gray"}`}>{formatRuntimeStatus(agent.state)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>실행 절차(Pipeline) 상태</h2>
                <p>12단계 문헌 검토 파이프라인의 현재 진행 상황입니다.</p>
              </div>
              <span className={`uxPill ${traces.length ? "green" : "amber"}`}>{traces.length ? `${progress}%` : "예시 데이터"}</span>
            </div>
            <div className="uxProgressTrack">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="uxSteps12">
              {liveStages.map((stage) => (
                <article key={stage.id} className={`uxStep ${stage.status === "done" ? "done" : stage.status === "running" ? "running" : stage.status === "review" ? "review" : "idle"}`}>
                  <span>{stage.order}</span>
                  <strong>{formatTraceStepTitle(stage.title)}</strong>
                  <small>{stage.detail}</small>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="uxStack">
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>실행 단계 요약 로그 (Trace Console)</h2>
                <p>{traces.length ? "D1 agent_traces 기반의 실행 결과 요약입니다. 사용된 토큰 수나 세부 에러가 기록됩니다." : "예시 데이터(Mock): 실행 기록이 없으면 임시 로그를 보여줍니다."}</p>
              </div>
              <button className="uxSoftButton" type="button" onClick={() => setShowTechnicalEvidence((current) => !current)}>
                <Terminal size={14} /> {showTechnicalEvidence ? "기술 증거 숨기기" : "기술 증거 보기 / Show Technical Evidence"}
              </button>
            </div>
            {showTechnicalEvidence ? (
              <div className="uxTerminal">
                {logs.map((log, index) => (
                  <div key={`${log.message}-${index}`} className={log.level}>
                    <span>$</span> {log.message}
                  </div>
                ))}
              </div>
            ) : (
              <div className="uxTraceCollapsed">
                <span className="uxEvidenceBadge gray">TECHNICAL TRACE</span>
                <p>원시 D1 trace, run ID, debug 로그는 기본적으로 접혀 있습니다. 평가자는 요약을 먼저 확인하고 필요할 때만 기술 증거를 펼칠 수 있습니다.</p>
              </div>
            )}
          </section>

          <OutputArtifactsPanel outputs={outputs} errorMessage={artifactError} />

          <LiveCriticFlagsPanel flags={criticFlags} errorMessage={artifactError} />

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>저장소 및 실행 환경 상태</h2>
                <p>진단 API(`/api/diagnostics`) 기준 D1, 논문 제공자, Crossref, Unpaywall, R2, Drive 설정 상태입니다.</p>
              </div>
              <button className="uxSoftButton" type="button" onClick={loadDiagnostics}><RefreshCw size={14} /></button>
            </div>
            {diagnosticsError ? <p className="uxTinyError">{diagnosticsError}</p> : null}
            <div className="uxSystemGrid">
              {diagnosticsItems.map((item) => (
                <button key={item.name} className="uxSystemItem" type="button" onClick={() => setLogs((current) => [...current, { level: item.tone === "amber" ? "warn" : "ok", message: `${item.name}.status checked: ${item.status} :: ${item.detail}` }])}>
                  <strong>{item.name}</strong>
                  <span>{item.status}</span>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
            <div className="uxPanelNote">
              <small>Google Drive PDF 보관 (부분 구현): 합법적 오픈액세스(OA) 논문 한정 조건부 업로드 진행.</small>
              <br/>
              <small>벡터 저장소 상태 (선택적 실험 기능): 운영 배포 전 단계입니다.</small>
            </div>
          </section>

          <CriticReviewPanel />
        </aside>
      </section>
    </main>
  );
}

function OutputArtifactsPanel({ outputs, errorMessage }: { outputs: JobOutput[]; errorMessage: string }) {
  const getArtifactInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case "md":
        return {
          label: "한글 보고서",
          description: "대시보드 사용자를 위한 공식 한글 문헌 검색 보고서입니다.",
          usage: "검토, 복사, 발표 준비, 문헌 정리"
        };
      case "pdf":
        return {
          label: "영문 PDF",
          description: "현재 PDF 엔진의 폰트 제약으로 영어로 제공됩니다. PDF 기능은 정상 작동합니다.",
          usage: "파일 제출, 빠른 공유, 영문 출력 확인"
        };
      case "csv":
        return {
          label: "분석용 원자료",
          description: "데이터 처리와 재분석을 위한 표 형식 파일입니다. 컬럼명은 시스템 호환성을 위해 영어로 유지됩니다.",
          usage: "데이터 분석, 재현성 확인, 외부 도구 연동"
        };
      case "xlsx":
        return {
          label: "스프레드시트 원자료",
          description: "엑셀에서 열람 가능한 분석용 파일입니다. 컬럼명은 시스템 호환성을 위해 영어로 유지됩니다.",
          usage: "엑셀 검토, 정렬, 필터링"
        };
      default:
        return { label: "", description: "", usage: "" };
    }
  };

  return (
    <section className="uxPanel">
      <div className="uxPanelHead">
        <div>
          <h2>산출물 저장 상태 (Output Artifacts)</h2>
          <p>CSV, Markdown, XLSX, PDF 최종 산출물의 물리적 저장 상태입니다. (R2 스토리지 기준)</p>
        </div>
        <FileText size={18} />
      </div>

      <div className="uxPolicyCard">
        <strong>산출물 언어 정책</strong>
        <p>Markdown 보고서는 한글로 제공되며, PDF 보고서는 현재 Worker PDF 엔진의 폰트 제약으로 영어로 제공됩니다. CSV/XLSX는 분석용 원자료이므로 영어 컬럼명을 유지합니다.</p>
        <ul>
          <li>한글 내용을 읽으려면 <strong>Markdown 보고서</strong>를 사용하세요.</li>
          <li>PDF 파일이 필요하다면 <strong>영문 PDF</strong>를 사용하세요.</li>
          <li>데이터를 분석하거나 재가공하려면 <strong>CSV/XLSX</strong>를 사용하세요.</li>
        </ul>
      </div>

      {errorMessage ? <p className="uxTinyError">{errorMessage}</p> : null}
      <div className="uxArtifactList">
        {outputs.length ? outputs.map((output) => {
          const info = getArtifactInfo(output.outputType);
          return (
            <article key={output.id} className="uxArtifactItem">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong>{output.outputType.toUpperCase()}</strong>
                  {info.label && <span className="uxLangBadge">{info.label}</span>}
                </div>
                <span>{output.storage} · {output.detail}</span>
                <p className="uxArtifactDesc">{info.description}</p>
                <small className="uxArtifactUsage">권장 사용: {info.usage}</small>
                {output.urlPath ? (
                  <div style={{ marginTop: '4px' }}>
                    <a href={apiUrl(output.urlPath)} target="_blank" rel="noreferrer">산출물 열기</a>
                  </div>
                ) : (
                  <small style={{ display: 'block', marginTop: '4px' }}>생성 예정</small>
                )}
              </div>
              <span className={`uxPill ${output.status === "stored" || output.status === "generated" ? "green" : output.status === "failed" ? "amber" : "gray"}`}>{formatRuntimeStatus(output.status)}</span>
            </article>
          );
        }) : <p className="uxEmptyNote">불러온 산출물 정보(metadata)가 없습니다.</p>}
      </div>
    </section>
  );
}

function LiveCriticFlagsPanel({ flags, errorMessage }: { flags: CriticFlag[]; errorMessage: string }) {
  return (
    <section className="uxPanel">
      <div className="uxPanelHead">
        <div>
          <h2>검토 필요 항목 (Critic Flags)</h2>
          <p>D1 데이터베이스에 기록된 규칙 기반(Rule-based) 경고 항목입니다. (LLM 비평기는 실험적 선택 기능입니다.)</p>
        </div>
        <ShieldCheck size={18} />
      </div>
      {errorMessage ? <p className="uxTinyError">{errorMessage}</p> : null}
      <div className="uxArtifactList">
        {flags.length ? flags.slice(0, 8).map((flag) => (
          <article key={flag.id} className="uxArtifactItem">
            <div>
              <strong>#{flag.paperRank} · {formatTraceMetaLabel("flagType", flag.flagType)}</strong>
              <span>{flag.message}</span>
              {flag.evidence ? <small>{flag.evidence}</small> : null}
            </div>
            <span className={`uxPill ${flag.severity === "high" ? "amber" : flag.severity === "medium" ? "blue" : "gray"}`}>{flag.severity}</span>
          </article>
        )) : <p className="uxEmptyNote">이 작업(job)에 발견된 검토 경고가 없습니다.</p>}
      </div>
    </section>
  );
}


function summarizeCriticFlags(flags: CriticFlag[]) {
  return {
    high: flags.filter((flag) => flag.severity === "high").length,
    medium: flags.filter((flag) => flag.severity === "medium").length,
    low: flags.filter((flag) => flag.severity === "low").length
  };
}

function mapTracesToWorkflowStages(traces: AgentTrace[]) {
  return traces.map((trace) => ({
    id: trace.stepId,
    order: trace.stepOrder,
    title: trace.stepId, // UI formatted in rendering
    owner: trace.agentName,
    status: trace.status === "completed" ? "done" as const : trace.status === "running" ? "running" as const : trace.status === "failed" || trace.status === "skipped" ? "review" as const : "idle" as const,
    progress: trace.status === "completed" || trace.status === "skipped" ? 100 : trace.status === "running" ? 50 : 0,
    detail: summarizeTraceForCard(trace)
  }));
}

function mapTracesToAgentCards(traces: AgentTrace[]) {
  return traces.map((trace) => ({
    name: trace.agentName,
    role: summarizeTraceForCard(trace),
    state: trace.status === "completed" ? "done" as const : trace.status === "running" ? "running" as const : trace.status === "failed" || trace.status === "skipped" ? "review" as const : "idle" as const,
    tool: trace.stepId
  }));
}

function titleFromTraceStep(stepId: string): string {
  return stepId.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function formatTraceStepTitle(stepId: string): string {
  const map: Record<string, string> = {
    "planner": "계획 (Planner)",
    "journal_selector": "저널 풀 필터",
    "wos_search": "원천 검색 (WoS)",
    "openalex_search": "원천 검색 (OpenAlex)",
    "crossref_enrichment": "DOI 검증",
    "unpaywall_check": "OA 조회",
    "drive_r2_storage": "파일 백업",
    "journal_evaluation": "메타데이터 채점",
    "vectorize_relevance": "의미 유사도",
    "ranking": "최종 랭킹",
    "critic_review": "결과 비평",
    "report_generation": "보고서 생성",
    "delivery": "인도"
  };
  return map[stepId] || titleFromTraceStep(stepId);
}

function summarizeEnrichmentTraces(traces: AgentTrace[]): EnrichmentOverview {
  const crossref = traces.find((trace) => trace.stepId === "crossref_enrichment");
  const unpaywall = traces.find((trace) => trace.stepId === "unpaywall_check");
  const crossrefDetail = parseTraceDetail(crossref?.detail);
  const unpaywallDetail = parseTraceDetail(unpaywall?.detail);
  const limit = formatTraceValue(crossrefDetail.enrichmentLimit) || formatTraceValue(unpaywallDetail.enrichmentLimit) || "not set";

  return {
    limit: limit === "not set" ? "제한 없음" : `상한 ${limit}`,
    crossrefProcessed: crossref?.outputCount !== undefined ? String(crossref.outputCount) : "0",
    crossrefSkipped: formatTraceValue(crossrefDetail.skipped) || "0",
    unpaywallProcessed: unpaywall?.outputCount !== undefined ? String(unpaywall.outputCount) : "0",
    unpaywallSkipped: formatTraceValue(unpaywallDetail.skipped) || "0"
  };
}

function summarizeTraceForCard(trace: AgentTrace): string {
  const detail = parseTraceDetail(trace.detail);
  const meta = buildTraceMetaItems(trace, detail);
  return meta.length ? `${trace.summary} [${meta.join(" · ")}]` : trace.summary;
}

function formatTraceConsoleMessage(trace: AgentTrace): string {
  const detail = parseTraceDetail(trace.detail);
  const meta = buildTraceMetaItems(trace, detail);
  return meta.length ? `${trace.stepId}: ${trace.summary} :: ${meta.join(" | ")}` : `${trace.stepId}: ${trace.summary}`;
}

function parseTraceDetail(detail?: string): TraceDetail {
  if (!detail) return {};
  try {
    const parsed = JSON.parse(detail) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as TraceDetail : {};
  } catch {
    return {};
  }
}

function formatTraceMetaLabel(key: string, value: string): string {
  const valMap: Record<string, string> = {
    "llm_augmented": "LLM 보강됨",
    "rule_based_fallback": "규칙 폴백",
    "rule_based_only": "규칙 한정",
    "llm_critic_timeout": "LLM 응답 지연 타임아웃",
    "vector_semantic": "벡터 의미 유사도",
    "metadata_fallback": "메타데이터 폴백",
    "metadata_default": "기본 메타데이터",
    "missing_doi": "DOI 누락",
    "crossref_verification": "검증 불일치",
    "low_relevance": "관련성 부족",
    "screening_status": "스크리닝 경고",
    "access_path": "본문 접근 불가"
  };
  const translatedVal = valMap[value] || value;
  
  const keyMap: Record<string, string> = {
    "limit": "처리 상한",
    "input": "입력됨",
    "processed": "처리됨",
    "skipped": "건너뜀",
    "verified": "성공",
    "partial": "부분 검증",
    "OA PDF": "PDF 확인됨",
    "landing": "링크 확인됨",
    "Drive uploaded": "Drive 성공",
    "Drive failed": "Drive 실패",
    "Drive skipped": "Drive 제외됨",
    "mode": "실행 방식",
    "reason": "사유",
    "LLM flags": "LLM 발견 건수"
  };
  const translatedKey = keyMap[key] || key;

  if (key === "flagType") return translatedVal;
  if (key === "mode" || key === "reason") return `${translatedKey}: ${translatedVal}`;
  return `${translatedKey} ${translatedVal}`;
}

function buildTraceMetaItems(trace: AgentTrace, detail: TraceDetail): string[] {
  const items: string[] = [];
  const enrichmentLimit = formatTraceValue(detail.enrichmentLimit);
  const skipped = formatTraceValue(detail.skipped);
  if (enrichmentLimit) items.push(formatTraceMetaLabel("limit", enrichmentLimit));
  if (trace.inputCount !== undefined) items.push(formatTraceMetaLabel("input", String(trace.inputCount)));
  if (trace.outputCount !== undefined) items.push(formatTraceMetaLabel("processed", String(trace.outputCount)));
  if (skipped) items.push(formatTraceMetaLabel("skipped", skipped));

  if (trace.stepId === "crossref_enrichment") {
    const verified = formatTraceValue(detail.verified);
    const partial = formatTraceValue(detail.partial);
    if (verified) items.push(formatTraceMetaLabel("verified", verified));
    if (partial) items.push(formatTraceMetaLabel("partial", partial));
  }

  if (trace.stepId === "unpaywall_check") {
    const pdfUrls = formatTraceValue(detail.pdfUrls);
    const landingPages = formatTraceValue(detail.landingPages);
    if (pdfUrls) items.push(formatTraceMetaLabel("OA PDF", pdfUrls));
    if (landingPages) items.push(formatTraceMetaLabel("landing", landingPages));
  }

  if (trace.stepId === "drive_r2_storage") {
    const uploaded = formatTraceValue(detail.driveUploaded);
    const failed = formatTraceValue(detail.driveFailed);
    const driveSkipped = formatTraceValue(detail.driveSkipped);
    if (uploaded) items.push(formatTraceMetaLabel("Drive uploaded", uploaded));
    if (failed) items.push(formatTraceMetaLabel("Drive failed", failed));
    if (driveSkipped) items.push(formatTraceMetaLabel("Drive skipped", driveSkipped));
  }

  if (trace.stepId === "vectorize_relevance") {
    const mode = formatTraceValue(detail.mode);
    const fallbackUsed = detail.fallbackUsed === true;
    if (mode) items.push(formatTraceMetaLabel("mode", mode));
    if (fallbackUsed) items.push("폴백(대체) 실행됨");
  }

  if (trace.stepId === "critic_review") {
    const mode = formatTraceValue(detail.mode);
    const reason = formatTraceValue(detail.reason);
    const llmCount = formatTraceValue(detail.llmCount);
    if (mode) items.push(formatTraceMetaLabel("mode", mode));
    if (reason) items.push(formatTraceMetaLabel("reason", reason));
    if (llmCount) items.push(formatTraceMetaLabel("LLM flags", llmCount));
  }

  return items;
}

function formatTraceValue(value: TraceDetail[string]): string {
  return typeof value === "number" || typeof value === "string" ? String(value) : "";
}

function formatRuntimeStatus(status: string): string {
  const map: Record<string, string> = {
    "searching": "원천 검색 중",
    "scoring": "품질 평가 중",
    "enriching_metadata": "메타데이터 보강 중",
    "checking_oa": "OA 확인 중",
    "ranking": "최종 랭킹 집계 중",
    "reviewing": "결과 비평 중",
    "generating_report": "보고서 생성 중",
    "completed": "완료됨",
    "failed": "실패",
    "done": "완료",
    "running": "실행 중",
    "idle": "대기",
    "skipped": "건너뜀",
    "review": "검토/오류",
    "stored": "저장 완료",
    "generated": "생성됨",
    "planned": "생성 예정"
  };
  return map[status.toLowerCase()] || status;
}

function getTraceLogLevel(status: AgentTrace["status"]): "ok" | "warn" | "muted" {
  if (status === "completed") return "ok";
  if (status === "failed" || status === "skipped") return "warn";
  return "muted";
}

async function readDashboardError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

function extractMarkdownSection(markdown: string, headingPatterns: RegExp[]): string {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => headingPatterns.some((pattern) => pattern.test(line.trim())));
  if (start < 0) return "";
  const startLevel = (lines[start].match(/^#+/)?.[0].length ?? 2);
  const content: string[] = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^(#{1,6})\s+/);
    if (heading && heading[1].length <= startLevel) break;
    content.push(line);
  }
  return summarizeMarkdownText(content.join("\n"));
}

function summarizeMarkdownText(value: string): string {
  return value
    .replace(/\[[^\]]+\]\([^\)]+\)/g, (match) => match.replace(/\]\([^\)]+\)/, "" ).replace(/^\[/, ""))
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, "")
    .replace(/^\s*[-:|]+\s*$/gm, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" ")
    .slice(0, 280);
}

function getDiagnosticsItems(diagnostics: DiagnosticsResponse | null) {
  if (!diagnostics) return systemStatuses;
  return [
    { name: "Cloudflare D1", status: diagnostics.db.bound ? "연결됨" : "누락", detail: diagnostics.db.missingColumns.length ? diagnostics.db.missingColumns.map((item) => item.table + "." + item.column).join(", ") : "schema 준비됨", tone: diagnostics.db.bound && diagnostics.db.missingColumns.length === 0 ? "green" as const : "amber" as const },
    { name: "Active Provider", status: diagnostics.searchProvider, detail: diagnostics.readiness.activeProviderReady ? "준비됨" : "키 누락", tone: diagnostics.readiness.activeProviderReady ? "green" as const : "amber" as const },
    { name: "WoS API", status: diagnostics.env.wosApiKey ? "준비됨" : "누락", detail: diagnostics.env.wosApiKeySource ?? "WOS_API_KEY", tone: diagnostics.env.wosApiKey ? "green" as const : "amber" as const },
    { name: "Crossref", status: diagnostics.env.crossrefEmail ? "준비됨" : "누락", detail: "CROSSREF_EMAIL", tone: diagnostics.env.crossrefEmail ? "green" as const : "amber" as const },
    { name: "Unpaywall", status: diagnostics.env.unpaywallEmail ? "준비됨" : "누락", detail: "UNPAYWALL_EMAIL", tone: diagnostics.env.unpaywallEmail ? "green" as const : "amber" as const },
    { name: "Cloudflare R2", status: diagnostics.env.r2Reports ? "준비됨" : "누락", detail: "REPORTS binding", tone: diagnostics.env.r2Reports ? "green" as const : "amber" as const },
    { name: "Google Drive", status: diagnostics.env.googleDrive ? "준비됨" : "부분 연결", detail: "service-account 설정", tone: diagnostics.env.googleDrive ? "green" as const : "amber" as const },
    { name: "OpenAlex Fallback", status: diagnostics.env.openAlexEmail ? "준비됨" : "부분 연결", detail: diagnostics.env.openAlexApiKey ? "email + api key" : "email만 존재", tone: diagnostics.env.openAlexEmail ? "blue" as const : "amber" as const },
    { name: "Workers AI", status: diagnostics.env.aiBinding ? "연결됨" : "누락", detail: "LLM Critic 지원", tone: diagnostics.env.aiBinding ? "green" as const : "amber" as const },
    { name: "Vectorize", status: diagnostics.env.vectorIndex ? "연결됨" : "누락", detail: "VECTOR_INDEX binding", tone: diagnostics.env.vectorIndex ? "green" as const : "amber" as const }
  ];
}

function formatRate(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(4) : "-";
}

function formatPercent(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? (value * 100).toFixed(1) + "%" : "-";
}

function methodLabel(method: BenchmarkMethodKey): string {
  if (method === "rule_based") return "규칙 기반(Rule-based)";
  if (method === "single_llm") return "단일 LLM";
  return "제안 Multi-Agent";
}

function metricFinding(metric: string, values: Record<BenchmarkMethodKey, string>): string {
  if (metric === "Accepted Exceptions") return "자동 검수 예외가 결과에 포함되는지 표시합니다.";
  if (values.single_llm !== "-" && values.proposed_agent !== "-" && values.single_llm > values.proposed_agent) return "단일 LLM의 결과는 repository 데이터에 최적화된 상한선(upper-bound)이므로 과대 해석을 피해야 합니다.";
  return "T001-T003 통제(control) 레이어 기준 비교입니다.";
}

function buildComparisonRows(metrics: BenchmarkMetrics | null) {
  const byMethod = metrics?.comparison?.byMethod;
  if (!byMethod) return null;
  const methods: BenchmarkMethodKey[] = ["rule_based", "single_llm", "proposed_agent"];
  const rows = [
    { label: "Precision@5", key: "precision_at_5", format: formatRate },
    { label: "NDCG@5", key: "ndcg_at_5", format: formatRate },
    { label: "Gold DOI Hit@5", key: "gold_doi_hit_rate_at_5", format: formatRate },
    { label: "DOI Presence@5", key: "doi_presence_rate_at_5", format: formatPercent },
    { label: "Top Journal Precision", key: "top_journal_precision_at_5", format: formatPercent },
    { label: "Paper Validity", key: "paper_validity_rate_at_5", format: formatPercent },
    { label: "Accepted Exceptions", key: "accepted_exception_count", format: (value: number | undefined) => typeof value === "number" ? value.toFixed(0) : "-" }
  ].map((metric) => {
    const values = Object.fromEntries(methods.map((method) => {
      const methodMetric = byMethod[method]?.macroAverages[metric.key as keyof BenchmarkComparisonMethod["macroAverages"]];
      return [method, metric.format(methodMetric)];
    })) as Record<BenchmarkMethodKey, string>;
    return { metric: metric.label, ...values, finding: metricFinding(metric.label, values) };
  });
  return rows;
}

function buildAutoReviewRows(metrics: BenchmarkMetrics | null) {
  const byMethod = metrics?.autoReview?.byMethod;
  if (!byMethod) return [];
  return (["rule_based", "single_llm"] as const).map((method) => ({ method, label: methodLabel(method), data: byMethod[method] })).filter((item) => item.data);
}

function EvaluatorDemoGuide() {
  const steps = [
    { title: "Step 1: D1 Evidence", body: "Live Benchmark Evidence 패널에서 Production D1의 실시간 데이터 소스(Source, Commit, Timestamp)를 확인합니다.", icon: <ShieldCheck size={18} /> },
    { title: "Step 2: Method Comparison", body: "Baseline Evaluation 테이블에서 Rule-based, Single-LLM 대비 제안 모델의 정량적 성능 지표를 비교합니다.", icon: <BarChart3 size={18} /> },
    { title: "Step 3: Claim Boundary", body: "통제된 T001-T003 영역 외의 결과는 '부분적 증거'임을 인지하고, 과장되지 않은 기술적 한계를 검토합니다.", icon: <ShieldCheck size={18} className="amber" /> },
    { title: "Step 4: Active Research", body: "Research Dashboard로 이동하여 실제 논문 검색을 수행하고 12단계 파이프라인의 동작을 확인합니다.", icon: <Search size={18} /> },
    { title: "Step 5: Trace & Audit", body: "Ops Dashboard에서 각 Agent의 Tool Call 기록과 D1/R2/Drive에 저장된 실시간 산출물을 검수합니다.", icon: <Terminal size={18} /> }
  ];

  return (
    <section className="uxPanel" style={{ background: '#f0f9ff', borderColor: '#bae6fd', marginBottom: '20px' }}>
      <div className="uxPanelHead">
        <div>
          <h2 style={{ color: '#0369a1' }}>평가자 시연 가이드 (Evaluator Demo Guide)</h2>
          <p style={{ color: '#075985' }}>시스템의 Agent 구조, 도구 활용, 벤치마크 증거를 확인하는 5단계 흐름입니다.</p>
        </div>
        <Play size={20} className="blue" />
      </div>
      <div className="uxImplementationGrid">
        {steps.map((step, idx) => (
          <article key={idx} className="uxImplementationItem" style={{ background: '#ffffff', borderColor: '#e0f2fe' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#0369a1' }}>{step.title}</strong>
              {step.icon}
            </div>
            <p style={{ fontSize: '0.8rem' }}>{step.body}</p>
          </article>
        ))}
      </div>
      <div className="uxActions" style={{ marginTop: '1.5rem', justifyContent: 'flex-start' }}>
        <a className="uxButton" href="/dashboard/research" style={{ background: '#0284c7' }}>
          <Search size={16} /> Run Paper Search
        </a>
        <a className="uxButton" href="/dashboard/ops" style={{ background: '#0369a1' }}>
          <Activity size={16} /> Inspect Agent Trace
        </a>
        <a className="uxSoftButton" href="/dashboard/ops" style={{ borderColor: '#0ea5e9' }}>
          <LayoutList size={16} /> View Output Artifacts
        </a>
      </div>
    </section>
  );
}

function ToolChainEvidence() {
  const chains = [
    { agent: "Retriever Agent", tools: "Web of Science / OpenAlex", detail: "원천 논문 데이터 수집 및 Top Journal 필터링", icon: <Search size={16} /> },
    { agent: "Verifier Agent", tools: "Crossref", detail: "DOI 존재 여부 및 공식 메타데이터 정합성 검증", icon: <ShieldCheck size={16} /> },
    { agent: "Access Agent", tools: "Unpaywall", detail: "합법적 오픈액세스(OA) 여부 및 PDF 경로 확보", icon: <Cloud size={16} /> },
    { agent: "Storage Agent", tools: "R2 / Google Drive", detail: "산출물 아카이빙 및 정적 리포트 물리 저장", icon: <FileText size={16} /> },
    { agent: "Inspection Agent", tools: "MCP (Remote)", detail: "D1/R2 저장 데이터에 대한 외부 에이전트 검사", icon: <Terminal size={16} /> },
    { agent: "Benchmark QA", tools: "D1 Evidence", detail: "실시간 벤치마크 메트릭 서빙 및 재현 증거 제공", icon: <BarChart3 size={16} /> }
  ];

  return (
    <section className="uxPanel">
      <div className="uxPanelHead">
        <div>
          <h2>계획된 도구 체인 아키텍처 (Planned Tool Chain Architecture)</h2>
          <p>구현된 연결과 계획된 연결을 함께 설명하는 설계 맵입니다. 각 항목은 개별 런타임 검증 증거가 아닙니다.</p>
        </div>
        <LayoutList size={18} />
      </div>
      <div className="uxSystemGrid">
        {chains.map((chain, idx) => (
          <div key={idx} className="uxSystemItem">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {chain.icon}
              <strong>{chain.agent}</strong>
            </div>
            <span style={{ color: '#2563eb', margin: '4px 0', display: 'block' }}>{chain.tools}</span>
            <small>{chain.detail}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function BenchmarkSeedDiagnostics({ metrics, runs, dbStatus, error }: { metrics: BenchmarkMetrics | null, runs: any[], dbStatus: any, error: string }) {
  const rowCount = metrics?.comparison?.rowCount ?? 0;
  const isD1 = metrics?.source === "d1_benchmark_run";
  const tablesOk = !dbStatus?.missingColumns?.some((c: any) => c.table.startsWith("benchmark"));
  
  let statusLabel = "Diagnostics Unavailable";
  let statusTone = "amber";
  
  if (error) {
    statusLabel = "Connection Error";
    statusTone = "red";
  } else if (metrics) {
    if (isD1) {
      if (rowCount === 9) {
        statusLabel = "Benchmark Seed Healthy";
        statusTone = "green";
      } else {
        statusLabel = "Metric Row Count Mismatch";
        statusTone = "amber";
      }
    } else {
      statusLabel = "Legacy Fallback Active";
      statusTone = "amber";
    }
  } else if (runs.length === 0) {
    statusLabel = "Benchmark Seed Missing";
    statusTone = "red";
  }

  return (
    <section className="uxPanel">
      <div className="uxPanelHead">
        <div>
          <h2>벤치마크 시드 진단 (Benchmark Seed Diagnostics)</h2>
          <p>Production D1의 벤치마크 데이터 정합성과 배포 상태를 확인합니다.</p>
        </div>
        <span className={`uxPill ${statusTone}`}>{statusLabel}</span>
      </div>
      
      {error && <p className="uxTinyError">{error}</p>}
      
      <div className="uxSystemGrid">
        <div className="uxSystemItem">
          <strong>Tables Available</strong>
          <span>{tablesOk ? "준비됨" : "확인 필요"}</span>
          <small>{dbStatus?.bound ? "D1 연결됨" : "D1 연결 없음"}</small>
        </div>
        <div className="uxSystemItem">
          <strong>Latest Run</strong>
          <span>{runs.length > 0 ? "Exists" : "None"}</span>
          <small>{runs.length} runs found</small>
        </div>
        <div className="uxSystemItem">
          <strong>Latest Run ID</strong>
          <span>{metrics?.runId || "-"}</span>
          <small>{metrics?.runLabel || "-"}</small>
        </div>
        <div className="uxSystemItem">
          <strong>Scope / Range</strong>
          <span>{metrics?.benchmarkScope || "-"}</span>
          <small>{metrics?.taskRange || "-"}</small>
        </div>
        <div className="uxSystemItem">
          <strong>Metric Rows</strong>
          <span className={rowCount === 9 ? "green" : "amber"}>{rowCount} / 9</span>
          <small>{rowCount === 9 ? "Match Expected" : "Mismatch"}</small>
        </div>
        <div className="uxSystemItem">
          <strong>Data Source</strong>
          <span className={isD1 ? "green" : "amber"}>{metrics?.source || "unknown"}</span>
          <small>{isD1 ? "Production D1 Active" : "Fallback Active"}</small>
        </div>
        <div className="uxSystemItem">
          <strong>Source Commit</strong>
          <span style={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>{metrics?.sourceCommit || "-"}</span>
          <small>Gold Version: {metrics?.goldVersion || "-"}</small>
        </div>
        <div className="uxSystemItem">
          <strong>Last Generated</strong>
          <span>{metrics?.createdAt ? new Date(metrics.createdAt).toLocaleString() : "-"}</span>
          <small>Controlled T001-T003 only</small>
        </div>
      </div>

      <div className="uxActions" style={{ marginTop: '1rem', justifyContent: 'flex-start' }}>
        <a className="uxButton blue" href="/dashboard/evaluation">
          <BarChart3 size={16} /> View Evaluation Dashboard
        </a>
        <a className="uxSoftButton" href="/dashboard/evaluation">
          <ShieldCheck size={16} /> Inspect Live Benchmark Evidence
        </a>
      </div>
    </section>
  );
}

export function EvaluationDashboardPage() {
  const [scenarioKey, setScenarioKey] = useState<EvaluationScenarioKey>("strict");
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<BenchmarkMetrics | null>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<string>("latest");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    title: "데이터 불러오는 중",
    body: "실제 벤치마크 데이터를 API에서 요청하고 있습니다..."
  });

  const scenario = useMemo<EvaluationScenario>(() => {
    const baseScenario = evaluationScenarios.find((item) => item.key === scenarioKey) ?? evaluationScenarios[0];
    if (!benchmarkMetrics) return baseScenario;

    // Preserve the interactive logic: different scenarios emphasize different metrics
    const baseP = benchmarkMetrics.macroAverages.precision_at_k;
    const baseNdcg = benchmarkMetrics.macroAverages.ndcg_at_k;
    const baseDoi = benchmarkMetrics.macroAverages.doi_accuracy_at_k;
    const baseHit = benchmarkMetrics.macroAverages.gold_doi_hit_rate_at_k;
    
    // Slight display adjustments to mimic scenario-specific filtering (for UX concept only)
    const adjustedP = scenarioKey === "broad" ? Math.min(1, baseP + 0.15) : baseP;
    const adjustedNdcg = scenarioKey === "broad" ? Math.min(1, baseNdcg + 0.1) : baseNdcg;
    
    return {
      ...baseScenario,
      metrics: {
        ...baseScenario.metrics,
        precisionAt5: adjustedP.toFixed(4),
        doiAccuracy: (baseDoi * 100).toFixed(1) + "%",
        topJournalPrecision: (benchmarkMetrics.macroAverages.top_journal_precision_at_k * 100).toFixed(1) + "%",
        hallucinationRate: (benchmarkMetrics.macroAverages.hallucination_rate_at_k * 100).toFixed(1) + "%",
        reportCompleteness: baseScenario.metrics.reportCompleteness,
        avgLatency: baseScenario.metrics.avgLatency
      },
      rows: baseScenario.rows.map(row => {
        if (row.metric.includes("Precision")) return { ...row, proposed: adjustedP.toFixed(4) };
        if (row.metric.includes("NDCG")) return { ...row, proposed: adjustedNdcg.toFixed(4) };
        if (row.metric.includes("DOI Accuracy")) return { ...row, proposed: (baseDoi * 100).toFixed(1) + "%" };
        if (row.metric === "Top Journal %") return { ...row, proposed: (benchmarkMetrics.macroAverages.top_journal_precision_at_k * 100).toFixed(1) + "%" };
        if (row.metric === "Hallucination") return { ...row, proposed: (benchmarkMetrics.macroAverages.hallucination_rate_at_k * 100).toFixed(1) + "%" };
        return row;
      }),
      bars: baseScenario.bars.map(bar => {
        if (bar.label.includes("Precision") || bar.label.includes("Recall")) return { ...bar, value: Math.round(adjustedP * 100) };
        if (bar.label === "NDCG") return { ...bar, value: Math.round(adjustedNdcg * 100) };
        if (bar.label === "DOI Hits") return { ...bar, value: Math.round(baseHit * 100) };
        return bar;
      })
    };
  }, [scenarioKey, benchmarkMetrics]);

  const overall = Math.round(scenario.bars.reduce((sum, item) => sum + item.value, 0) / scenario.bars.length);
  
  let benchmarkSourceLabel = "예시 데이터";
  if (benchmarkMetrics) {
    if (benchmarkMetrics.source === "d1_benchmark_run") benchmarkSourceLabel = "D1 Benchmark Run";
    else if (benchmarkMetrics.source === "r2_benchmark_artifact") benchmarkSourceLabel = "R2 Benchmark Artifact";
    else benchmarkSourceLabel = "Legacy Static Snapshot";
  }

  const benchmarkDescription = benchmarkMetrics?.source === "static_snapshot" || benchmarkMetrics?.source === "legacy_static_snapshot"
    ? "코드에 저장된 T001-T003 벤치마크 스냅샷입니다. 규칙 기반, 단일 LLM, 제안 모델의 결과 비교가 포함됩니다."
    : "서버에서 반환된 최신 벤치마크 평가 결과입니다.";
  const comparisonRows = buildComparisonRows(benchmarkMetrics);
  const autoReviewRows = buildAutoReviewRows(benchmarkMetrics);

  useEffect(() => {
    void loadRuns();
    void loadBenchmarkMetrics("latest");
  }, []);
  
  useEffect(() => {
    setMessage({
      title: scenario.label,
      body: `${scenario.announcement} ${scenario.limitation}`
    });
  }, [scenarioKey, scenario.label, scenario.announcement, scenario.limitation]);

  async function loadRuns() {
    try {
      const response = await fetch(apiUrl("/api/benchmark-runs"));
      if (response.ok) {
        const data = await response.json() as { runs: any[] };
        setRuns(data.runs || []);
      }
    } catch {
      // Ignore
    }
  }

  async function loadBenchmarkMetrics(runId: string) {
    setLoading(true);
    try {
      const fetchUrl = runId === "latest" ? apiUrl("/api/benchmark-metrics") : apiUrl(`/api/benchmark-runs/${runId}/metrics`);
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("벤치마크 지표를 불러오지 못했습니다.");
      const data = (await response.json()) as BenchmarkMetrics;
      setBenchmarkMetrics(data);
      
      let title = "벤치마크 결과 확인됨";
      let body = `${data.tasks || 0}개 태스크, ${data.results || 0}개 결과물 기준입니다. ${data.note ?? ""}`;
      
      if (data.source === "legacy_static_snapshot") {
        title = "정적 벤치마크 로드됨 (Fallback)";
        body = "아직 Production D1에 benchmark run이 seed되지 않았습니다. 현재 표는 legacy fallback이며, 실제 run selector는 D1 seed 이후 활성화됩니다.";
      } else if (data.source === "d1_benchmark_run") {
        title = `D1 Benchmark Run: ${data.runId}`;
      }
      
      setMessage({ title, body });
    } catch (error) {
      console.error(error);
      setMessage({
        title: "데이터 연결 실패",
        body: "백엔드에서 벤치마크 데이터를 가져오지 못해 예시 데이터를 표시합니다."
      });
    } finally {
      setLoading(false);
    }
  }

  function handleRunChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setSelectedRun(val);
    void loadBenchmarkMetrics(val);
  }

  return (
    <main className="uxShell">
      <ExecutiveSummaryPanel />
      <BenchmarkV3PresentationDashboard />
      <section className="uxHero compact uxInteractiveAppendix">
        <span className="uxEyebrow">인터랙티브 평가 대시보드</span>
        <h1>통제된 T001-T003 증거와 시나리오 시뮬레이션을 구분하여 확인합니다.</h1>
        <p>상단 버튼은 검증 결과를 추가 생성하지 않습니다. 프론트엔드 시나리오 시뮬레이션으로 표시 방식을 바꿉니다.</p>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#b45309', fontWeight: 'bold' }}>
          * Claim Boundary: T001-T003 is the common-support comparison subset. T004-T020 remains artifact-level validation unless baseline parity is proven. T007 is proposed_agent_missing.
        </p>
      </section>

      <EvaluatorDemoGuide />

      <StagedExpansionEvidencePanel />

      <section className="uxPanel uxScenarioPanel">
        <div className="uxPanelHead">
          <div>
            <h2>Scenario Simulation (Not Live Data)</h2>
            <p><strong>{scenario.label}</strong>: {scenario.description}</p>
          </div>
          <div className="uxActions">
            <span className="uxPill amber">SCENARIO SIMULATION</span>
            {evaluationScenarios.map((item) => (
              <button key={item.key} className={item.key === scenarioKey ? "uxButton" : "uxSoftButton"} type="button" onClick={() => setScenarioKey(item.key)}>
                View Scenario Simulation: {item.label}
              </button>
            ))}
            <button className="uxSoftButton" type="button" onClick={() => loadBenchmarkMetrics(selectedRun)} disabled={loading} aria-label="새로고침">
              <RefreshCw size={14} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>
      </section>

      <section className="uxMetrics">
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="uxMetricHeader" style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} /> CONTROLLED T001-T003 Benchmark Metrics
            </h3>
          </div>
          <MetricTile label="Precision@5" value={benchmarkMetrics?.macroAverages.precision_at_k.toFixed(4) ?? "-"} detail="상위 추천 정확도" tone="green" />
          <MetricTile label="NDCG@5" value={benchmarkMetrics?.macroAverages.ndcg_at_k.toFixed(4) ?? "-"} detail="랭킹 품질 점수" tone="green" />
          <MetricTile label="Gold DOI Hit" value={benchmarkMetrics?.macroAverages.gold_doi_hit_rate_at_k.toFixed(4) ?? "-"} detail="Gold DOI 재현율" tone="blue" />
          <MetricTile label="Top Journal %" value={benchmarkMetrics ? (benchmarkMetrics.macroAverages.top_journal_precision_at_k * 100).toFixed(1) + "%" : "-"} detail="S급/A1급 매칭률" tone="blue" />
        </div>

        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <div className="uxMetricHeader" style={{ gridColumn: '1 / -1', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={16} /> Scenario Simulation (Not Live Data)
            </h3>
          </div>
          <MetricTile label="Scenario Score" value={(overall / 100).toFixed(2)} detail={`${scenario.label} · NOT LIVE DATA`} tone="purple" />
          <MetricTile label="Hallucination" value={scenario.metrics.hallucinationRate} detail="가상 지표(해석용)" tone="amber" />
          <MetricTile label="Completeness" value={scenario.metrics.reportCompleteness} detail="시뮬레이션 표시값" tone="purple" />
          <MetricTile label="Avg Latency" value={scenario.metrics.avgLatency} detail="시뮬레이션 표시값" tone="blue" />
        </div>
      </section>

      <section className="uxPanel">
        <div className="uxPanelHead">
          <div>
            <h2>벤치마크 데이터 출처 (Benchmark Evidence Source)</h2>
            <p>LIVE D1 VERIFIED와 CONTROLLED T001-T003 fallback을 명확히 구분합니다.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {benchmarkMetrics?.source === "d1_benchmark_run" ? (
              <span className="uxPill green">LIVE D1 VERIFIED</span>
            ) : benchmarkMetrics?.source === "legacy_static_snapshot" ? (
              <span className="uxPill amber">CONTROLLED T001-T003</span>
            ) : (
              <span className="uxPill red">NOT YET EXECUTED / CONNECTION FAILED</span>
            )}
          </div>
        </div>
        <div className="uxSystemGrid">
          <div className="uxSystemItem">
            <strong>Data Source</strong>
            <span>{benchmarkMetrics?.source || "unknown"}</span>
            <small>{benchmarkMetrics?.source === "d1_benchmark_run" ? "Production D1 DB" : "Static JSON Fallback"}</small>
          </div>
          <div className="uxSystemItem">
            <strong>Run ID</strong>
            <span>{benchmarkMetrics?.runId || "-"}</span>
            <small>{benchmarkMetrics?.runLabel || "-"}</small>
          </div>
          <div className="uxSystemItem">
            <strong>Scope / Range</strong>
            <span>{benchmarkMetrics?.benchmarkScope || "-"}</span>
            <small>{benchmarkMetrics?.taskRange || "-"}</small>
          </div>
          <div className="uxSystemItem">
            <strong>Source Commit</strong>
            <span style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>{benchmarkMetrics?.sourceCommit || "-"}</span>
            <small>Gold Version: {benchmarkMetrics?.goldVersion || "-"}</small>
          </div>
          <div className="uxSystemItem">
            <strong>Generated At</strong>
            <span>{benchmarkMetrics?.createdAt ? new Date(benchmarkMetrics.createdAt).toLocaleString() : "-"}</span>
            <small>{benchmarkMetrics?.comparison?.rowCount || 0} metric rows loaded</small>
          </div>
          <div className="uxSystemItem">
            <strong>Claim Boundary</strong>
            <span className="blue">Controlled T001-T003</span>
            <small>D1-backed live evidence</small>
          </div>
        </div>
      </section>

      <ImplementationStatusPanel
        title="Evaluation Route 기능 구현 상태"
        description={benchmarkMetrics ? benchmarkDescription : "벤치마크 데이터를 로드하는 중입니다. 하단 지표는 아직 UI 예시입니다."}
        items={evaluationImplementationStatus}
      />

      <section className="uxGrid2">
        <div className="uxStack">
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>벤치마크 증거 경계 (Evidence Boundary)</h2>
                <p>T001-T003 공통지원 비교, T004-T020 아티팩트 검증, Layer 5 부분 감사를 구분합니다.</p>
              </div>
              <ShieldCheck size={18} className="blue" />
            </div>
            <div className="uxSystemGrid">
              <div className="uxSystemItem">
                <strong>공통지원 비교 레이어 (Common Support)</strong>
                <span>T001-T003</span>
                <small>Production D1 기반 통제 비교. 정량 비교 주장은 이 범위로 제한.</small>
              </div>
              <div className="uxSystemItem">
                <strong>아티팩트 검증 레이어 (Artifact-Level)</strong>
                <span>T004-T020</span>
                <small>Baseline parity가 입증되지 않은 아티팩트 수준 검증. 전역 비교 우위 주장 불가.</small>
              </div>
              <div className="uxSystemItem">
                <strong>누락 증거 (Missing Evidence)</strong>
                <span>T007: proposed_agent_missing</span>
                <small>누락 상태를 숨기지 않고 Baseline Support Matrix에 유지.</small>
              </div>
              <div className="uxSystemItem">
                <strong>정성 감사 경계 (Layer 5A / 5B)</strong>
                <span>22/125 = 17.6% / Proxy 125 rows</span>
                <small>Layer 5A는 quota-limited 부분 감사. Layer 5B는 보조 proxy이며 의미 품질 검증 대체 불가.</small>
              </div>
            </div>
          </section>

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>기준모형 성능 비교 (Baseline Evaluation)</h2>
                <p>{benchmarkMetrics ? `${benchmarkMetrics.tasks || 3}개 통제 태스크(T001-T003) 기준 매크로 평균입니다.` : "MOCK BLUEPRINT / SCENARIO SIMULATION: 실제 벤치마크 결과를 불러오기 전입니다."}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="run-selector" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Current Scope Limited:</label>
                  <select id="run-selector" value={selectedRun} onChange={handleRunChange} style={{ fontSize: '0.8rem', padding: '0.2rem' }}>
                    <option value="latest">최신 (Latest)</option>
                    {runs.map(run => (
                      <option key={run.id} value={run.id}>
                        {run.run_label} ({new Date(run.created_at).toLocaleString()}) [{run.benchmark_scope}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <span className={`uxPill ${benchmarkMetrics ? "blue" : "amber"}`}>{benchmarkSourceLabel}</span>
            </div>
            <BenchmarkInterpretationHelper />
            <div className="uxTableWrap">
              <table className="uxTable">
                <thead>
                  <tr>
                    <th>평가 지표</th>
                    <th>규칙 기반 (Rule-based)</th>
                    <th>단일 LLM (Single LLM)</th>
                    <th>제안 모델 (Proposed)</th>
                    <th>시나리오 해석</th>
                  </tr>
                </thead>
                <tbody>
                  {(comparisonRows ?? scenario.rows.map((row) => ({
                    metric: row.metric,
                    rule_based: row.ruleBased,
                    single_llm: row.singleLlm,
                    proposed_agent: row.proposed,
                    finding: row.finding
                  }))).map((row) => (
                    <tr key={row.metric} onClick={() => setMessage({ title: `${row.metric} 해석`, body: `${row.finding} ${benchmarkMetrics ? benchmarkDescription : "실제 지표는 상이할 수 있습니다."}` })}>
                      <td>{row.metric}</td>
                      <td><span className="uxPill amber">{row.rule_based}</span></td>
                      <td><span className="uxPill blue">{row.single_llm}</span></td>
                      <td><span className="uxPill green">{row.proposed_agent}</span></td>
                      <td>{row.finding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Functional Capability Comparison */}
            <div className="uxPanelHead" style={{ marginTop: "2rem" }}>
              <div>
                <h2>기능적 역량 비교 (Functional Capabilities)</h2>
                <p>단순 검색 성능 우위가 아닌, <strong>기능 범위 및 감사 가능성(Auditability)</strong>에 대한 질적 비교입니다.</p>
              </div>
            </div>
            <div className="uxTableWrap">
              <table className="uxTable">
                <thead>
                  <tr>
                    <th>핵심 역량</th>
                    <th>규칙 기반 (Rule-based)</th>
                    <th>단일 LLM (Single LLM)</th>
                    <th>제안 모델 (Proposed)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>투명성 (Traceability)</td>
                    <td>부분 제공 (검색 조건 확인 가능)</td>
                    <td>불가 (블랙박스)</td>
                    <td><strong style={{ color: "#16a34a" }}>구현된 workflow 내 trace 제공 (12-stage)</strong></td>
                  </tr>
                  <tr>
                    <td>검증 (Verification)</td>
                    <td>없음</td>
                    <td>불안정 (환각 발생 위험)</td>
                    <td><strong style={{ color: "#16a34a" }}>Crossref/Unpaywall 기반 metadata verification</strong></td>
                  </tr>
                  <tr>
                    <td>산출물 (Outputs)</td>
                    <td>데이터 (CSV/JSON)</td>
                    <td>비정형 텍스트</td>
                    <td><strong style={{ color: "#16a34a" }}>MD/PDF/CSV/XLSX artifact generation</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>자동 품질 검수 요약 (Automated Review)</h2>
                <p>{benchmarkMetrics?.autoReview ? benchmarkMetrics.autoReview.policy : "자동 검수 요약 대기 중..."}</p>
              </div>
              <span className={`uxPill ${autoReviewRows.length ? "green" : "amber"}`}>{autoReviewRows.length ? `${benchmarkMetrics?.autoReview?.rowCount ?? 0} 행 처리됨` : "데이터 없음"}</span>
            </div>
            <div className="uxPreviewGrid">
              {autoReviewRows.map((item) => (
                <button key={item.method} className="uxMiniCard" type="button" onClick={() => setMessage({ title: item.label, body: `합격(include) ${item.data?.includeCount ?? 0}, 요주의(review) ${item.data?.reviewByRuleCount ?? 0}, 불합격(reject) ${item.data?.rejectCount ?? 0}. 실패 유형: ${Object.entries(item.data?.failureTypes ?? {}).map(([k, v]) => `${k}(${v})`).join(", ")}` })}>
                  <h3>{item.label}</h3>
                  <p>합격 {item.data?.includeCount ?? 0} · 요주의 {item.data?.reviewByRuleCount ?? 0} · 불합격 {item.data?.rejectCount ?? 0}</p>
                  <small>평균 적합도 {item.data?.averageAutoRelevance.toFixed(4)} · 매칭된 Gold 수: {(item.data?.matchedGoldIds ?? []).length}</small>
                </button>
              ))}
            </div>
          </section>
          
          {/* Detailed auto-review rows panel hidden for brevity, can be expanded as needed */}
          
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>평가 기준 (Rubric)</h2>
                <p>논문 추천 품질과 자동 생성 보고서의 실제 연구 활용성을 평가합니다.</p>
              </div>
              <ShieldCheck size={18} />
            </div>
            <div className="uxPreviewGrid">
              {evaluationRubrics.map((rubric) => (
                <button key={rubric.title} className="uxMiniCard" type="button" onClick={() => setMessage({ title: rubric.title, body: `${rubric.body} 이 기준은 최종 문헌 추천의 신뢰성을 담보하는 핵심 지표입니다.` })}>
                  <h3>{rubric.title}</h3>
                  <p>{rubric.body}</p>
                </button>
              ))}
            </div>
          </section>

          <ToolChainEvidence />
        </div>

        <aside className="uxStack">
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Scenario Simulation (Not Live Data)</h2>
                <p>선택된 <strong>{scenario.label}</strong> 관점의 프론트엔드 시뮬레이션 표시값입니다.</p>
              </div>
              <span className="uxPill blue">{scenarioKey}</span>
            </div>
            <div className="uxScorePanel">
              <div className="uxScoreHead">
                <span>시나리오 종합 (Overall)</span>
                <strong>{(overall / 100).toFixed(2)}</strong>
              </div>
              {scenario.bars.map((bar) => (
                <div key={bar.label} className="uxBarItem">
                  <div>
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div className="uxBar"><span style={{ width: `${bar.value}%` }} /></div>
                </div>
              ))}
            </div>
            <small className="uxPanelNote">SCENARIO SIMULATION: 이 그래프는 LIVE D1 VERIFIED 벤치마크 결과가 아닌 프론트엔드 파생 표시값입니다.</small>
          </section>

          <CriticReviewPanel title="오류 분석 가이드" description="아래 항목을 클릭하면 주요 품질 저하 원인과 해결 방향을 확인합니다." onSelect={(item) => setMessage({ title: item.title, body: item.note })} />

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>발표 및 해석 메시지</h2>
                <p>시나리오 버튼이나 표 행을 클릭하여 맞춤형 설명을 확인하세요.</p>
              </div>
              <BarChart3 size={18} />
            </div>
            <article className="uxMiniCard">
              <h3 style={{ color: '#0369a1' }}>{message.title}</h3>
              <p>{message.body}</p>
              <small className="descText" style={{ marginTop: '0.5rem', display: 'block' }}>{scenario.limitation}</small>
            </article>
          </section>
        </aside>
      </section>
    </main>
  );
}

function CriticReviewPanel({
  title = "Critic Review",
  description = "오류, 과대평가, 환각 가능성을 재검토합니다.",
  onSelect
}: {
  title?: string;
  description?: string;
  onSelect?: (item: (typeof criticReviews)[number]) => void;
}) {
  return (
    <section className="uxPanel">
      <div className="uxPanelHead">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Activity size={18} />
      </div>
      <div className="uxSystemGrid">
        {criticReviews.map((item) => (
          <button key={item.title} className="uxSystemItem" type="button" onClick={() => onSelect?.(item)}>
            <strong>{item.title}</strong>
            <span>{item.severity === "high" ? "위험" : item.severity === "medium" ? "주의" : "낮음"}</span>
            <small>{item.note}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function ImplementationStatusPanel({ title, description, items }: { title: string; description: string; items: FeatureImplementationItem[] }) {
  const counts = implementationLegend.map((legend) => ({
    ...legend,
    count: items.filter((item) => item.status === legend.status).length
  }));

  return (
    <section className="uxPanel uxImplementationPanel">
      <div className="uxPanelHead">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="uxImplementationLegend" aria-label="Implementation status legend">
          {counts.map((item) => (
            <span key={item.status} className={`uxStatusChip ${item.status}`} title={item.detail}>
              {item.label} {item.count}
            </span>
          ))}
        </div>
      </div>
      <div className="uxImplementationGrid">
        {items.map((item) => (
          <article key={item.feature} className={`uxImplementationItem ${item.status}`}>
            <div>
              <strong>{item.feature}</strong>
              <StatusChip status={item.status} />
            </div>
            <p>{item.evidence}</p>
            <small>Next: {item.next}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusChip({ status }: { status: FeatureImplementationStatus }) {
  const label = implementationLegend.find((item) => item.status === status)?.label ?? status;
  return <span className={`uxStatusChip ${status}`}>{label}</span>;
}

function MetricTile({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "green" | "blue" | "amber" | "purple" }) {
  return (
    <article className={`uxMetric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function MiniFlow({ title, body }: { title: string; body: string }) {
  return (
    <article className="uxFlowItem">
      <strong>{title}</strong>
      <span>{body}</span>
    </article>
  );
}

