# Shared AI Handoff

> This file is the shared checkpoint for ChatGPT Free and Claude Free. Update it at the end of a work session. Do not store secrets, private customer data, API keys, tokens, or personal records here.

## Current checkpoint
- Status: READY_FOR_USER_TASK
- Active project: `DeRus13/russki741` (repository/workflow setup only; do not assume other projects live here)
- Active branch: `setup/shared-ai-workflow`
- Last verified base branch: `main`
- Last verified main commit: `86df1292a53702cb7fec4e399602788886ca1d64`
- Last verified workflow branch commit before this handoff setup: `46195e55794fee20029132a58041a3436f102b44`
- Current goal: establish a safe, free, iPhone-friendly handoff between ChatGPT Free and Claude Free.
- Verified result: `AI_WORKFLOW.md` exists on the workflow branch; draft PR #1 is open. Main has not been changed by that PR.
- Automation limitation: GitHub can store the shared checkpoint, but cannot directly read ChatGPT/Claude chat usage limits. Fully automatic model switching is not verified and must not be claimed.
- Next action: use `AI_HANDOFF_PROMPT.md` to resume work; sync the relevant repository files in Claude before asking it to continue.

## Task record (replace this section for each task)
- Task:
- Acceptance criteria:
- In-scope files:
- Out-of-scope files/data:
- Last confirmed action:
- Files changed and branch:
- Tests/checks actually run:
- Results:
- Risks / cost:
- Remaining work:
- Exact next action:
- Approval needed before:
- Last updated (UTC):

## Handoff rules
1. Record only confirmed facts. Mark anything untested as NOT VERIFIED.
2. Link to the branch, commit, PR, or diff where possible.
3. Never claim a change is deployed or merged unless verified.
4. Keep changes on a dedicated branch. Do not merge, deploy, modify production data, or change secrets without explicit user approval.
5. If the active assistant hits a usage limit, copy the latest checkpoint or use the prompt in `AI_HANDOFF_PROMPT.md` in the other assistant.
6. If the assistant cannot write to GitHub, output the updated checkpoint as plain text so the user can paste it into this file later.
7. After work, ask the other assistant to review the diff and update this checkpoint with actual test results.
