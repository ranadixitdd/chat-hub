# CHAT HUB: FAST, TARGETED CHANGE POLICY

For every future task, prioritize the smallest safe change that solves the actual problem.

1. Inspect the specific feature and its directly related functions before making changes.
2. Identify the root cause and explain the proposed fix briefly.
3. Do not perform a full-project audit, rewrite large files, refactor unrelated code, or redesign working features unless genuinely necessary.
4. Preserve all existing features, data, themes, scripts, character assets, and user history unrelated to the requested change.
5. Make the smallest practical patch. Avoid reading or rewriting thousands of unrelated lines.
6. Start with a quick, targeted investigation. If the issue is not understood after approximately 5 minutes, report what has been checked, the blocker, and the next proposed step instead of silently continuing for a long time.
7. For a small bug, aim to finish investigation, implementation, and focused testing within 5–15 minutes when feasible. If the task genuinely needs longer, explain why and ask before expanding its scope.
8. Run only the tests relevant to the change, plus essential regression checks. Verify the behavior in the actual running application when feasible.
9. Never claim that something works merely because code was written. Distinguish automated test results from manual visual verification.
10. Do not modify or remove unrelated working features to make a test pass.
11. Before editing, preserve a recoverable checkpoint using the existing Git workflow where appropriate. Never overwrite or discard unrelated user changes.
12. At completion, report:
   - Root cause
   - Exact files and functions changed
   - Tests actually run and their results
   - What was not verified
   - Whether a Git commit was created and whether changes were pushed

If a task reveals a larger architectural problem, propose it as a separate task. Do not automatically turn a small bug fix into a major refactor.

**Current task scope always takes priority. Do not expand scope without permission.**
