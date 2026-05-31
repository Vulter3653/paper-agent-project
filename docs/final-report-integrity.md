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

## Final Reporting Requirements
The final report must explicitly include the raw outputs of the commands above. An integrity check must be performed:

- **Check**: Do `Local HEAD`, `origin/main`, and `ls-remote` SHAs match exactly?
- **Conclusion**:
    - If ALL match: `REPORT INTEGRITY VERIFIED`
    - If ANY mismatch: `REPORT INTEGRITY FAILED` (Do NOT report task completion if failed).

## Prevention of SHA Hallucination
- **NEVER** manually type or "guess" a commit SHA.
- **ALWAYS** copy-paste directly from the raw command output.
- **DOUBLE-CHECK** that the SHA in the summary matches the SHA returned after `git push`.
