# Shared AI Handoff

> This file is the shared checkpoint for ChatGPT Free and Claude Free. Update it at the end of a work session. Do not store secrets, private customer data, API keys, tokens, or personal records here.

## Current checkpoint
- Status: READY_FOR_USER_TASK
- Active project: `DeRus13/russki741` (repository/workflow setup only; do not assume other projects live here)
- Active branch: `setup/shared-ai-workflow`
- Last verified base branch: `main`
- Last verified main commit: `86df1292a53702cb7fec4e399602788886ca1d64`
- Current goal: establish a safe, free, iPhone-friendly handoff between ChatGPT Free and Claude Free.
- Completed test marker: `HANDOFF-TEST-2810-7Q4K`
- Task: Verify that ChatGPT can fetch the shared checkpoint directly from GitHub and that Claude can read the resulting commit.
- Last confirmed action: ChatGPT fetched `AI_HANDOFF.md` directly from `setup/shared-ai-workflow`, confirmed the exact marker and in-progress status, updated this file, then fetched it again and verified the update.
- Claude result: The user reports Claude independently fetched the new version and confirmed the marker. The user also reports Claude's GitHub write attempt returned HTTP 403. These Claude-side actions are user-reported, not independently verified by ChatGPT.
- Files changed and branch: `AI_HANDOFF.md` only, on `setup/shared-ai-workflow`.
- Tests/checks actually run: Direct GitHub fetch of `AI_WORKFLOW.md`, `AI_HANDOFF.md`, and `AI_HANDOFF_PROMPT.md`; direct fetch of pull request #1; marker and status checked in fetched file content.
- Results: PASS for ChatGPT's direct GitHub read and write/read-back via the connected GitHub tool. Claude read success is user-reported. Claude write access remains NOT VERIFIED and the reported 403 suggests that Claude's connection may be read-only.
- Pull request: #1 remains open and draft, not merged. The base branch is `main`; its recorded base SHA is `86df1292a53702cb7fec4e399602788886ca1d64`. No merge or deployment was performed.
- Risks / cost: No paid APIs or GitHub Actions were used or enabled. This workflow does not make the assistants communicate automatically or detect each other's usage limits.
- Remaining work: No further action is needed for the ChatGPT GitHub read-back test. If desired, separately verify Claude's write permission by attempting a small approved edit on this same branch; do not modify `main`.
- Exact next action: Resume the user's next task using this checkpoint and `AI_HANDOFF_PROMPT.md`. Do not repeat the completed marker test unless new evidence warrants it.
- Approval needed before: Any merge, deployment, production data change, secret change, or edit to any other file.
- Last updated (UTC): 2026-10-28

## Handoff rules
1. Record only confirmed facts. Mark anything untested as NOT VERIFIED.
2. Link to the branch, commit, PR, or diff where possible.
3. Never claim a change is deployed or merged unless verified.
4. Keep changes on a dedicated branch. Do not merge, deploy, modify production data, or change secrets without explicit user approval.
5. If the active assistant hits a usage limit, copy the latest checkpoint or use the prompt in `AI_HANDOFF_PROMPT.md` in the other assistant.
6. If the assistant cannot write to GitHub, output the updated checkpoint as plain text so the user can paste it into this file later.
7. After work, ask the other assistant to review the diff and update this checkpoint with actual test results.
