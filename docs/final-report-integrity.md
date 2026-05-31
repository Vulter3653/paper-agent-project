# Final Report Integrity Protocol

To ensure the technical accuracy and reliability of final submission reports, all agents must adhere to the following protocol before concluding a task.

## Purpose
This protocol addresses recurring issues where reported commit SHAs mismatched the actual repository state. Strict adherence ensures that evaluators and team members can verify work against the correct Git history.

## Mandatory Verification Commands
Before generating the final report, the following commands must be executed and their raw outputs inspected:

1.  **Check Status**: Ensure no unexpected unstaged changes remain.
    ```bash
    git status --short
    ```
2.  **Verify Branch**: Confirm work is on the intended branch.
    ```bash
    git branch --show-current
    ```
3.  **Local HEAD SHA**: Get the absolute 40-character local commit hash.
    ```bash
    git rev-parse HEAD
    ```
4.  **Remote Tracking SHA**: Confirm the state of the local tracking branch.
    ```bash
    git rev-parse origin/main
    ```
5.  **Remote Server SHA**: Verify the actual HEAD on the GitHub server.
    ```bash
    git ls-remote origin refs/heads/main
    ```
6.  **Latest Commit Info**: Capture the hash and subject of the most recent commit.
    ```bash
    git log -1 --format="%H %s"
    ```
7.  **File Diff Stat**: Capture the list of files changed in the final commit.
    ```bash
    git show --stat HEAD
    ```

## Final Reporting Requirements
The final report must explicitly include the raw outputs of the commands above. An integrity check must be performed:

- **Check 1: SHA Consistency**: Do `Local HEAD`, `origin/main`, and `ls-remote` SHAs match exactly?
- **Check 2: Provenance Consistency**: Does the list of "Modified Files" in the report exactly match the output of `git show --stat HEAD`?
- **Conclusion**:
    - If ALL match: `REPORT INTEGRITY VERIFIED`
    - If SHA mismatch: `REPORT INTEGRITY FAILED`
    - If File Provenance mismatch: `REPORT PROVENANCE FAILED`
    - Do NOT report task completion if any check fails.

## Changed Files Provenance Check
To maintain transparency regarding code implementation and documentation updates:

- **Single Commit**: If all changes are in one commit, the reported file list must match `git show --stat HEAD`.
- **Multiple Commits**: If changes are spread across multiple commits (e.g., implementation followed by handoff), the report MUST:
  1.  Clearly identify the **Implementation Commit(s)**.
  2.  Clearly identify the **Handoff/Session-State Commit**.
  3.  Provide the cumulative diff stat using a commit range: `git diff --stat <base_sha>..HEAD`.
- **Zero Hallucination**: Agents must not list files in the "Modified Files" section if they are not actually part of the diff for the reported SHA(s).

## Prevention of SHA Hallucination
- **NEVER** manually type or "guess" a commit SHA.
- **ALWAYS** copy-paste directly from the raw command output.
- **DOUBLE-CHECK** that the SHA in the summary matches the SHA returned after `git push`.

## Session State SHA Policy
To avoid structural staleness, the following rules apply to `docs/gemini-session-state.md`:

- **Non-Authoritative**: `docs/gemini-session-state.md` MUST NOT be treated as the authoritative source for the latest commit SHA.
- **Structural Staleness**: Because the session-state file itself is often part of the commit, any SHA recorded within it becomes the *parent* hash as soon as the commit is created.
- **Raw Git Truth**: Technical verification of the current HEAD must rely exclusively on the raw git outputs required by this protocol (e.g., `git rev-parse HEAD`).
- **Baseline Reference**: Session-state may reference a "Last Verified Handoff Baseline" to establish context, but must not claim this baseline is the current HEAD after a new commit has been generated.
