# Local test environment

Use synthetic data or the explicitly sourced published fixtures below. Private clinical patient data must never be imported here.

1. Install a Java runtime (21 or later recommended by Firebase). Firebase CLI is already available locally.
2. From the project root run `npm run emulators`. First startup requires downloads and network access.
3. In another terminal run `npm run dev` and reload the local page. Verify the English test banner.
4. Register a separate invented test account; real credentials and real accounts are not copied.
5. Bootstrap one separate local admin account with `node local-testing/set-admin.cjs LOCAL_TEST_UID` (find its UID in the local Auth emulator; sign out/in afterward). Have this local administrator approve the account under Team, then create synthetic cases through the normal forms. Confirm data survives a reload and inspect it at http://127.0.0.1:4000.
6. Stop emulators with Ctrl+C to export local state for the next run. Abrupt termination may lose recent local test data.

The demo project has no live cloud resources. Local browser previews also use emulators. Vercel preview builds are deliberately blocked until a separate staging Firebase project exists. Production builds use the real project; never test clinical writes there.

`firestore.rules` matches the release policy in security/firestore.rules. The regression script uploads this exact policy only to the loopback demo emulator. Production rule publication and readback are recorded in docs/release-readiness.md.


## Published cases

The local dataset also includes published individual case facts, identified by LIT IDs. They are test records with source citations, not synthetic records and not newly recruited MediTrack patients. Do not mix them with real clinical recruitment or infer population risk from them.

To restore the published fixtures after a local reset: `node local-testing/import-published-cases.cjs LOCAL_TEST_UID`. The UID must exist in local Auth; existing IDs are skipped, never overwritten. See published-cases.json for the original case mapping and quality flags. Export the local emulator state to retain manual test changes.


## Regression checks

With Auth/Firestore emulators running, `npm run test:local` verifies explicit PROM missing values, concurrent documentation numbering, legacy gaps and descriptive calculations. It uses four independent client SDK instances plus access-control accounts, creates disposable local cases and profiles, and removes them in finally. It also verifies pending-account denial, blocked self-approval, administrator approval and revocation, anonymous/foreign access denial, and UID-bound draft isolation and same-user controls. Existing records are compared by a full snapshot hash. Never run against production; the script hard-codes demo-meditrack and loopback emulator endpoints. A healthy baseline of the eight published fixtures is expected for calculation assertions.
