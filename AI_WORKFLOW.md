# Shared AI Workflow — ChatGPT + Claude

## Purpose
Use ChatGPT and Claude as separate assistants working from the same reviewed project files, with GitHub as the shared source of truth. This document describes the workflow; it does not connect the models directly or grant either service new permissions.

## Current repository map
- `index.html`: AppForge Studio project.
- `Ki-Video`: video-related project file/directory.
- `ki-agent-trading/`: trading-agent dashboard and documentation.
- `ki-agent-trading/v2/`: alternate dashboard version.
- SochiShik and La Lady are separate projects and must not be assumed to exist in this repository until their source files are verified.

## Non-negotiable safety rules
1. Do not overwrite, delete, rename, or restructure existing files without first reading them and describing the planned change.
2. Do not commit API keys, passwords, access tokens, service-role keys, private customer data, or database exports.
3. Keep each project's database, credentials, and environment configuration separate. Never reuse a project's secrets in another project.
4. For Supabase, inspect schema and policies before proposing changes. Do not modify production tables, RLS policies, functions, or data without an explicit plan and approval.
5. For trading systems, keep simulation/read-only mode as the default. Never enable real orders or withdrawals as part of routine development.
6. Prefer a new branch and pull request over direct edits to `main`. Do not merge a pull request until its diff and checks have been reviewed.
7. Make small, reversible changes. Report exactly which files changed, what was tested, what remains unverified, and any possible cost.
8. Do not claim a deployment, test, connection, or fix succeeded unless its result was actually verified.

## Division of work
- **ChatGPT — planner/reviewer:** clarify requirements, map architecture, identify risks, review diffs, suggest tests, and check that changes preserve existing behavior.
- **Claude — implementation partner:** inspect selected repository files, propose or implement a narrowly scoped change, explain its diff, and report tests/results.
- **GitHub — shared source of truth:** branches, commits, pull requests, issue/task tracking, and reviewed history.

The two assistants are not automatically communicating with each other. Pass the task brief and the other assistant's findings between chats when needed. Before Claude starts, sync the repository context. Before ChatGPT reviews, provide the branch/PR link or the exact diff.

## Standard task handoff
Every task should include:
- Goal and acceptance criteria.
- Project and exact files in scope.
- Files/data explicitly out of scope.
- Constraints (iPhone-first, target ongoing cost €0, preserve current work).
- Test/verification steps.
- Rollback plan.

## Definition of done
A task is done only when:
- The diff has been reviewed.
- Relevant tests or manual checks have actually run.
- Security and cost implications have been considered.
- Deployment status is verified separately from code changes.
- Remaining limitations are stated clearly.

## Cost policy
Prefer existing free tiers and manual review. Do not introduce paid APIs, paid hosting, new database branches, paid CI runners, or other billable services without explaining the cost and obtaining approval. Free-tier limits may apply; do not promise unlimited usage.
