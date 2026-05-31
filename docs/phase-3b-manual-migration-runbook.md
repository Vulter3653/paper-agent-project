# Phase 3B Production D1 Migration Manual Runbook

## 1. Overview
Due to headless environment authentication limits (Wrangler OAuth requirements), the Production D1 migration for T004-T020 expansion must be executed manually from a local machine with browser access.

**CRITICAL MANDATE: No verified backup, no migration.**

## 2. Prerequisites
- A local terminal with a browser-authenticated session.
- Access to the `paper_agent_db` Cloudflare D1 database.
- Repository at commit `f4e0575bb1a7342f3880d5f54cea2b0db8631b38` or newer.

## 3. Manual Execution Procedure

### Step 1: Login
```bash
npx wrangler login
```

### Step 2: Confirm Repository State
```bash
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
git ls-remote origin refs/heads/main
```

### Step 3: Pre-checks
```bash
node scripts/verify-live-benchmark.mjs
npm run benchmark:audit-gold
npm run typecheck
npm run build:web
```

### Step 4: Backup Export
**DO NOT SKIP.** This is the only rollback point.
```bash
mkdir -p backups/d1
BACKUP_PATH="backups/d1/backup_pre_migration_0007_manual_$(date -u +"%Y%m%dT%H%M%SZ").sql"
npx wrangler d1 export paper_agent_db --remote --output="$BACKUP_PATH"
echo "$BACKUP_PATH"
ls -lh "$BACKUP_PATH"
test -s "$BACKUP_PATH" && echo "D1 backup verified"
```

### Step 5: Migration Execution
Only execute if the backup file in Step 4 is verified (non-zero size).
```bash
npx wrangler d1 execute paper_agent_db --remote --file=apps/worker/migrations/0007_add_benchmark_batch_columns.sql
```

### Step 6: Post-migration Schema Verification
```bash
npx wrangler d1 execute paper_agent_db --remote --command "PRAGMA table_info(benchmark_runs);"
npx wrangler d1 execute paper_agent_db --remote --command "PRAGMA table_info(benchmark_run_tasks);"
npx wrangler d1 execute paper_agent_db --remote --command "PRAGMA index_list(benchmark_runs);"
npx wrangler d1 execute paper_agent_db --remote --command "PRAGMA index_list(benchmark_run_tasks);"
```

### Step 7: Post-migration Integrity Checks
```bash
node scripts/verify-live-benchmark.mjs
npm run typecheck
npm run build:web
```

## 4. Reporting
After successful execution, provide the raw output of **Step 6** and **Step 7** to the agent to proceed with Phase 3C (Verification & Documentation).

**RESTRICTIONS:**
- No T004-T020 benchmark execution during this phase.
- No D1 seed/import.
- No SQL modifications.
