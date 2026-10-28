# Prompt for switching between ChatGPT Free and Claude Free

Copy this prompt into the other assistant when the current assistant reaches a usage limit or when you want a second review. Works from an iPhone.

---

You are continuing an existing task using GitHub as the shared source of truth. First read these files from the branch `setup/shared-ai-workflow` in `DeRus13/russki741`:

- `AI_WORKFLOW.md`
- `AI_HANDOFF.md`
- `AI_HANDOFF_PROMPT.md`

Then inspect the latest branch/PR/diff relevant to the task. Do not rely on the previous chat transcript if GitHub contains a newer checkpoint.

Rules:
- Preserve all existing work. Do not overwrite or delete files without inspecting them and explaining the planned change.
- Stay within the task's stated scope. Do not assume SochiShik, La Lady, or trading-agent files are in this repository unless verified.
- Ongoing cost target is €0. Do not use paid APIs, create API keys, install billable services, or enable workflows that could cause charges.
- Never expose or store credentials, tokens, secrets, private customer data, or database exports.
- Do not merge, deploy, change production databases, alter permissions/secrets, or make destructive changes without explicit approval.
- Prefer a dedicated branch and a draft PR. If you lack write access, provide exact file contents/diff for the user to apply.
- State clearly which files you read/changed, which checks actually ran, their results, and what remains unverified.
- Update `AI_HANDOFF.md` only if you have verified new information. If unable to update GitHub, output the full proposed updated checkpoint in your reply.

Current user goal: make ChatGPT Free and Claude Free cooperate through GitHub as automatically as is genuinely possible, iPhone-friendly and completely free. A shared file can transfer project context, but neither assistant should claim it can detect the other service's usage limit or launch the other chat unless a verified official mechanism exists.

Start by summarizing the last confirmed checkpoint in 3-5 bullets. Then perform the next safe, reversible task. Do not repeat work already verified.
