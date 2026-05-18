import { useMemo, useState } from "react";
import { Activity, BarChart3, Cloud, FileText, Play, ShieldCheck } from "lucide-react";
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
import "./dashboard.css";

export type DashboardRoute = "research" | "ops" | "evaluation";

export function resolveDashboardRoute(pathname = window.location.pathname): DashboardRoute {
  if (pathname.includes("/dashboard/ops")) return "ops";
  if (pathname.includes("/dashboard/evaluation")) return "evaluation";
  return "research";
}

export function DashboardNav({ activeRoute }: { activeRoute: DashboardRoute }) {
  const routes: Array<{ id: DashboardRoute; label: string; href: string }> = [
    { id: "research", label: "1. Research Studio", href: "/dashboard/research" },
    { id: "ops", label: "2. Agent Ops", href: "/dashboard/ops" },
    { id: "evaluation", label: "3. Evaluation", href: "/dashboard/evaluation" }
  ];

  return (
    <header className="uxTopbar">
      <div className="uxTopbarInner">
        <a className="uxBrand" href="/dashboard/research">
          <span className="uxBrandMark">PA</span>
          <span>
            <strong>Paper Agent</strong>
            <small>MON AI Team dashboard</small>
          </span>
        </a>
        <nav className="uxNav" aria-label="Dashboard routes">
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

export function ResearchExperiencePanels({ isRunning }: { isRunning: boolean }) {
  const completedCount = isRunning ? 7 : 10;
  const progress = Math.round((completedCount / literatureWorkflowStages.length) * 100);

  return (
    <>
      <section className="uxHero">
        <div className="uxHeroGrid">
          <div>
            <span className="uxEyebrow">Interactive Research Studio</span>
            <h1>Top Journal 기반 문헌검색, 검증, 보고서 생성을 한 화면에서 관리합니다.</h1>
            <p>검색 실행 후 12단계 workflow, DOI/Crossref 검증, OA PDF/R2 상태, ranked papers, paper detail, literature review preview를 함께 확인합니다.</p>
            <div className="uxHeroFlow">
              <MiniFlow title="Research Input" body="키워드, 연구 질문, 분야, 기간 입력" />
              <MiniFlow title="Top Journal Filter" body="국제 S급 우선, 국제 A1급 후순위 검색" />
              <MiniFlow title="Paper Verification" body="DOI, Crossref, OA, 저장 상태 검증" />
              <MiniFlow title="Review Output" body="Summary, Difference, Gap, Critic Note 생성" />
            </div>
          </div>
          <aside className="uxSearchSummary">
            <h2>Workflow Snapshot</h2>
            <p>현재 실제 Run 버튼은 아래 검색 영역과 연결되어 있으며, 이 패널은 최종 UI 기준의 진행 시각화입니다.</p>
            <div className="uxProgressTrack">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="uxSnapshotGrid">
              <MetricTile label="Retrieved" value="128" detail="candidate papers" tone="blue" />
              <MetricTile label="DOI Validity" value="96%" detail="Crossref matched" tone="green" />
              <MetricTile label="Top Pool" value="18" detail="approved journals" tone="purple" />
              <MetricTile label="Review" value="3" detail="critic flagged" tone="amber" />
            </div>
          </aside>
        </div>
      </section>

      <ImplementationStatusPanel
        title="Research Route Implementation Status"
        description="이 페이지는 실제 API 기능과 최종 UI mock 패널이 함께 있습니다."
        items={researchImplementationStatus}
      />

      <section className="uxPanel uxWorkflowPanel">
        <div className="uxPanelHead">
          <div>
            <h2>12-step Literature Review Workflow</h2>
            <p>Planner부터 Delivery까지 agent별 담당 단계와 진행률을 시각화합니다.</p>
          </div>
          <span className={`uxPill ${isRunning ? "blue" : "green"}`}>{isRunning ? "Running" : "Ready"}</span>
        </div>
        <div className="uxProgressTrack">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="uxSteps12">
          {literatureWorkflowStages.map((stage) => (
            <article key={stage.id} className={`uxStep ${stage.status}`}>
              <span>{stage.order}</span>
              <strong>{stage.title}</strong>
              <small>{stage.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="uxGrid2 uxRouteBlock">
        <section className="uxPanel">
          <div className="uxPanelHead">
            <div>
              <h2>Top Journal Pool</h2>
              <p>경영대학 학술지 목록을 검색 우선순위와 Q1 상태로 분리합니다.</p>
            </div>
            <span className="uxPill blue">S then A1</span>
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
              <h2>Literature Review Preview</h2>
              <p>선택 논문과 job 결과를 기반으로 생성될 보고서 섹션 구조입니다.</p>
            </div>
            <FileText size={18} />
          </div>
          <div className="uxPreviewGrid">
            {literaturePreview.map((item) => (
              <article key={item.title} className="uxMiniCard">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}

export function AgentOpsPage() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(8);
  const [logs, setLogs] = useState(toolCallLogs);
  const progress = Math.round((step / literatureWorkflowStages.length) * 100);

  function launchJob() {
    setRunning(true);
    setStep(12);
    setLogs([
      ...toolCallLogs,
      { level: "ok", message: "Vectorize.upsert abstract_embeddings=128" },
      { level: "warn", message: "Critic flagged adjacent journal ambiguity=2" },
      { level: "ok", message: "ReportAgent.export completed PDF / XLSX / Markdown" }
    ]);
    window.setTimeout(() => setRunning(false), 700);
  }

  function inspectAgent(name: string) {
    setLogs((current) => [...current, { level: "muted", message: `${name}.inspect status requested` }]);
  }

  return (
    <main className="uxShell">
      <section className="uxHero">
        <div className="uxHeroGrid">
          <div>
            <span className="uxEyebrow cyan">Interactive Agent Ops</span>
            <h1>Multi-Agent 실행 상태와 tool call 흐름을 운영 관점에서 추적합니다.</h1>
            <p>Launch 버튼은 agent card, 12단계 pipeline, console log, D1/R2/Drive/Vectorize 상태를 함께 갱신합니다.</p>
          </div>
          <aside className="uxSearchSummary">
            <h2>Launch Agent Job</h2>
            <label className="uxField">
              <span>Keyword</span>
              <input defaultValue="AI interview employer branding" />
            </label>
            <div className="uxFieldGrid">
              <label className="uxField">
                <span>Provider</span>
                <select defaultValue="wos">
                  <option value="wos">Web of Science</option>
                  <option value="openalex">OpenAlex test mode</option>
                </select>
              </label>
              <label className="uxField">
                <span>Pipeline</span>
                <select defaultValue="full">
                  <option value="full">Full 12-step</option>
                  <option value="search">Search only</option>
                </select>
              </label>
            </div>
            <button className="uxButton green" type="button" onClick={launchJob}>
              <Play size={18} />
              Launch Agent Job
            </button>
          </aside>
        </div>
      </section>

      <section className="uxMetrics">
        <MetricTile label="Job" value={running ? "Running" : "Completed"} detail="job_id: preview" tone="green" />
        <MetricTile label="Tool Calls" value={String(logs.length * 3 + 6)} detail="search / verify / export" tone="blue" />
        <MetricTile label="Agents" value="12" detail="planner to report" tone="purple" />
        <MetricTile label="Warnings" value="3" detail="critic review" tone="amber" />
        <MetricTile label="Storage" value="Ready" detail="D1 / R2 / Drive" tone="green" />
        <MetricTile label="Vectorize" value={step >= 10 ? "Indexed" : "Waiting"} detail="abstract embeddings" tone="blue" />
      </section>

      <ImplementationStatusPanel
        title="Ops Route Implementation Status"
        description="운영 화면은 현재 최종 UI와 상호작용을 검증하는 단계이며, agent trace/API 연결이 다음 단계입니다."
        items={opsImplementationStatus}
      />

      <section className="uxGrid2">
        <div className="uxStack">
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Multi-Agent Status Board</h2>
                <p>Agent card를 클릭하면 해당 agent의 상태 로그가 console에 추가됩니다.</p>
              </div>
              <span className={`uxPill ${running ? "blue" : "green"}`}>{running ? "Agents running" : "All core agents online"}</span>
            </div>
            <div className="uxAgentGrid">
              {agentStatuses.map((agent) => (
                <button key={agent.name} className="uxMiniCard uxAgentCard" type="button" onClick={() => inspectAgent(agent.name)}>
                  <h3>{agent.name}</h3>
                  <p>{agent.role}</p>
                  <span className={`uxPill ${agent.state === "review" ? "amber" : agent.state === "running" ? "blue" : agent.state === "done" ? "green" : "gray"}`}>{agent.state}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Pipeline Execution</h2>
                <p>12단계 문헌검토 workflow의 운영 상태입니다.</p>
              </div>
              <span className={`uxPill ${running ? "blue" : "green"}`}>{progress}%</span>
            </div>
            <div className="uxProgressTrack">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="uxSteps12">
              {literatureWorkflowStages.map((stage, index) => (
                <article key={stage.id} className={`uxStep ${index + 1 < step ? "done" : index + 1 === step && running ? "running" : index === 9 ? "review" : "idle"}`}>
                  <span>{stage.order}</span>
                  <strong>{stage.title}</strong>
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
                <h2>Tool Call Console</h2>
                <p>Worker, MCP, 외부 API 호출 결과 로그입니다.</p>
              </div>
              <button className="uxSoftButton" type="button" onClick={() => setLogs([])}>Clear</button>
            </div>
            <div className="uxTerminal">
              {logs.map((log, index) => (
                <div key={`${log.message}-${index}`} className={log.level}>
                  <span>$</span> {log.message}
                </div>
              ))}
            </div>
          </section>

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Storage and Runtime</h2>
                <p>D1, R2, Google Drive, Vectorize, MCP 상태입니다.</p>
              </div>
              <Cloud size={18} />
            </div>
            <div className="uxSystemGrid">
              {systemStatuses.map((item) => (
                <button key={item.name} className="uxSystemItem" type="button" onClick={() => setLogs((current) => [...current, { level: "ok", message: `${item.name}.status checked: ${item.status}` }])}>
                  <strong>{item.name}</strong>
                  <span>{item.status}</span>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
          </section>

          <CriticReviewPanel />
        </aside>
      </section>
    </main>
  );
}

export function EvaluationDashboardPage() {
  const [scenarioKey, setScenarioKey] = useState<EvaluationScenarioKey>("strict");
  const [message, setMessage] = useState({
    title: "핵심 주장",
    body: "단일 LLM은 추천과 요약은 가능하지만 DOI 검증, 저널 품질 판정, PDF 저장, research gap 도출까지 안정적으로 처리하기 어렵습니다. Proposed Multi-Agent는 단계를 분리하고 검증하여 더 신뢰 가능한 문헌검토 자동화를 제공합니다."
  });
  const scenario = useMemo<EvaluationScenario>(() => evaluationScenarios.find((item) => item.key === scenarioKey) ?? evaluationScenarios[0], [scenarioKey]);
  const overall = Math.round(scenario.bars.reduce((sum, item) => sum + item.value, 0) / scenario.bars.length);

  return (
    <main className="uxShell">
      <section className="uxHero compact">
        <span className="uxEyebrow">Interactive Evaluation Dashboard</span>
        <h1>Baseline 대비 Proposed Multi-Agent의 성능과 실패 유형을 비교합니다.</h1>
        <p>Scenario 버튼을 누르면 평가 수치, baseline 비교표, score breakdown, presentation message가 함께 변경됩니다.</p>
      </section>

      <section className="uxPanel uxScenarioPanel">
        <div className="uxPanelHead">
          <div>
            <h2>Evaluation Scenario</h2>
            <p>발표와 검수 상황에 맞춰 strict, broad, fast mode를 전환합니다.</p>
          </div>
          <div className="uxActions">
            {evaluationScenarios.map((item) => (
              <button key={item.key} className={item.key === scenarioKey ? "uxButton" : "uxSoftButton"} type="button" onClick={() => setScenarioKey(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="uxMetrics">
        <MetricTile label="Precision@5" value={scenario.metrics.precisionAt5} detail="Proposed Agent" tone="green" />
        <MetricTile label="DOI Accuracy" value={scenario.metrics.doiAccuracy} detail="Crossref verified" tone="green" />
        <MetricTile label="Top Journal Precision" value={scenario.metrics.topJournalPrecision} detail="Q1 / pool matched" tone="blue" />
        <MetricTile label="Hallucination Rate" value={scenario.metrics.hallucinationRate} detail="critic filtered" tone="amber" />
        <MetricTile label="Report Completeness" value={scenario.metrics.reportCompleteness} detail="rubric score" tone="purple" />
        <MetricTile label="Avg Latency" value={scenario.metrics.avgLatency} detail="full workflow" tone="blue" />
      </section>

      <ImplementationStatusPanel
        title="Evaluation Route Implementation Status"
        description="평가 화면은 현재 benchmark 구조와 mock scenario가 공존합니다. 실제 점수 연결은 benchmark full run 이후 진행합니다."
        items={evaluationImplementationStatus}
      />

      <section className="uxGrid2">
        <div className="uxStack">
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Baseline Evaluation Dashboard</h2>
                <p>Rule-based vs Single LLM vs Proposed Multi-Agent 비교입니다.</p>
              </div>
              <span className="uxPill green">Proposed Agent Best</span>
            </div>
            <div className="uxTableWrap">
              <table className="uxTable">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Rule-based</th>
                    <th>Single LLM</th>
                    <th>Proposed Multi-Agent</th>
                    <th>Finding</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.rows.map((row) => (
                    <tr key={row.metric} onClick={() => setMessage({ title: row.metric, body: `${row.finding} 따라서 proposed agent의 단계별 검증 구조가 평가상 핵심 강점입니다.` })}>
                      <td>{row.metric}</td>
                      <td><span className="uxPill amber">{row.ruleBased}</span></td>
                      <td><span className="uxPill blue">{row.singleLlm}</span></td>
                      <td><span className="uxPill green">{row.proposed}</span></td>
                      <td>{row.finding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Evaluation Rubric</h2>
                <p>논문 추천 품질과 보고서 활용 가능성을 같이 평가합니다.</p>
              </div>
              <ShieldCheck size={18} />
            </div>
            <div className="uxPreviewGrid">
              {evaluationRubrics.map((rubric) => (
                <button key={rubric.title} className="uxMiniCard" type="button" onClick={() => setMessage({ title: rubric.title, body: `${rubric.body} 이 기준은 최종 문헌 추천의 품질을 검수하기 위한 핵심 지표입니다.` })}>
                  <h3>{rubric.title}</h3>
                  <p>{rubric.body}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="uxStack">
          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Score Breakdown</h2>
                <p>Proposed Agent의 종합 평가 점수입니다.</p>
              </div>
              <span className="uxPill green">Overall {overall}%</span>
            </div>
            <div className="uxScorePanel">
              <div className="uxScoreHead">
                <span>Overall Quality</span>
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
          </section>

          <CriticReviewPanel title="Error Analysis" description="클릭하면 presentation message에 개선 방향이 표시됩니다." onSelect={(item) => setMessage({ title: item.title, body: item.note })} />

          <section className="uxPanel">
            <div className="uxPanelHead">
              <div>
                <h2>Presentation Message</h2>
                <p>선택한 평가 요소에 따라 발표 문구가 바뀝니다.</p>
              </div>
              <BarChart3 size={18} />
            </div>
            <article className="uxMiniCard">
              <h3>{message.title}</h3>
              <p>{message.body}</p>
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
            <span>{item.severity}</span>
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
            <small>{item.next}</small>
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
