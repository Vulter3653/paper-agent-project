# Debug Log

This file records debugging and troubleshooting work that affects implementation, deployment, or verification. Update it whenever a defect is investigated or a verification run changes project confidence.

## 2026-05-13 - CSV Export Endpoint Verification

### Context

The project needed a CSV download path because R2 is unavailable during the MVP due to billing constraints. The intended flow was:

```text
Dashboard Run
-> Worker creates/searches a job
-> D1 persists job, papers, evaluations
-> Dashboard Download button calls GET /api/search-jobs/:id/papers.csv
-> Worker generates CSV directly from D1
```

### Code Changes Under Test

- Added Worker route:

```text
GET /api/search-jobs/:id/papers.csv
```

- Added CSV generation helpers in `apps/worker/src/index.ts`.
- Added dashboard CSV button in `apps/web/src/main.tsx`.
- Added button layout styling in `apps/web/src/styles.css`.

### Verification Commands

Static checks:

```bash
npm run typecheck
npm run build
npx wrangler deploy --dry-run
```

All three passed.

Runtime check:

```bash
npx wrangler dev --port 8787 --ip 127.0.0.1
```

Create a local search job:

```bash
curl -s -X POST http://127.0.0.1:8787/api/search-jobs \
  -H 'Content-Type: application/json' \
  -d '{"keyword":"AI interview employer branding","maxResults":2}'
```

Observed:

- HTTP 200.
- Response contained a completed job.
- Response contained OpenAlex-derived paper results.

CSV check:

```bash
curl -s -D - http://127.0.0.1:8787/api/search-jobs/job-a0b2e7ba-cef1-4c49-a8f4-bf33cd699983/papers.csv | head -n 20
```

Observed:

- HTTP 200.
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition` attachment filename was set.
- CSV header row was present.
- CSV rows included rank, title, authors, DOI, OA status, scores, and relevance reason.

### Troubleshooting Notes

- The previous turn was interrupted after implementation and verification but before documentation and commit.
- No `wrangler dev` process remained running after interruption.
- No code rollback was required.
- The local runtime emitted non-blocking `workerd` RPC messages during dev server execution, but API calls completed successfully with HTTP 200 responses.
- The CSV endpoint depends on an existing job ID. A browser GET to `/api/search-jobs` still returns `{"error":"Not found"}` because that route is intentionally POST-only.

### Resolution

The CSV export implementation is locally verified. Remaining action: commit, push, wait for Cloudflare deployment, and verify the deployed dashboard download button.
