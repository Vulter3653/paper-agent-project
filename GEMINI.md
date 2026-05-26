# Gemini Operating Guide

Updated: 2026-05-26

This file gives Gemini the same repository rules used by Codex and Claude. Gemini must follow this file before editing anything.

## Start Here

Run:

```bash
git status --short --branch
git log --oneline -8
```

Read in this order:

```text
AGENTS.md
docs/agent-writing-rules.md
docs/progress.md
docs/team-collaboration.md
docs/agent-work-queue.md
CHANGELOG.md
docs/debug-log.md
```

Do not start from memory or an old chat transcript.

## Gemini Attribution

Gemini-authored work must use:

```text
(gemini)
```

Example:

```text
- Docs: Updated prototype notes for dashboard UI review. (gemini)
```

Do not rewrite `(codex)`, `(claude)`, or any team-member attribution.

## Repository & Push Protocol

1. **Personal Repo Priority:** All development work and pushes are based on the personal repository (`origin`) by default.
   - `origin https://github.com/Vulter3653/paper-agent-project.git`
2. **Inquiry Before Push:** After completing any task, Gemini must summarize the changes and explicitly inquire: **"Where (which remote/branch) and what should be pushed?"**
3. **No Automatic Push:** Never perform `git push` without explicit user confirmation of the target and content.

## Scope

Gemini may edit only the files assigned in the current user request or in `docs/agent-work-queue.md`.

Do not edit source code, Cloudflare configuration, D1/R2 configuration, or deployment files unless the user explicitly assigns that work.

`seunghyeon_choi/` is the current maintainer workspace. Do not edit it unless explicitly assigned.

## Required Documentation & Logging

Follow `docs/agent-writing-rules.md`.

1. **Strict Management:** Every rule modification or log update must be strictly managed and recorded.
2. **Mandatory Updates:**
   - Update `CHANGELOG.md` for meaningful changes.
   - Update `docs/progress.md` for handoff-affecting changes.
   - Update `docs/debug-log.md` for defects, verification, or troubleshooting (including refactoring errors).

## Verification

Use the same verification rules as Codex:

```bash
npm run benchmark:evaluate-proposed
npm run typecheck
npm run build:web
npm run smoke:worker
npm run smoke:mcp
```

Run only the commands relevant to the change and record what passed or was not run.
