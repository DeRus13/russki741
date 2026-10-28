# Shared AI Handoff

> This file is the shared checkpoint for ChatGPT Free and Claude Free. Update it at the end of a work session. Do not store secrets, private customer data, API keys, tokens, or personal records here.

## Current checkpoint
- Status: HANDOFF_TEST_IN_PROGRESS
- Active project: `DeRus13/russki741` (repository/workflow setup only; do not assume other projects live here)
- Active branch: `setup/shared-ai-workflow`
- Last verified base branch: `main`
- Last verified main commit: `86df1292a53702cb7fec4e399602788886ca1d64`
- Current goal: establish a safe, free, iPhone-friendly handoff between ChatGPT Free and Claude Free.
- Test marker: `HANDOFF-TEST-2810-7Q4K`
- Task: Verify that the updated shared checkpoint can be fetched directly from GitHub by ChatGPT.
- Acceptance criteria:
  1. Fetch this file from branch `setup/shared-ai-workflow`, not from the chat text.
  2. Report the test marker exactly.
  3. Summarize the checkpoint in 3–5 bullets.
  4. State the exact next action and do not repeat completed work.
- In-scope file: `AI_HANDOFF.md` only.
- Out of scope: `main`, other files, secrets, databases, deployments, merging PR #1, and enabling GitHub Actions.
- Last confirmed action: ChatGPT fetched the prior version of this file directly from GitHub; that version did not contain the marker.
- Files changed and branch: `AI_HANDOFF.md` on `setup/shared-ai-workflow` only.
- Tests/checks actually run: Direct GitHub fetch before this update; post-update fetch is the next verification step.
- Results: NOT VERIFIED until the updated file is fetched again from GitHub and the marker/status are confirmed.
- Risks / cost: No paid APIs or GitHub Actions are needed for this manual test. A ChatGPT-authored update can verify repository write/read access but does not independently prove Claude-to-ChatGPT handoff.
- Remaining work: Fetch this file again from GitHub; then, if the marker is confirmed, record that read-back result and reset status to `READY_FOR_USER_TASK`.
- Exact next action: ChatGPT must re-fetch this exact file from `setup/shared-ai-workflow`, verify the marker and status, summarize the checkpoint in 3–5 bullets, and state the next action.
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
