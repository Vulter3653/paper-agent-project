import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const workerUrl = normalizeBaseUrl(process.env.WORKER_URL ?? "https://paper-agent-project.shch3653.workers.dev");
const mcpUrl = process.env.MCP_URL ?? "https://paper-agent-mcp.shch3653.workers.dev/mcp";
const requestedJobId = process.env.JOB_ID ?? process.env.MCP_JOB_ID;
const requireR2 = (process.env.REQUIRE_R2 ?? "true").toLowerCase() !== "false";

const client = new Client({
  name: "paper-agent-e2e-check",
  version: "0.1.0"
});

const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));

try {
  const diagnostics = await fetchJson(`${workerUrl}/api/diagnostics`);
  assert(diagnostics.ok, `Worker diagnostics are not ready: ${JSON.stringify(diagnostics)}`);

  const jobId = requestedJobId ?? (await findLatestCompletedJobId());
  assert(jobId, "No completed search job found. Run a dashboard search first, then retry.");

  const workerResult = await fetchJson(`${workerUrl}/api/search-jobs/${jobId}`);
  assert(workerResult.job?.status === "completed", `Worker job is not completed: ${workerResult.job?.status}`);
  assert(Array.isArray(workerResult.papers), "Worker result did not include papers array.");
  assert(workerResult.papers.length > 0, "Worker completed job has no papers.");

  await client.connect(transport);

  const mcpJob = parseToolJson(await client.callTool({ name: "get_search_job", arguments: { jobId } }));
  const mcpPapers = parseToolJson(await client.callTool({ name: "get_paper_results", arguments: { jobId, limit: 5 } }));
  const reportLinks = parseToolJson(await client.callTool({ name: "get_report_links", arguments: { jobId } }));

  assert(mcpJob.job?.id === workerResult.job.id, "MCP job ID does not match Worker job ID.");
  assert(mcpJob.job?.status === workerResult.job.status, "MCP job status does not match Worker job status.");
  assert(Array.isArray(mcpPapers.papers), "MCP paper result did not include papers array.");
  assert(mcpPapers.papers.length > 0, "MCP completed job has no papers.");
  assert(mcpPapers.papers[0]?.id === workerResult.papers[0]?.id, "Top paper differs between Worker API and MCP.");

  assert(reportLinks.csv?.apiPath?.endsWith("/papers.csv"), "MCP CSV link is missing.");
  assert(reportLinks.markdownReport?.apiPath?.endsWith("/report.md"), "MCP Markdown report link is missing.");

  const csvHead = await fetchHead(`${workerUrl}${reportLinks.csv.apiPath}`);
  const reportHead = await fetchHead(`${workerUrl}${reportLinks.markdownReport.apiPath}`);
  assert(csvHead.ok, `CSV endpoint is not reachable: ${csvHead.status}`);
  assert(reportHead.ok, `Markdown endpoint is not reachable: ${reportHead.status}`);

  if (requireR2) {
    assert(reportLinks.csv.existsInR2, `CSV object is not present in R2: ${reportLinks.csv.r2Key}`);
    assert(reportLinks.markdownReport.existsInR2, `Markdown report object is not present in R2: ${reportLinks.markdownReport.r2Key}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        workerUrl,
        mcpUrl,
        job: {
          id: workerResult.job.id,
          keyword: workerResult.job.keyword,
          status: workerResult.job.status,
          paperCount: workerResult.papers.length,
          topPaper: workerResult.papers[0]?.title ?? null
        },
        diagnostics: {
          searchProvider: diagnostics.searchProvider,
          activeProviderReady: diagnostics.readiness?.activeProviderReady,
          r2Reports: diagnostics.env?.r2Reports
        },
        r2: {
          requireR2,
          csv: {
            key: reportLinks.csv.r2Key,
            exists: reportLinks.csv.existsInR2,
            size: reportLinks.csv.size
          },
          markdownReport: {
            key: reportLinks.markdownReport.r2Key,
            exists: reportLinks.markdownReport.existsInR2,
            size: reportLinks.markdownReport.size
          }
        },
        endpoints: {
          csvStatus: csvHead.status,
          markdownStatus: reportHead.status
        }
      },
      null,
      2
    )
  );
} finally {
  await client.close();
}

async function findLatestCompletedJobId() {
  const jobs = await fetchJson(`${workerUrl}/api/search-jobs?limit=10`);
  return jobs.jobs?.find((job) => job.status === "completed")?.id;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${url} failed with ${response.status}: ${body}`);
  }
  return response.json();
}

async function fetchHead(url) {
  let response = await fetch(url, { method: "HEAD" });
  if (!response.ok) response = await fetch(url, { method: "GET" });
  return response;
}

function parseToolJson(result) {
  const text = result.content?.find((item) => item.type === "text")?.text ?? "{}";
  return JSON.parse(text);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeBaseUrl(value) {
  return value.replace(/\/$/, "");
}
