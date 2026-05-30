import type { PaperSummary, SearchJob } from "@paper-agent/shared";

export type CriticFlag = {
  paperRank: number;
  severity: "low" | "medium" | "high";
  flagType: string;
  message: string;
  evidence: string;
};

export type JobOutputRecord = {
  outputType: "csv" | "markdown" | "xlsx" | "pdf";
  status: "generated" | "stored" | "planned" | "failed";
  storage: "dynamic" | "r2" | "planned";
  key: string;
  urlPath: string;
  contentType: string;
  detail: string;
};

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected Worker error";
}

function getCriticFlagsForPaper(result: SearchResult, paper: PaperSummary): CriticFlag[] {
  return result.criticFlags?.filter((flag) => flag.paperRank === paper.rank) ?? [];
}

function getCriticRiskLevel(flags: CriticFlag[]): CriticFlag["severity"] | "clear" {
  if (flags.some((flag) => flag.severity === "high")) return "high";
  if (flags.some((flag) => flag.severity === "medium")) return "medium";
  if (flags.some((flag) => flag.severity === "low")) return "low";
  return "clear";
}

function buildKoreanCriticReviewSummary(paper: PaperSummary, flags: CriticFlag[]) {
  const riskLevel = getCriticRiskLevel(flags);
  const flagTypes = Array.from(new Set(flags.map((flag) => flag.flagType))).filter(Boolean);
  const decision = riskLevel === "high"
    ? "인용 전 수동 검토 필요"
    : riskLevel === "medium"
      ? "목표 검증 후 사용 가능"
      : riskLevel === "low"
        ? "접근 경로 확인 후 사용 가능"
        : "검토상 주요 문제 없음";
  const primaryIssue = flags[0]?.message ?? "이 논문에는 rule-based critic flag가 생성되지 않았습니다.";
  const actions = flags.length
    ? flags.slice(0, 3).map((flag) => getKoreanCriticAction(flag))
    : ["전문을 읽고 인용 가능성을 최종 검토하세요."];
  return {
    riskLevel,
    decision,
    primaryIssue,
    flagTypes: flagTypes.length ? flagTypes.join(", ") : "none",
    note: decision + ". " + primaryIssue,
    actions
  };
}

function buildEnglishCriticReviewSummary(paper: PaperSummary, flags: CriticFlag[]) {
  const riskLevel = getCriticRiskLevel(flags);
  const flagTypes = Array.from(new Set(flags.map((flag) => flag.flagType))).filter(Boolean);
  const decision = riskLevel === "high"
    ? "Manual review required before citation"
    : riskLevel === "medium"
      ? "Use after targeted verification"
      : riskLevel === "low"
        ? "Usable with access caveat"
        : "No critic issues detected";
  const primaryIssue = flags[0]?.message ?? "No rule-based critic flags were generated for this paper.";
  const actions = flags.length
    ? flags.slice(0, 3).map((flag) => getEnglishCriticAction(flag))
    : ["Proceed to full-text reading and citation screening."];
  return {
    riskLevel,
    decision,
    primaryIssue,
    flagTypes: flagTypes.length ? flagTypes.join(", ") : "none",
    note: decision + ". " + primaryIssue,
    actions
  };
}

function getKoreanCriticAction(flag: CriticFlag): string {
  if (flag.flagType === "missing_doi") return "DOI 또는 출판사 페이지에서 서지정보를 확인하세요.";
  if (flag.flagType === "hallucination_risk") return "제목, DOI, 저널, 연도, 저자 정보를 Crossref 또는 출판사 메타데이터와 대조하세요.";
  if (flag.flagType === "journal_quality") return "해당 저널이 승인된 S/A1 저널 목록에 포함되는지 확인하세요.";
  if (flag.flagType === "crossref_verification") return "제목, 연도, 저널, 저자, DOI를 Crossref 또는 출판사 메타데이터와 대조하세요.";
  if (flag.flagType === "low_relevance") return "초록과 서론을 읽고 연구질문과의 개념적 적합성을 확인하세요.";
  if (flag.flagType === "screening_status") return "현재 순위는 예비 선별 결과이므로 포함/검토/제외 여부를 수동으로 결정하세요.";
  if (flag.flagType === "low_impact_risk") return "인용 영향력이 낮으므로 최신 논문, 이론 논문, 특수 맥락 논문인지 확인하세요.";
  if (flag.flagType === "access_path") return "직접 OA 경로가 없으므로 DOI, 기관 구독, 도서관 접근을 사용하세요.";
  return "최종 문헌 종합에 사용하기 전 해당 검토 항목을 확인하세요.";
}

function getEnglishCriticAction(flag: CriticFlag): string {
  if (flag.flagType === "missing_doi") return "Locate DOI or confirm bibliographic metadata from publisher page before citing.";
  if (flag.flagType === "hallucination_risk") return "Verify title, DOI, journal, year, and authors against Crossref and publisher metadata.";
  if (flag.flagType === "journal_quality") return "Confirm whether this venue belongs to the approved S/A1 journal pool.";
  if (flag.flagType === "crossref_verification") return "Compare title, year, journal, authors, and DOI against Crossref or publisher metadata.";
  if (flag.flagType === "low_relevance") return "Read abstract/introduction to confirm conceptual fit with the research question.";
  if (flag.flagType === "screening_status") return "Treat ranking status as provisional and manually decide include, review, or exclude.";
  if (flag.flagType === "low_impact_risk") return "Treat citation impact as weak and check whether the paper is recent or theoretical.";
  if (flag.flagType === "access_path") return "Use DOI, library access, or institutional subscriptions because no direct OA path is recorded.";
  return "Review this flag before using the paper in final synthesis.";
}

export function summarizeCriticFlags(flags: CriticFlag[]) {
  return {
    total: flags.length,
    high: flags.filter((flag) => flag.severity === "high").length,
    medium: flags.filter((flag) => flag.severity === "medium").length,
    low: flags.filter((flag) => flag.severity === "low").length,
    byType: flags.reduce<Record<string, number>>((counts, flag) => {
      counts[flag.flagType] = (counts[flag.flagType] ?? 0) + 1;
      return counts;
    }, {})
  };
}

export type SearchResult = { job: SearchJob; papers: PaperSummary[]; criticFlags?: CriticFlag[] };

export async function persistSearchOutputs(reports: R2Bucket | undefined, result: SearchResult): Promise<JobOutputRecord[]> {
  const csvOutput: JobOutputRecord = {
    outputType: "csv",
    status: reports ? "stored" : "generated",
    storage: reports ? "r2" : "dynamic",
    key: getCsvOutputKey(result.job.id),
    urlPath: "/api/search-jobs/" + result.job.id + "/papers.csv",
    contentType: "text/csv; charset=utf-8",
    detail: reports ? "CSV persisted to R2." : "CSV is generated dynamically from D1 when requested."
  };
  const markdownOutput: JobOutputRecord = {
    outputType: "markdown",
    status: reports ? "stored" : "generated",
    storage: reports ? "r2" : "dynamic",
    key: getMarkdownReportOutputKey(result.job.id),
    urlPath: "/api/search-jobs/" + result.job.id + "/report.md",
    contentType: "text/markdown; charset=utf-8",
    detail: reports ? "Markdown report persisted to R2." : "Markdown report is generated dynamically from D1 when requested."
  };
  const xlsxOutput: JobOutputRecord = {
    outputType: "xlsx",
    status: reports ? "stored" : "generated",
    storage: reports ? "r2" : "dynamic",
    key: getXlsxOutputKey(result.job.id),
    urlPath: "/api/search-jobs/" + result.job.id + "/papers.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    detail: reports ? "XLSX workbook persisted to R2." : "XLSX workbook is generated dynamically from D1 when requested."
  };
  const pdfOutput: JobOutputRecord = {
    outputType: "pdf",
    status: reports ? "stored" : "generated",
    storage: reports ? "r2" : "dynamic",
    key: getPdfOutputKey(result.job.id),
    urlPath: "/api/search-jobs/" + result.job.id + "/report.pdf",
    contentType: "application/pdf",
    detail: reports ? "PDF report persisted to R2." : "PDF report is generated dynamically from D1 when requested."
  };

  if (!reports) return [csvOutput, markdownOutput, xlsxOutput, pdfOutput];

  try {
    await Promise.all([
      reports.put(csvOutput.key, getCsvBody(result), {
        httpMetadata: {
          contentType: csvOutput.contentType,
          contentDisposition: `attachment; filename="${getCsvFileName(result)}"`
        }
      }),
      reports.put(markdownOutput.key, getMarkdownReportBody(result), {
        httpMetadata: {
          contentType: markdownOutput.contentType,
          contentDisposition: `attachment; filename="${getMarkdownReportFileName(result)}"`
        }
      }),
      reports.put(xlsxOutput.key, getXlsxBody(result), {
        httpMetadata: {
          contentType: xlsxOutput.contentType,
          contentDisposition: `attachment; filename="${getXlsxFileName(result)}"`
        }
      }),
      reports.put(pdfOutput.key, getPdfBody(result), {
        httpMetadata: {
          contentType: pdfOutput.contentType,
          contentDisposition: `attachment; filename="${getPdfFileName(result)}"`
        }
      })
    ]);
    return [csvOutput, markdownOutput, xlsxOutput, pdfOutput];
  } catch (error) {
    const detail = "R2 output persistence failed: " + getErrorMessage(error);
    console.warn("R2 output persistence failed for " + result.job.id + ": " + getErrorMessage(error));
    return [
      { ...csvOutput, status: "failed", detail },
      { ...markdownOutput, status: "failed", detail },
      { ...xlsxOutput, status: "failed", detail },
      { ...pdfOutput, status: "failed", detail }
    ];
  }
}

export async function getStoredOutput(reports: R2Bucket | undefined, key: string, fileName: string): Promise<Response | null> {
  if (!reports) return null;
  const object = await reports.get(key);
  if (!object) return null;
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  if (!headers.has("Content-Disposition")) headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
  for (const [name, value] of Object.entries(corsHeaders())) headers.set(name, value);
  return new Response(object.body, { headers });
}

export function getCsvOutputKey(jobId: string): string {
  return `reports/${jobId}/papers.csv`;
}

export function getMarkdownReportOutputKey(jobId: string): string {
  return `reports/${jobId}/report.md`;
}

export function getXlsxOutputKey(jobId: string): string {
  return `reports/${jobId}/papers.xlsx`;
}

export function getPdfOutputKey(jobId: string): string {
  return `reports/${jobId}/report.pdf`;
}

export function getCsvFileName(result: SearchResult): string {
  return `${sanitizeFileName(result.job.keyword)}-${result.job.id}.csv`;
}

export function getMarkdownReportFileName(result: SearchResult): string {
  return `${sanitizeFileName(result.job.keyword)}-${result.job.id}-report.md`;
}

export function getXlsxFileName(result: SearchResult): string {
  return `${sanitizeFileName(result.job.keyword)}-${result.job.id}.xlsx`;
}

export function getPdfFileName(result: SearchResult): string {
  return `${sanitizeFileName(result.job.keyword)}-${result.job.id}-report.pdf`;
}

export function csv(result: SearchResult): Response {
  const body = getCsvBody(result);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getCsvFileName(result)}"`,
      ...corsHeaders()
    }
  });
}

function getCsvBody(result: SearchResult): string {
  return [getCsvHeaders(), ...getCsvBodyRows(result)].map((row) => row.map(formatCsvCell).join(",")).join("\n");
}

function getCsvHeaders(): string[] {
  return [
    "job_id",
    "keyword",
    "rank",
    "title",
    "authors",
    "year",
    "journal_name",
    "journal_field",
    "journal_rank",
    "doi",
    "oa_status",
    "publisher",
    "issn",
    "publication_type",
    "published_date",
    "verification_status",
    "verification_reason",
    "oa_pdf_url",
    "oa_landing_page_url",
    "oa_license",
    "oa_host_type",
    "oa_repository",
    "unpaywall_status",
    "unpaywall_reason",
    "drive_file_id",
    "drive_web_url",
    "drive_status",
    "drive_reason",
    "abstract_score",
    "relevance_score",
    "journal_fit_score",
    "verification_score",
    "oa_score",
    "citation_score",
    "recency_score",
    "final_score",
    "include_status",
    "relevance_reason"
  ];
}

function getCsvBodyRows(result: SearchResult): Array<Array<string | number>> {
  return result.papers.map((paper) => [
    result.job.id,
    result.job.keyword,
    paper.rank,
    paper.title,
    paper.authors,
    paper.year,
    paper.journalName,
    paper.journalField ?? "",
    paper.journalRank ?? "",
    paper.doi,
    paper.oaStatus,
    paper.publisher ?? "",
    paper.issn ?? "",
    paper.publicationType ?? "",
    paper.publishedDate ?? "",
    paper.verificationStatus ?? "",
    paper.verificationReason ?? "",
    paper.oaPdfUrl ?? "",
    paper.oaLandingPageUrl ?? "",
    paper.oaLicense ?? "",
    paper.oaHostType ?? "",
    paper.oaRepository ?? "",
    paper.unpaywallStatus ?? "",
    paper.unpaywallReason ?? "",
    paper.driveFileId ?? "",
    paper.driveWebUrl ?? "",
    paper.driveStatus ?? "",
    paper.driveReason ?? "",
    paper.abstractScore,
    paper.relevanceScore ?? "",
    paper.journalFitScore ?? "",
    paper.verificationScore ?? "",
    paper.oaScore ?? "",
    paper.citationScore ?? "",
    paper.recencyScore ?? "",
    paper.finalScore,
    paper.includeStatus,
    paper.relevanceReason
  ]);
}

export function pdf(result: SearchResult): Response {
  return new Response(getPdfBody(result), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${getPdfFileName(result)}"`,
      ...corsHeaders()
    }
  });
}

function getPdfBody(result: SearchResult): Uint8Array {
  const lines = getPdfReportLines(result);
  const pages = paginatePdfLines(lines);
  const objects: string[] = ["", "<< /Type /Catalog /Pages 2 0 R >>", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  const pageObjectIds: number[] = [];

  for (const pageLines of pages) {
    const stream = getPdfPageStream(pageLines);
    const contentObjectId = objects.length;
    objects.push("<< /Length " + stream.length + " >>\nstream\n" + stream + "endstream");
    const pageObjectId = objects.length;
    objects.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents " + contentObjectId + " 0 R >>");
    pageObjectIds.push(pageObjectId);
  }

  objects[2] = "<< /Type /Pages /Kids [" + pageObjectIds.map((id) => id + " 0 R").join(" ") + "] /Count " + pageObjectIds.length + " >>";
  return encodePdfObjects(objects);
}

function getPdfReportLines(result: SearchResult): string[] {
  const summary = summarizeReport(result.papers);
  const reportInsights = buildEnglishReportInsights(result.papers);
  const criticSummary = summarizeCriticFlags(result.criticFlags ?? []);
  const lines = [
    "Paper Agent Report [English Output Version]",
    "==================",
    "Job ID: " + result.job.id,
    "Keyword: " + result.job.keyword,
    "Generated at: " + new Date().toISOString(),
    "Paper count: " + result.papers.length,
    "Include / Review / Exclude: " + summary.includeCount + " / " + summary.reviewCount + " / " + summary.excludeCount,
    "Average final score: " + formatReportScore(summary.averageFinalScore),
    "Critic flags: " + criticSummary.total + " total (high " + criticSummary.high + ", medium " + criticSummary.medium + ", low " + criticSummary.low + ")",
    "",
    "Executive Summary",
    "-----------------",
    `This report contains ${result.papers.length} allowlisted journal results for "${result.job.keyword}".`,
    `The corpus spans ${summary.yearRange} and includes ${summary.journalCount} distinct journals.`,
    `Crossref verification found ${summary.verifiedCount} verified results, and Unpaywall found ${summary.oaPdfCount} PDFs.`,
    "",
    "Key Findings",
    "------------",
    ...reportInsights.keyFindings,
    "",
    "Common Themes",
    "-------------",
    ...reportInsights.commonThemes,
    "",
    "Research Gaps",
    "-------------",
    ...reportInsights.researchGaps,
    "",
    "Top Ranked Papers",
    "-----------------"
  ];

  for (const paper of result.papers.slice(0, 20)) {
    const critic = buildEnglishCriticReviewSummary(paper, getCriticFlagsForPaper(result, paper));
    lines.push(
      "",
      String(paper.rank) + ". " + paper.title,
      "   Authors: " + paper.authors,
      "   Year / Journal: " + (paper.year || "Unknown") + " / " + paper.journalName,
      "   Field / Rank: " + ([paper.journalField, paper.journalRank].filter(Boolean).join(" / ") || "Unmatched"),
      "   Final score: " + formatReportScore(paper.finalScore) + " / Status: " + paper.includeStatus,
      "   DOI: " + (paper.doi || "Not available"),
      "   Critic: " + critic.note,
      "   Action: " + critic.actions[0],
      "   Reason: " + paper.relevanceReason
    );
  }

  lines.push("", "Limitations", "-----------", ...reportInsights.limitations);

  return lines.flatMap((line) => wrapPdfLine(normalizePdfText(line), 92));
}

function paginatePdfLines(lines: string[]): string[][] {
  const pageSize = 48;
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += pageSize) pages.push(lines.slice(index, index + pageSize));
  return pages.length ? pages : [["Paper Agent Report", "No content available."]];
}

function getPdfPageStream(lines: string[]): string {
  const escapedLines = lines.map((line) => "(" + escapePdfString(line) + ") Tj T*").join("\n");
  return "BT\n/F1 10 Tf\n14 TL\n54 738 Td\n" + escapedLines + "\nET\n";
}

function encodePdfObjects(objects: string[]): Uint8Array {
  const encoder = new TextEncoder();
  const parts: string[] = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  let length = encoder.encode(parts[0]).length;

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = length;
    const objectBody = index + " 0 obj\n" + objects[index] + "\nendobj\n";
    parts.push(objectBody);
    length += encoder.encode(objectBody).length;
  }

  const xrefOffset = length;
  const xrefRows = offsets.slice(1).map((offset) => String(offset).padStart(10, "0") + " 00000 n ");
  const trailer = "xref\n0 " + objects.length + "\n0000000000 65535 f \n" + xrefRows.join("\n") + "\ntrailer\n<< /Size " + objects.length + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n";
  parts.push(trailer);
  return encoder.encode(parts.join(""));
}

function wrapPdfLine(line: string, width: number): string[] {
  if (line.length <= width) return [line];
  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? current + " " + word : word;
    if (candidate.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function normalizePdfText(value: string): string {
  return value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "?");
}

function escapePdfString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function xlsx(result: SearchResult): Response {
  return new Response(getXlsxBody(result), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${getXlsxFileName(result)}"`,
      ...corsHeaders()
    }
  });
}

function getXlsxBody(result: SearchResult): Uint8Array {
  const files: Array<{ name: string; body: string }> = [
    { name: "[Content_Types].xml", body: getXlsxContentTypesXml() },
    { name: "_rels/.rels", body: getXlsxRootRelsXml() },
    { name: "xl/workbook.xml", body: getXlsxWorkbookXml() },
    { name: "xl/_rels/workbook.xml.rels", body: getXlsxWorkbookRelsXml() },
    { name: "xl/worksheets/sheet1.xml", body: getXlsxWorksheetXml(result) }
  ];
  return createZip(files);
}

function getXlsxContentTypesXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '</Types>';
}

function getXlsxRootRelsXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>';
}

function getXlsxWorkbookXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="Ranked Papers" sheetId="1" r:id="rId1"/></sheets></workbook>';
}

function getXlsxWorkbookRelsXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '</Relationships>';
}

function getXlsxWorksheetXml(result: SearchResult): string {
  const rows = [getCsvHeaders(), ...getCsvBodyRows(result)];
  const xmlRows = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const cellRef = columnName(columnIndex + 1) + String(rowIndex + 1);
      return '<c r="' + cellRef + '" t="inlineStr"><is><t>' + escapeXml(String(value ?? '')) + '</t></is></c>';
    }).join('');
    return '<row r="' + String(rowIndex + 1) + '">' + cells + '</row>';
  }).join('');
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<sheetData>' + xmlRows + '</sheetData></worksheet>';
}

function columnName(index: number): string {
  let name = "";
  let current = index;
  while (current > 0) {
    current -= 1;
    name = String.fromCharCode(65 + (current % 26)) + name;
    current = Math.floor(current / 26);
  }
  return name;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function createZip(files: Array<{ name: string; body: string }>): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const bodyBytes = encoder.encode(file.body);
    const crc = crc32(bodyBytes);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, bodyBytes.length, true);
    localView.setUint32(22, bodyBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, bodyBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, bodyBytes.length, true);
    centralView.setUint32(24, bodyBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);
    offset += localHeader.length + bodyBytes.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return concatUint8Arrays([...localParts, ...centralParts, endRecord]);
}

function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function markdownReport(result: SearchResult): Response {
  const body = getMarkdownReportBody(result);
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getMarkdownReportFileName(result)}"`,
      ...corsHeaders()
    }
  });
}

function formatKoreanJobStatus(status: string | undefined): string {
  const map: Record<string, string> = {
    "completed": "완료",
    "failed": "실패",
    "searching": "검색 중",
    "scoring": "점수 계산 중",
    "reviewing": "검토 중",
    "generating_report": "보고서 생성 중",
    "delivery": "전달 완료"
  };
  return map[status ?? ""] ?? status ?? "알 수 없음";
}

function formatKoreanStep(step: string | undefined): string {
  if (!step) return "알 수 없음";
  const map: Record<string, string> = {
    "planner": "계획",
    "wos_search": "WoS 검색",
    "openalex_search": "OpenAlex 검색",
    "journal_filter": "저널 필터",
    "journal_selector": "저널 선별",
    "crossref_enrichment": "Crossref 보강",
    "unpaywall_check": "Unpaywall 확인",
    "drive_r2_storage": "저장소 업로드",
    "vectorize_relevance": "벡터 관련성",
    "journal_evaluation": "저널 평가",
    "ranking": "순위 계산",
    "critic_review": "비평 검토",
    "report_generation": "보고서 생성",
    "delivery": "전달 완료",
    "completed": "완료"
  };
  return map[step] ?? step;
}

function formatKoreanIncludeStatus(status: string | undefined): string {
  if (status === "include") return "포함";
  if (status === "review") return "검토 필요";
  if (status === "exclude") return "제외";
  return status ?? "알 수 없음";
}

function formatKoreanRiskLevel(level: string | undefined): string {
  if (level === "high") return "높음";
  if (level === "medium") return "주의";
  if (level === "low") return "낮음";
  if (level === "clear") return "문제 없음";
  return level ?? "알 수 없음";
}

function formatKoreanVerificationStatus(status: string | undefined): string {
  if (status === "verified") return "검증됨";
  if (status === "partial") return "부분 검증";
  if (status === "unverified") return "미검증";
  if (status === "failed") return "실패";
  if (status === "skipped") return "건너뜀";
  if (!status) return "검증되지 않음";
  return status;
}

function formatKoreanAvailability(value: string | undefined): string {
  if (!value) return "확인 불가";
  return value;
}

function formatKoreanBoolean(value: boolean | string | undefined): string {
  if (value === true || value === "Yes") return "있음";
  if (value === false || value === "No" || !value) return "없음";
  return String(value);
}

function formatKoreanOutputStatus(status: string | undefined): string {
  if (!status) return "알 수 없음";
  const map: Record<string, string> = {
    "stored": "저장됨",
    "generated": "생성됨",
    "success": "성공",
    "found": "확인됨",
    "not_found": "확인 불가",
    "failed": "실패",
    "skipped": "건너뜀",
    "planned": "예정"
  };
  return map[status] ?? status;
}

function getMarkdownReportBody(result: SearchResult): string {
  const summary = summarizeReport(result.papers);
  const reportInsights = buildKoreanReportInsights(result.papers);
  const criticSummary = summarizeCriticFlags(result.criticFlags ?? []);
  const topCriticFlags = (result.criticFlags ?? []).filter((flag) => flag.severity === "high" || flag.severity === "medium").slice(0, 8);
  const lines = [
    `# Paper Agent 문헌 검색 보고서`,
    "",
    `- 작업 ID: ${result.job.id}`,
    `- 검색 키워드: ${result.job.keyword}`,
    `- 작업 상태: ${formatKoreanJobStatus(result.job.status)}`,
    `- 현재 단계: ${formatKoreanStep(result.job.currentStep)}`,
    `- 생성 시각: ${result.job.createdAt}`,
    `- 완료 시각: ${result.job.completedAt ?? "완료되지 않음"}`,
    `- 보고서 생성 시각: ${new Date().toISOString()}`,
    `- 논문 수: ${result.papers.length}`,
    `- 자동 포함: ${summary.includeCount}`,
    `- 검토 필요: ${summary.reviewCount}`,
    `- 제외: ${summary.excludeCount}`,
    `- OA PDF 확인: ${summary.oaPdfCount}`,
    `- 평균 최종 점수: ${formatReportScore(summary.averageFinalScore)}`,
    "",
    "## 전체 요약",
    "",
    `이 보고서는 검색 키워드 "${result.job.keyword}"에 대해 허용된 저널 목록을 통과한 논문 ${result.papers.length}건을 포함합니다.`,
    summary.topPaper ? `가장 높은 순위의 논문은 "${summary.topPaper.title}"이며, 최종 점수는 ${formatReportScore(summary.topPaper.finalScore)}입니다.` : "저장된 논문이 없어 최고 순위 논문은 표시할 수 없습니다.",
    `Crossref 메타데이터 검증 결과 ${summary.verifiedCount}건이 검증되었고, Unpaywall 기준 직접 접근 가능한 OA PDF는 ${summary.oaPdfCount}건 확인되었습니다.`,
    `Critic Agent는 총 ${criticSummary.total}개의 검토 필요 항목을 생성했습니다. 위험 수준별로 높음 ${criticSummary.high}개, 주의 ${criticSummary.medium}개, 낮음 ${criticSummary.low}개입니다.`,
    `검색 결과는 ${summary.yearRange} 기간의 논문을 포함하며, 총 ${summary.journalCount}개의 서로 다른 저널이 포함되었습니다.`,
    "",
    "## 핵심 결과",
    "",
    ...formatBulletList(reportInsights.keyFindings),
    "",
    "## 공통 연구 흐름",
    "",
    ...formatBulletList(reportInsights.commonThemes),
    "",
    "## 방법론 및 맥락 차이",
    "",
    ...formatBulletList(reportInsights.differences),
    "",
    "## 연구 공백",
    "",
    ...formatBulletList(reportInsights.researchGaps),
    "",
    "## 추천 읽기 순서",
    "",
    ...formatNumberedList(reportInsights.readingOrder),
    "",
    "## 검토 필요 항목 요약",
    "",
    `- 전체 검토 항목 수: ${criticSummary.total}`,
    `- 위험 수준 분포: 높음 ${criticSummary.high}, 주의 ${criticSummary.medium}, 낮음 ${criticSummary.low}`,
    ...formatBulletList(topCriticFlags.length ? topCriticFlags.map((flag) => `순위 ${flag.paperRank}: ${formatKoreanRiskLevel(flag.severity)} - ${flag.flagType} - ${flag.message}`) : ["이 작업에 대해 생성된 높음(high) 또는 주의(medium) 수준의 비평 항목이 없습니다."]),
    "",
    "## 선별 검토 메모",
    "",
    ...formatBulletList(reportInsights.screeningNotes),
    "",
    "## 한계 및 주의사항",
    "",
    ...formatBulletList(reportInsights.limitations),
    "",
    "## 상위 논문 표",
    "",
    "| 순위 | 제목 | 연도 | 저널 | 분야 | 저널 등급 | 최종 점수 | 선별 상태 | 검토 위험 | DOI | OA PDF |",
    "| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |",
    ...result.papers.map((paper) =>
      [
        paper.rank,
        escapeMarkdownTableCell(paper.title),
        paper.year || "알 수 없음",
        escapeMarkdownTableCell(paper.journalName),
        escapeMarkdownTableCell(paper.journalField ?? "매칭 없음"),
        escapeMarkdownTableCell(paper.journalRank ?? "매칭 없음"),
        formatReportScore(paper.finalScore),
        formatKoreanIncludeStatus(paper.includeStatus),
        formatKoreanRiskLevel(buildKoreanCriticReviewSummary(paper, getCriticFlagsForPaper(result, paper)).riskLevel),
        paper.doi ? escapeMarkdownTableCell(paper.doi) : "확인 불가",
        paper.oaPdfUrl ? "있음" : "없음"
      ].join(" | ")
    ).map((row) => `| ${row} |`),
    "",
    "## 순위별 논문 상세",
    ""
  ];

  if (!result.papers.length) {
    lines.push("이 작업에 대해 허용된 저널 결과가 저장되지 않았습니다.", "");
  }

  for (const paper of result.papers) {
    const critic = buildKoreanCriticReviewSummary(paper, getCriticFlagsForPaper(result, paper));
    lines.push(
      `### ${paper.rank}. ${paper.title}`,
      "",
      `- 저자: ${paper.authors}`,
      `- 연도: ${paper.year || "알 수 없음"}`,
      `- 저널: ${paper.journalName}`,
      `- 분야 / 등급: ${[paper.journalField, paper.journalRank].filter(Boolean).join(" / ") || "매칭 없음"}`,
      `- DOI: ${paper.doi || "확인 불가"}`,
      `- 오픈액세스 상태: ${paper.oaStatus}`,
      `- 최종 점수: ${paper.finalScore.toFixed(3)}`,
      `- 선별 상태: ${formatKoreanIncludeStatus(paper.includeStatus)}`,
      `- 인용 수: ${paper.citedByCount ?? 0}`,
      `- 출판사: ${formatKoreanAvailability(paper.publisher)}`,
      `- 검증 상태: ${formatKoreanVerificationStatus(paper.verificationStatus)} - ${paper.verificationReason ?? "기록된 검증 내용이 없습니다."}`,
      `- Unpaywall 확인: ${formatKoreanOutputStatus(paper.unpaywallStatus)} - ${paper.unpaywallReason ?? "기록된 Unpaywall 조회가 없습니다."}`,
      `- OA PDF: ${formatKoreanAvailability(paper.oaPdfUrl)}`,
      `- OA landing page: ${formatKoreanAvailability(paper.oaLandingPageUrl)}`,
      `- Google Drive: ${formatKoreanOutputStatus(paper.driveStatus)} - ${paper.driveWebUrl || paper.driveReason || "Google Drive 업로드 기록이 없습니다."}`,
      `- 라이선스: ${[paper.oaLicense, paper.oaHostType, paper.oaRepository].filter(Boolean).join(" / ") || "확인 불가"}`,
      `- 검토 요약: ${critic.note}`,
      `- 검토 위험: ${formatKoreanRiskLevel(critic.riskLevel)}`,
      `- 검토 유형: ${critic.flagTypes}`,
      "",
      "검토 권장 조치:",
      "",
      ...formatBulletList(critic.actions),
      "",
      "점수 구성:",
      "",
      `- 관련성: ${formatReportScore(paper.relevanceScore ?? paper.abstractScore)}`,
      `- 저널 적합도: ${formatReportScore(paper.journalFitScore ?? 1)}`,
      `- Crossref 검증: ${formatReportScore(paper.verificationScore ?? 0)}`,
      `- 오픈액세스: ${formatReportScore(paper.oaScore ?? 0)}`,
      `- 인용: ${formatReportScore(paper.citationScore ?? 0)}`,
      `- 최신성: ${formatReportScore(paper.recencyScore ?? 0)}`,
      "",
      `관련성 판단 근거: ${paper.relevanceReason}`,
      ""
    );
  }

  return `${lines.join("\n")}\n`;
}


function summarizeReport(papers: PaperSummary[]) {
  const includeCount = papers.filter((paper) => paper.includeStatus === "include").length;
  const reviewCount = papers.filter((paper) => paper.includeStatus === "review").length;
  const excludeCount = papers.filter((paper) => paper.includeStatus === "exclude").length;
  const verifiedCount = papers.filter((paper) => paper.verificationStatus === "verified").length;
  const oaPdfCount = papers.filter((paper) => Boolean(paper.oaPdfUrl)).length;
  const averageFinalScore = papers.length ? papers.reduce((total, paper) => total + paper.finalScore, 0) / papers.length : 0;
  const years = papers.map((paper) => paper.year).filter((year) => year > 0);
  const yearRange = years.length ? `${Math.min(...years)}-${Math.max(...years)}` : "연도 미상";
  const journalCount = new Set(papers.map((paper) => paper.journalName).filter(Boolean)).size;
  return {
    includeCount,
    reviewCount,
    excludeCount,
    verifiedCount,
    oaPdfCount,
    averageFinalScore,
    yearRange,
    journalCount,
    topPaper: papers[0]
  };
}

function buildKoreanReportInsights(papers: PaperSummary[]) {
  if (!papers.length) {
    return {
      keyFindings: ["허용된 저널 목록을 통과한 논문이 없어 실질적인 종합 요약을 제공할 수 없습니다."],
      commonThemes: ["검색 결과가 없으므로 반복되는 주제를 추론할 수 없습니다."],
      differences: ["검색 결과가 없으므로 방법론 또는 맥락의 차이를 비교할 수 없습니다."],
      researchGaps: ["더 넓은 검색어, 연도 조정 또는 다른 검색 제공자를 사용하여 다시 시도하세요."],
      readingOrder: ["추천 읽기 순서를 확인하려면 먼저 허용된 저널 논문을 반환하는 검색을 실행하세요."],
      screeningNotes: ["허용 저널 목록을 통과한 논문이 없으므로 후속 해석 작업이 중단되었습니다."],
      limitations: ["이 보고서는 전문(full-text) 정성 검토가 아닌 메타데이터와 단순한 채점 규칙으로 생성되었습니다."]
    };
  }

  const topPapers = papers.slice(0, 5);
  const includePapers = papers.filter((paper) => paper.includeStatus === "include");
  const reviewPapers = papers.filter((paper) => paper.includeStatus === "review");
  const verifiedShare = papers.filter((paper) => paper.verificationStatus === "verified").length / papers.length;
  const oaPdfPapers = papers.filter((paper) => Boolean(paper.oaPdfUrl));
  const journals = getTopCounts(papers.map((paper) => paper.journalName).filter(Boolean), 5);
  const years = papers.map((paper) => paper.year).filter((year) => year > 0);
  const newestYear = years.length ? Math.max(...years) : null;
  const oldestYear = years.length ? Math.min(...years) : null;
  const topicTerms = getTopTopicTerms(papers, 8);

  return {
    keyFindings: [
      `검색, 저널 필터링, 메타데이터 보강, 순위 계산을 거쳐 허용 저널 목록에 포함된 논문 ${papers.length}건이 유지되었습니다.`,
      `${includePapers.length}건은 자동 포함 기준을 충족했으며, ${reviewPapers.length}건은 최종 활용 전 수동 검토가 필요합니다.`,
      `유지된 결과의 ${Math.round(verifiedShare * 100)}%가 Crossref를 통해 메타데이터 수준에서 검증되었습니다.`,
      oaPdfPapers.length
        ? `${oaPdfPapers.length}건의 결과에 즉시 읽을 수 있는 직접적인 오픈액세스 PDF URL이 포함되어 있습니다.`
        : `현재 유지된 논문 중 직접 접근 가능한 OA PDF URL이 확인된 논문은 없습니다. 접근 가능성은 DOI 또는 출판사 landing page를 통해 추가 확인해야 합니다.`
    ],
    commonThemes: [
      topicTerms.length
        ? `제목에서 자주 등장하는 키워드는 ${formatInlineList(topicTerms, "ko")} 등이며, 이는 유지된 문헌들의 주요 주제적 군집을 시사합니다.`
        : "유지된 제목들에서 신뢰할 만한 주제 흐름을 유추할 만큼 반복되는 키워드가 충분하지 않습니다.",
      journals.length
        ? `가장 빈번하게 등장한 저널 출처는 ${journals.map((item) => `${item.label} (${item.count}건)`).join(", ")}입니다.`
        : "저널 집중도를 평가할 수 없습니다.",
      "이 순위 결과는 승인된 경영대학 저널 목록에 한정되므로, 전체 학문 분야의 지형도라기보다는 최고 수준 저널들의 관심사로 해석해야 합니다."
    ],
    differences: [
      newestYear && oldestYear
        ? `출판 연도는 ${oldestYear}년부터 ${newestYear}년까지 걸쳐 있으므로, 인용 수가 높은 과거 논문과 떠오르는 최신 논문을 구분하여 해석해야 합니다.`
        : "출판 연도 범위 정보가 불완전합니다.",
      "인용 점수와 최신성 점수가 상이한 논문들을 선호할 수 있으므로, 핵심 문헌을 선정할 때 두 가지 모두에서 강점을 보이는 논문을 우선 고려하세요.",
      "논문마다 오픈액세스 접근성이 다르므로, 바로 다운로드할 수 있다는 점이 증거의 품질을 대변하는 것으로 취급되어서는 안 됩니다."
    ],
    researchGaps: [
      reviewPapers.length
        ? `${reviewPapers.length}건의 결과가 여전히 검토(review) 상태에 있습니다. 수동 선별 과정에서 개념적 적합성, 실증적 맥락, 방법론의 연관성을 확인해야 합니다.`
        : "검토 상태에 남아 있는 논문은 없지만, 최종 포함을 결정하기 전에는 수동 선별이 여전히 필요합니다.",
      "현재의 관련성 점수는 메타데이터에 기반하고 있습니다. 최종 문헌 종합 전에 전문(full-text) 내용 또는 초록 전체에 대한 정성 검토가 보완되어야 합니다.",
      "검색 제공자별 차이가 존재할 수 있습니다: 현재 테스트용으로 OpenAlex가 사용 중일 수 있으며, Web of Science로 전환한 후 최종 품질 확인을 반복해야 합니다."
    ],
    readingOrder: topPapers.map((paper) => `${paper.title} (${paper.year || "연도 미상"}) - 최종 점수 ${formatReportScore(paper.finalScore)}, 선별 상태: ${formatKoreanIncludeStatus(paper.includeStatus)}.`),
    screeningNotes: [
      "자동으로 판정된 '포함(include)' 상태는 완전한 채택 결정이 아닌, 분류를 위한 참고 신호로 활용하세요.",
      "논문을 인용하기 전, Crossref 검증 과정에서 발생한 제목, 연도, 저널 불일치 이유를 반드시 확인하세요.",
      "직접 연결된 OA PDF 링크가 있는 논문을 우선적으로 읽은 후, 접근이 제한된 논문은 DOI 랜딩 페이지를 통해 접근 방식을 탐색하세요."
    ],
    limitations: [
      "이 보고서는 서지 메타데이터, 순위 산출 알고리즘, OA 확인 결과를 바탕으로 자동 생성되었으며, 전문가의 전문(full-text) 정성 검토를 완벽히 대체하지 않습니다.",
      "현재 OpenAlex를 기반으로 한 테스트 실행은 Web of Science API 승인이 보류 중인 동안 워크플로우를 검증하기 위한 것입니다.",
      "저널 Allowlist 필터링은 목록에 없는 출처를 의도적으로 배제합니다. 이는 품질 관리에 유리하지만 관련성 높은 타 분야 융합 연구가 누락될 수 있습니다.",
      "이 보고서는 아직 초록이나 전문에서 구체적인 내러티브 주장을 직접 추출하여 요약하지 않으며, 해당 기능은 추후 추가될 예정입니다."
    ]
  };
}

function buildEnglishReportInsights(papers: PaperSummary[]) {
  if (!papers.length) {
    return {
      keyFindings: ["No allowlisted journal results were saved, so substantive synthesis is not available."],
      commonThemes: ["No recurring themes can be inferred from an empty result set."],
      differences: ["No method or context differences can be compared from an empty result set."],
      researchGaps: ["Repeat the search with broader terms, adjusted years, or a different source provider."],
      readingOrder: ["Run a search that returns allowlisted journal results before using the reading order."],
      screeningNotes: ["All downstream interpretation is blocked because no papers passed the journal allowlist."],
      limitations: ["This report is generated from metadata and simple scoring rules, not a full-text qualitative review."]
    };
  }

  const topPapers = papers.slice(0, 5);
  const includePapers = papers.filter((paper) => paper.includeStatus === "include");
  const reviewPapers = papers.filter((paper) => paper.includeStatus === "review");
  const verifiedShare = papers.filter((paper) => paper.verificationStatus === "verified").length / papers.length;
  const oaPdfPapers = papers.filter((paper) => Boolean(paper.oaPdfUrl));
  const journals = getTopCounts(papers.map((paper) => paper.journalName).filter(Boolean), 5);
  const years = papers.map((paper) => paper.year).filter((year) => year > 0);
  const newestYear = years.length ? Math.max(...years) : null;
  const oldestYear = years.length ? Math.min(...years) : null;
  const topicTerms = getTopTopicTerms(papers, 8);

  return {
    keyFindings: [
      `${papers.length} allowlisted result${papers.length === 1 ? "" : "s"} were retained after source search, journal filtering, metadata enrichment, and ranking.`,
      `${includePapers.length} paper${includePapers.length === 1 ? "" : "s"} met the automatic include threshold; ${reviewPapers.length} require manual review before final use.`,
      `${Math.round(verifiedShare * 100)}% of retained results were verified by Crossref at the metadata level.`,
      oaPdfPapers.length
        ? `${oaPdfPapers.length} result${oaPdfPapers.length === 1 ? "" : "s"} include a direct open-access PDF URL for immediate reading.`
        : "No retained result currently has a direct open-access PDF URL; use DOI or landing pages for access checks."
    ],
    commonThemes: [
      topicTerms.length
        ? `Recurring title terms include ${formatInlineList(topicTerms, "en")}, suggesting the dominant topical clusters in the retained set.`
        : "The retained titles do not provide enough repeated terms for a reliable theme signal.",
      journals.length
        ? `The most frequent journal source${journals.length === 1 ? " is" : "s are"} ${journals.map((item) => `${item.label} (${item.count})`).join(", ")}.`
        : "Journal concentration could not be assessed.",
      "The ranked set is restricted to the approved business school journal list, so the themes should be interpreted as top-journal signals rather than a complete field map."
    ],
    differences: [
      newestYear && oldestYear
        ? `Publication years range from ${oldestYear} to ${newestYear}, so older high-citation papers and newer emerging papers should be interpreted separately.`
        : "Publication year coverage is incomplete.",
      "Citation score and recency score may favor different papers; prioritize papers that are strong on both when selecting core readings.",
      "Open-access availability differs across papers, so download readiness should not be treated as evidence quality."
    ],
    researchGaps: [
      reviewPapers.length
        ? `${reviewPapers.length} result${reviewPapers.length === 1 ? "" : "s"} remain in review status; manual screening should check conceptual fit, empirical context, and method relevance.`
        : "No papers remain in review status, but manual screening is still required before final inclusion.",
      "The current relevance score is metadata-based. Full abstract or full-text embedding review should be added before final literature synthesis.",
      "Provider differences remain a known gap: OpenAlex is currently used for testing, and final quality checks must be repeated after switching to Web of Science."
    ],
    readingOrder: topPapers.map((paper) => `${paper.title} (${paper.year || "unknown year"}) - final score ${formatReportScore(paper.finalScore)}, ${paper.includeStatus}.`),
    screeningNotes: [
      "Use include status as a triage signal, not as a final acceptance decision.",
      "Check Crossref verification reason for title, year, and journal mismatches before citing a paper.",
      "Prioritize papers with direct OA PDF links for fast first-pass reading, then use DOI landing pages for closed-access papers."
    ],
    limitations: [
      "This report is generated from bibliographic metadata, ranking features, and OA checks; it is not a substitute for full-text expert review.",
      "Current OpenAlex-based test runs are for workflow validation while WoS API approval is pending.",
      "Journal allowlist filtering intentionally excludes non-allowlisted venues, which improves scope control but may omit relevant interdisciplinary work.",
      "The report does not yet generate narrative claims from abstracts or full texts; those should be added with a future summarization or embedding stage."
    ]
  };
}

function getTopCounts(values: string[], limit: number): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
    .slice(0, limit);
}

function getTopTopicTerms(papers: PaperSummary[], limit: number): string[] {
  const stopWords = new Set([
    "about",
    "after",
    "analysis",
    "based",
    "between",
    "business",
    "case",
    "effect",
    "effects",
    "from",
    "into",
    "journal",
    "management",
    "market",
    "marketing",
    "paper",
    "review",
    "study",
    "systematic",
    "theory",
    "through",
    "using",
    "with"
  ]);
  const terms = papers.flatMap((paper) => tokenize(paper.title)).filter((term) => term.length > 3 && !stopWords.has(term));
  return getTopCounts(terms, limit).map((item) => item.label);
}

function formatInlineList(values: string[], lang: "ko" | "en" = "en"): string {
  if (values.length <= 1) return values[0] ?? "";
  if (lang === "ko") {
    if (values.length === 2) return `${values[0]} 및 ${values[1]}`;
    return `${values.slice(0, -1).join(", ")}, 그리고 ${values[values.length - 1]}`;
  }
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function formatBulletList(items: string[]): string[] {
  return items.map((item) => `- ${item}`);
}

function formatNumberedList(items: string[]): string[] {
  return items.map((item, index) => `${index + 1}. ${item}`);
}

function formatReportScore(value: number): string {
  return value.toFixed(3);
}

function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function formatCsvCell(value: string | number): string {
  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function tokenize(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export function sanitizeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "papers";
}
