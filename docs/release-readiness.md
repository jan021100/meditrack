# MediTrack 0.1 — restricted technical release

27 October 2026. Target: https://meditrack-rose.vercel.app. The user explicitly authorised GitHub/Vercel publication and permanently required team approval. A public technical release does not authorise clinical recruitment or certify legal conformity.

## Enforced access contract

| Capability | Pending account | Approved clinician | Admin claim |
|---|---|---|---|
| Own professional profile | Yes | Yes | Yes |
| Clinical records and analysis | No | Own only | Global read only |
| Create/change own clinical records | No | Yes | No |
| Approve or revoke clinician access | No | No | Yes |

Approvals live in memberships/{uid}, separate from editable profiles. Only trusted admin claims can write the approved flag, their own approvedBy UID and server approvedAt timestamp. Approval never grants an admin claim. Existing normal accounts require explicit approval; no account is automatically grandfathered. Revocation stops further reads/writes without deleting records; data already viewed or copied cannot be recalled. Admins independently retain global read-only clinical access.

## Production configuration verified

- Project meditrack-72826, Firestore europe-west10 (Berlin). Required patients index userId ASC / createdAt DESC is READY.
- Corrected ownership/admin/profile rules plus approval policy published and byte-for-byte verified on27October2026. Rules SHA-256: 4ae91830f76ef52e421a918ece5ddedf9d1ec22e1f3cc50a9f21aa4277234c01. Prior rule source and release reference retained locally.
- Vercel existing project janhankes-projects/meditrack uses GitHub main, SvelteKit preset, Node22. Fixed official adapter targets Frankfurt functions; this is not an EU-only processing claim (CDN/Auth/other providers differ).
- Localhost always uses demo emulators, never production fallback. Vercel previews deliberately fail before build pending a separate staging project. Production has no local-test banner.
- Private service-account file remains ignored and absent from source/build inputs. Admin SDK has no frontend import. No production patient documents read, created, modified or deleted during release work.

## Technical checks

Diagnostics0errors/0warnings; local production build; local SDK authorization, anonymous and foreign access negatives, approval/revocation, admin clinical read-only rules, four-client numbering, identity-bound drafts, date/context/PROM logic and descriptive summaries. Browser workflow covers pending login, administrator approval, own list, baseline/initial surgery, further surgery, follow-up, PROM and reload. Test fixtures are isolated and disposable.

Published release audit:0critical,0high,0moderate,2low affected entries (SvelteKit2). A subsequent update on27October upgrades to SvelteKit3.1.0, adapter-vercel7.0.1, Vite8.3.5, vite-plugin-svelte7.3.1 and TypeScript6.0.3. Its audit has zero known vulnerabilities at every severity. The user explicitly authorised publishing this tested update on27October; hosted verification is recorded separately in the workspace release report. The obsolete cookie override was removed; the gRPC override remains. Do not equate an audit count with complete security.

Desktop visual check completed. Current browser viewport override did not apply (actual1280): no new mobile test success is claimed. Prior320px analysis evidence is dated24October; physical mobile hardware remains untested.

## Clinical rollout remains blocked by missing institutional decisions

The responsible organisation and real contact/privacy information must be confirmed by Prof. Doll; do not invent the foundation/association name. Confirm research purpose/legal basis, participant information, controller/processors and international transfers, retention/deletion, institutional/study authorisation and DPIA assessment. Invitations or manual approval do not remove these requirements. Do not approve new clinical collection before those decisions. No blanket GDPR, NIS2, CRA or MDR certification is claimed.

PITR and database deletion protection are currently disabled; metadata inspection found no scheduled backups. Backup/restore drill, provider IAM/admin MFA, incident response, cost/abuse alerts and complete asset-rights review remain open. No paid service was activated. The user explicitly rejected all paid backup activation on27October; managed backups remain unconfigured. No patient-data backup or restore drill has been performed.

Historical hospitalDays units, incomplete legacy values, non-immutable clinical edits and client-only scientific validation remain integrity limitations; no silent migration. PROMs are exploratory, not a validated total score; analysis is descriptive, without causal risk-factor or recurrence-rate claims.

## Release and rollback procedure

Publish tested source to main only after rule parity; verify the new Vercel deployment/commit, public login/registration/pending pages, browser headers and absence of the test banner without clinical test writes. Record hosted result in the workspace release report. Roll back the app using Vercel deployment history if required, but retain the tightened data rules; do not restore the unsafe July2025 policy as routine recovery. Existing source/rule snapshots support review, not a tested patient-data backup.

Shared-browser follow-up: logout/direct UID switches replace the document to discard SDK memory; initial sign-in stays within the document so registration can finish its profile write. Restored history documents reload. A local SDK cache regression and browser registration/logout/back flow validate this boundary.
