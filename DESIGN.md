# Paper Agent Design System

Updated: 2026-05-31

This plain-text design system guides coding agents. It synthesizes documentation-first readability, monochrome precision, structured workflow clarity, readable analytics panels, and agent-tool identity for Paper Agent. It does not copy an external brand.

## 1. Visual Theme & Atmosphere
Paper Agent is an academic evidence dashboard, not a marketing site. Use calm white surfaces, black and gray typography, thin borders, compact cards, and visible evidence labels. Status must remain understandable without color alone.

## 2. Color Palette & Roles
| Role | Color | Usage |
| --- | --- | --- |
| Canvas | `#f8fafc` | background |
| Surface | `#ffffff` | panels |
| Primary text | `#0f172a` | headings |
| Secondary text | `#64748b` | descriptions |
| Evidence blue | `#2563eb` | artifact evidence and links |
| Verified green | `#15803d` | audited controlled benchmark only |
| Infra amber | `#b45309` | timeout, HTTP 503, incomplete execution |
| Planned purple | `#7c3aed` | planned or simulation-only features |
| Demo gray | `#475569` | mock examples and technical metadata |
Do not use decorative gradients. Green must not imply broad validation.

## 3. Typography Rules
- Use the existing system sans-serif stack.
- Reserve large headings for route-level titles.
- Use `1.05rem` to `1.1rem` body text in evaluator summaries.
- Use monospace only for traces, IDs, commits, and artifact paths.
- Keep letter spacing at `0`; wrap long identifiers safely.

## 4. Component Styling Rules
- Panels: white surface, 1px border, radius no larger than 8px, restrained shadow.
- Evidence cards: short label, direct value, explanation, visible text badge.
- Status badges: always include text.
- Tables: local horizontal scrolling only inside table wrappers.
- Technical traces: collapse behind `기술 증거 보기 / Show Technical Evidence`.

## 5. Layout Principles
- The first viewport answers what the system does, what is verified, what is artifact-only, what failed, and what remains incomplete.
- Use `repeat(auto-fit, minmax(220px, 1fr))` for evidence and metric grids.
- Keep evaluator summaries above implementation detail. Avoid nested cards.

## 6. Evidence Badge System
| Badge | Meaning |
| --- | --- |
| `VERIFIED BENCHMARK` | audited controlled benchmark evidence |
| `ARTIFACT EVIDENCE` | execution artifact, not validation |
| `PARTIAL EXPANSION` | some tasks completed while others failed or stopped |
| `INFRA LIMIT` | timeout, HTTP 503, or resource boundary |
| `PLANNED` | not yet implemented |
| `DEMO EXAMPLE` | mock or illustrative content |
| `TECHNICAL TRACE` | raw trace or debug evidence |
| `NOT COMPLETE` | unfinished scope |

## 7. Demo Mode Design
Demo mode is the default evaluator view. Show Executive Summary, 12-stage pipeline, controlled interpretation, staged expansion evidence, limitations, and report downloads. Hide raw JSON, logs, long artifact paths, and low-level traces until requested.

## 8. Responsive Behavior
Use auto-fit `220px` grids. Collapse to one column below tablet width. Never require page-level horizontal scrolling. Permit table wrappers to scroll locally. Preserve badge text wrapping.

## 9. Do's and Don'ts
### Do
- State evidence scope plainly.
- Preserve T007 timeout and legacy T019-T020 HTTP 503 evidence.
- Separate controlled metrics, artifact evidence, partial expansion, mock panels, and planned work.
- Explain the controlled Single LLM Precision/NDCG advantage and Paper Agent traceability tradeoff.
### Don't
- Do not claim full T004-T020 validation or global outperform.
- Do not use marketing-style success language.
- Do not hide technical evidence; collapse it behind a control.
- Do not use color as the only signal.

## 10. Agent Prompt Guide
1. Read `DESIGN.md`, `AGENTS.md`, and claim-boundary documents before editing.
2. Keep evaluator summaries above technical detail.
3. Apply badge taxonomy consistently.
4. Treat artifact-only runs as execution evidence, not validation.
5. Preserve mobile readability and long-ID wrapping.
6. Run typecheck, web build, diff check, and forbidden-phrase search.
