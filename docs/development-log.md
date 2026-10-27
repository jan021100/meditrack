# MediTrack – Entwicklungsprotokoll

Kurze technische Arbeitsnotizen für die spätere Beschreibung der Softwareentwicklung. Datum bezeichnet die lokale Umsetzung, keine Veröffentlichung. Frühere Schritte sind anhand dieses Chats zusammengefasst; es wurden dafür keine rückwirkenden Git-Commits erzeugt.

## 20.–21.10.2026 – Ausgangsstand und Bereinigung

- Tatsächlichen lokalen Stand und GitHub unterschieden; vorhandene Änderungen erhalten. Datenmodell und offene Risiken dokumentiert.
- Lokale Service-Account-Datei in `.gitignore` ausgeschlossen; Schlüssel nicht geöffnet.
- Speicherbutton für weitere Operationen auf vorhandene Funktion `saveSurgery` korrigiert.
- Benutzerstatus, Datumswerte, Baseline-Entwurf und Zeitleistenereignisse typisiert. Fehler beim Profilabruf werden weitergegeben. Überholte Entfernung nicht vorhandener Unterkollektionen aus dem Baseline-Entwurf entfernt.
- 77 HTML-/Bedienbarkeitswarnungen behoben: 69 Feldzuordnungen, echte Links für Fallkarten, Tastatur-bedienbare Avatarbuttons und korrekt geschlossene HTML-Elemente.
- `docs/workflows.md` mit fünf Diagrammen des tatsächlichen Datenflusses und ausdrücklichen offenen Befunden angelegt.
- Verifikation: Codeprüfung 0 Fehler/0 Warnungen; lokaler Build erfolgreich. Keine produktiven Schreibtests, Migrationen, Rules-Änderungen, Pushes oder Deployments.

## 21.10.2026 – Warme Gestaltung: Kopfzeile und Patientenübersicht

**Ziel:** Moderne, freundliche und professionelle medizinische Arbeitsoberfläche. Nutzerfreigabe: warmes Off-White, dunkle Schrift, feine Linien, reduzierte Formen, englische Oberfläche. Zunächst Kopfzeile und beide Patientenübersichten; Erfassungsformulare bleiben ein späterer Schritt.

1. Vorhandenes Layout und beide Übersichten gelesen; gemeinsame Darstellung identifiziert.
2. `src/lib/styles.css`: gemeinsame Farbvariablen, Schrift, Seitenabstände, Fokusdarstellung und Hauptaktion eingeführt. Helvetica bleibt erhalten; keine zusätzliche Schriftdatei oder Bibliothek.
3. `src/routes/+layout.svelte`: reduzierte Wortmarke, Patienten-Navigation, Profilmenü ohne Emojis. Natives `details`-Element ersetzt mehrere manuelle Menüfunktionen. Benutzerstatus reagiert auf neue Layoutdaten.
4. `src/lib/components/PatientList.svelte`: gemeinsame Darstellung für beide Listen. Auf Desktop ausgerichtete Spalten, auf schmalen Bildschirmen beschriftete Felder. Fall-ID vollständig erhalten, englische Datumsanzeige, fehlende/ungültige Datumswerte sichtbar gekennzeichnet.
5. `dashboard` und `patients`: doppelte Listen-/Datumsdarstellung ersetzt. Laden, Leerzustand und Ladefehler getrennt dargestellt; erneutes Laden angeboten. Im Dashboard erscheint die Anlageaktion erst nach Feststellung der Nutzerrolle. Firestore-Abfragen und gespeicherte Felder unverändert.
6. Designregeln dokumentieren und Ablaufdiagramm an sichtbare Fehlerbehandlung sowie gemeinsame Listenkomponente anpassen.

**Abgrenzung:** Datenintegritätsprobleme wie Kommentarüberschreibung und Follow-up-Nummerierung bleiben offen. Kein wissenschaftlicher Wirksamkeits-/Usability-Nachweis. Neues globales Boxmodell und Seitenhintergrund gelten appweit; die alten seitenlokalen Formularstile sind noch nicht vollständig vereinheitlicht.

**Prüfung:** Svelte/TypeScript 0 Fehler, 0 Warnungen; Build erfolgreich. Desktop 1280 px und Mobilansicht 390 px im Browser angesehen, kein horizontaler Überlauf. Profilmenü geöffnet/geschlossen; keine klinischen Schreibaktionen und kein Logout. Privater angemeldeter Lesezustand geprüft; Screenshots mit Patientendaten bleiben nur in lokalen Arbeitsunterlagen und werden nicht als Dissertationsabbildungen ausgeliefert. Header-Vorschau enthält keine Patientendaten. Automatischer Impeccable-Detektor konnte mangels installiertem Engine-Programm nicht laufen; zusätzliche unabhängige Sichtprüfung separat vermerkt.

**Unabhängige Nachprüfung:** Zwei Befunde korrigiert: Desktop-Feldbezeichnungen für Screenreader erhalten und Profilmenü beim Navigieren schließen. Beide Korrekturen durch separate Codeprüfung bestätigt; Menüwechsel zu Settings im Browser geprüft. Abschließende Reviewer-Disposition: ship für den untersuchten Kopfzeilen-/Listenbereich. Authentifizierung, Speichern und Logout sind dadurch nicht vollständig funktional geprüft.

## 21.10.2026 – Fallansicht an Gestaltungslinie angeglichen

**Anlass:** Nutzerscreenshot zeigt inkonsistente alte Fallansicht trotz neuer Kopfzeile/Liste. Die erste Gestaltungsphase deckte diese Seite nicht ab.

1. Alte Emojis, Schattenkarten und schwarze Aktionsbuttons aus `patients/[id]/+page.svelte` entfernt; gemeinsame Farben, Typografie und Seitenbreite übernommen. Navigation als beschriftete sekundäre Links.
2. Reine Leseaufbereitung in `RecordFields.svelte` zentralisiert: verständliche englische Feldnamen, semantische Definitionlisten, Zeilenumbruch für lange Texte, Zahlen einschließlich 0 und boolesche Werte sichtbar. Technische Metadaten ausgeblendet; zusätzliche unbekannte klinische Felder bleiben sichtbar.
3. Hauptdokument nach Baseline und Initialoperation gegliedert. Keine Verschiebung oder Migration von Daten. Das vorhandene gemeinsame Kommentarfeld wird neutral unter zusätzlichen Informationen angezeigt, weil seine ursprüngliche Herkunft unklar ist. `hospitalDays` erscheint ohne ungesicherte Tages-/Übernachtungseinheit als Hospital stay; historische Definition weiterhin zu prüfen.
4. Weitere Dokumentation behält ihre bisherigen Lesewege und Sortierung; eigene Ereignisüberschriften ohne Emojis. Leere zusätzliche Informationsabschnitte vermieden.
5. Desktop 1280px und Mobil 390px angesehen, kein horizontaler Überlauf. Referenzfall ohne weitere Ereignisse; gefüllte Ereignisliste in dieser Runde nur anhand des Codes geprüft. Svelte/TypeScript 0 Fehler/0 Warnungen und Build geprüft. Unabhängige Sicht-/Codeprüfung: ship für diesen Bereich. Keine produktiven Schreibaktionen.

**Abgrenzung:** Diese Korrektur vereinheitlicht die Fallansicht, nicht bereits alle Erfassungs-, Profil- und Einstellungsseiten. Die Datenerfassung und produktiven Berechtigungen sind unverändert. Initialoperation wird jetzt separat angezeigt, steht jedoch weiterhin im Hauptdokument; zeitliche Zuordnung zu späteren Dokumentationen bleibt unverändert.

## 21.10.2026 – Gesamte Oberfläche mit Emil-Skills überarbeitet

**Auftrag:** Gesamte App auf Bedienbarkeit, Konsistenz, mobile Darstellung und robuste Grenzfälle durchgehen; bisherige ästhetische Festlegungen sind nachrangig. Die fachlichen Funktionen bleiben der Maßstab.

1. Relevante Skills gelesen, Zweck und technische Anwendbarkeit unterschieden. React-/Expo-/Swift-spezifische Werkzeuge nicht künstlich eingebaut. Keine neue Laufzeitbibliothek.
2. Klinische Formulare, Login/Registrierung, Profil, Startseite und Einstellungen vereinheitlicht; hunderte Zeilen doppelter Seiten-CSS durch gemeinsame Stile ersetzt. Systemschrift, 16px-Eingaben, 48px-Felder, definierte Fokuszustände, responsive Zweispaltenformulare und englische Beschriftungen.
3. Native Formulare und Submit eingeführt. Vorhandene Browservalidierung greift jetzt vor dem Absenden. Login/Registrierung zeigen Pending-Zustand; Profilabruf zeigt Fehler statt endlosem Laden. Die bestehenden Schreibfunktionen/Datenschemata wurden nicht migriert.
4. Mobile Grundlagen ergänzt: Safe-Area-Meta/Abstände, dynamische Viewporthöhe, passende theme-color, kein Zoomverbot, Hover nur mit Mausunterstützung. Keine simulierte App-Geste oder unnötige Glas-/Bewegungseffekte.
5. Menü schließt per Escape, außerhalb und nach Auswahl; Fokus kehrt per Escape zurück. Skip-to-content-Link, aktive Navigation und Avatarfallback ergänzt.
6. Listen mit 25 sichtbaren Datensätzen paginiert (clientseitig, Abfrage unverändert), Datumsanzeige gegen ungültige/anders typisierte Werte abgesichert, dynamische Feldliste beim Datenwechsel korrigiert. BMI wird bei unvollständigen Eingaben geleert; Dezimalwerte bei Größe/Gewicht möglich.
7. Alter /case-Platzhalterschreiber durch Weiterleitung ersetzt; unbenutzte direkte uuid-Abhängigkeit entfernt. Keine anderen Pakete aktualisiert.
8. Lokale `/dev/ui`-Prüfansicht mit synthetischen Grenzfällen hinzugefügt; Produktionsbuild-Loader gibt 404. Demo/Worst case/Empty/One/1.000 Zeilen getestet. Keine Testdaten gespeichert.
9. Unabhängige Bewegungsprüfung beanstandete Skalierung bei Tastaturaktivierung; entfernt. Unabhängige UI-Prüfung beanstandete Back-to-baseline ohne belastbaren Entwurfsablauf; durch Back-to-patients ersetzt. Beide Nachprüfungen bestätigen die konkreten Korrekturen.
10. Desktop 1280px und Mobile 320px geprüft. 1.000 Fälle → 25 DOM-Zeilen; nächste Seite beginnt bei Nr. 26. BMI 180cm/80,5kg → 24,8; Gewicht löschen → BMI leer. Details in `docs/ui-review.md`.

**Grenzen:** Echte Smartphone-Hardware und tatsächlicher 200%-Browserzoom nicht geprüft. Keine produktiven Schreibabläufe, Registration, Login oder Logout ausgelöst. Vorhandene Datenintegritäts- und Rechtefragen bleiben offen. Keine Firestore-Regeländerung, Migration, Veröffentlichung oder Git-Push.

**Abschlussprüfung:** `npm run check`: 0 Fehler, 0 Warnungen. `npm run build`: erfolgreich. `git diff --check`: ohne Befund. Produktionscode des lokalen UI-Testloaders geprüft: expliziter 404-Fehler. Keine Veröffentlichung.


## 2026-10-23 — Separate local test environment

- User confirmed that all five existing patient records are real. No patient reads, writes, exports or migrations were performed in this step.
- Central Firebase initialization now selects `demo-meditrack` in development and on loopback browser hosts (including local production preview). Production hosting keeps the existing configuration. Auth and Firestore connect to loopback emulators before application requests. Missing emulators do not trigger production fallback. Existing browser tabs must be reloaded.
- Added visible English test banner, separate local accounts, `npm run emulators`, and ignored local emulator state. Test state is exported on graceful exit; it is not a production backup.
- Local-only rules model owner access and claim-based read-only admins; they are not the deployed rules and have not yet been runtime validated. No production rules were changed.
- Added comments explaining connection selection and access boundaries. Future changes should comment intent and non-obvious behavior, rather than narrate every statement.
- Existing dashboard hides patient creation for admin profiles. Actual current account role was not queried.
- Check: 0 errors, 0 warnings; build passed before final loopback guard, rechecked afterward. Emulator startup failed with a generic CLI error; `java -version` separately confirms no Java runtime is installed. End-to-end persistence and rule tests remain pending.
- Proposed synthetic fixtures are software test data, not evidence of clinical associations. No external research dataset has been downloaded or mixed with real cases.


## 2026-10-23 — Local startup repaired

Installed project-local Temurin JRE 21 in ignored local-testing/runtime. New launcher isolates Firebase CLI configuration/cache, avoiding the global CLI profile. Auth (9099), Firestore (8080), emulator UI (4000) started successfully on loopback with demo-meditrack. Restarted stale Vite server (5173). Login verified HTTP 200 and rendered in browser with local-test banner. No production patient changes. Full clinical save/reload and authorization tests still pending.


## 2026-10-23 — Published individual cases in local testing

Imported 8 separately reported cases from 3 primary publications into demo-meditrack only, with 12 clinical child documents. No synthetic demographics or calendar dates. Stable literature IDs, explicit source locator/DOI/licence, missingness and quality flags. Five table-based cases have inconsistent source summaries and remain software-test-only. Added a source section and relative timeline display in case view. Existing production data/configuration untouched. Documented import script refuses remote emulator hosts and skips existing IDs transactionally. Reimport verified 0 new/8 skipped. Normal client owner query read all 8 cases/12 events; anonymous read rejected. Local emulator export completed. Check 0 errors/0 warnings, build passed. Full report in workspace outputs/MediTrack-Import-publizierter-Faelle.md.


## 2026-10-24 — Complete local clinical form test

Two explicitly synthetic disposable cases entered through real browser forms, including initial and further surgery, follow-up, PROM, reload and exact database comparison. Three disposable accounts used. Confirmed and fixed baseline comment overwrite (new baselineComments field), registration role overwrite (merge plus invalidation), missing draft save guard and post-save draft reset. Added in-flight submission guards. A reload/navigation error is addressed narrowly by full-page Return to baseline; attempted global rendering change reverted. No production reads/writes or migrations.

All chosen numerical values, including BMI 24.8, zero hospital nights and zero pain/absence values, verified. Fresh registration preserves role user. Deleted both synthetic cases recursively and all three test accounts/profiles. Existing 8 literature cases and all their children unchanged by full snapshot hash. Exported cleaned emulator state. Final check 0 errors/0 warnings, build and diff checks pass. Full test report and synthetic screenshot in workspace outputs/MediTrack-Durchlauftest-2026-10-24.md and MediTrack-Durchlauftest.jpg.

Limits: no concurrency/load test, no production rules parity check. PROM default 5, absent operation linkage/measurement dates, historical hospitalDays units and registration atomicity remain open.


## 2026-10-24 — Explicit PROM responses, atomic numbering, first descriptive analysis

Removed assumed slider score 5: blank numeric responses remain null, explicit zero is retained, new PROM documents versioned 2. Entirely blank submissions rejected. Shared documentation helper creates random child IDs and atomically increments parent counters for follow-ups/additional surgeries, bootstrapping legacy numbers/gaps without rewriting existing documents. Removed manual follow-up number. Four independent web SDK clients verified unique 8–11 follow-ups and 5–8 additional surgery numbers with legacy sentinels preserved. Portable local regression script added (npm run test:local); all disposable test records/accounts cleaned up, existing8 literature cases/children hash unchanged.

Added Analysis navigation/route, source/dataset filters, synthetic exclusion, descriptive case-level summaries with missingness, original procedure counts, documentation counts and provenance. No inferential or recurrence claims. Calculations verified against8 published cases. Browser confirmed empty selection, excluded synthetic record and explicit partial PROM persistence. Independent source review fixed negative-healing-status misclassification and nav spacing; shared filter styling confirmed. Check0/0, build/diff pass.

Visual review not complete: full-data browser inspection required temporary LOCAL test read-all claim, auto-review rejected unapproved rights expansion; user approval requested, no claim set. Test account cleaned up. Mobile viewport override did not apply (actual1280 despite requested320), no valid mobile capture. Finish reviewer disposition recapture, not ship. Full report in workspace outputs/MediTrack-PROM-Nummerierung-Analyse-2026-10-24.md. No productive rules/data/deployment changes.


## 2026-10-24 — Approved local read-only visual review completed

User explicitly approved temporaryLOCAL admin-read access. A disposable demo-meditrack account received the claim; populated /analysis was inspected with8 literature cases, each DOI filter, regular empty dataset, and case/provenance links. Read succeeded; attempted clinical creation correctly denied. Actual320px viewport succeeded after reload: document320px, fields48px/font16, nav44px; wide table contained in280px scroll region. Screenshots captured for desktop/mobile. Fresh reviewer found only missing product documentation; PRODUCT.md added, sole fix scored resolved, disposition ship. No source/UI changes in this completion step.

Removed claim, deleted disposable profile/account, rechecked all8 cases and children against the original full snapshot hash (identical), exported cleaned emulator state. Earlier auto-review rights rejection resolved by explicit user authorization, never bypassed. Full report updated in workspace outputs/MediTrack-PROM-Nummerierung-Analyse-2026-10-24.md. Actual mobile hardware/touch not tested; scientific interpretation remains descriptive only.


## 2026-10-24 — Presentation candidate: role contract and clinical context

Unified application authorization on Auth claims, added admin recorder attribution, removed the conflicting duplicate patient list and guarded all clinical saves against admin writes. Registration writes its profile once. Added optional email verification and password-reset requests. No professional-identity verification is claimed. Read-only inspection of the actual July2025 production rules found requested-owner-only parent writes and admin child writes; corrected security/firestore.rules is a NOT-deployed candidate requiring explicit approval. Local policy now permits admin profile reads for attribution, freezes profile roles and preserves owner IDs.

Evidence review led to versioned working outcomes: persistent/never healed distinct from recurrence after complete healing, no arbitrary universal cutoff. Follow-ups/PROMs require operation linkage and assessment date; new PROMs remain exploratory, have explicit anchors and legacy uncertainty warnings. Index healing ignores later-operation healing. Historical records remain unchanged. See clinical-definitions.md and release-readiness.md for citations, boundaries and remaining study decisions.

Check0/0 and build pass. Local SDK tests validate normal-user separation, denied role spoofing/takeover/ownership transfer, read-only admin including all clinical children, independent-client numbering, PROM and clinical-date logic. Browser follow-up/PROM save, normal/admin views, local verification/reset requests and actual320px analysis checked. Temporary test fixtures are excluded and removed after verification. No production data/rules changes, push or deployment.

Final browser-test cleanup: one synthetic case with two assessments and both disposable accounts removed, temporary admin claim cleared. Exact snapshot hash of all eight original local cases and descendants matches the pre-test baseline. Verification/reset request types confirmed in local Auth emulator; no passwords changed. Independent source/visual reviewer approved the local demonstration candidate, not production release.


## 2026-10-24 — Security audit and identity-scoped draft fix

Completed Codex Security Standard source scan 33ec3468-3e22-4229-a4ba-b1f84eeaf0e6 against the pre-fix working-tree snapshot. Independent baseline and architecture review, 59 distinct non-generated text implementation/configuration/documentation files. One low-severity shared-browser draft finding; no claim of production penetration-test or regulatory certification. A focused helper hit a usage limit; parent performed the remaining investigation and separate bypass/regression review. Completed scan is immutable and describes the pre-fix state.

Then locally fixed that narrow boundary: UID-bound baseline drafts, clear on Auth identity change/sign-out, identity recheck before save, no late A-save cleanup of B's draft, route-state teardown on UID change, navigation on external logout. Existing files only; no new runtime dependencies. check0/0, build and diff checks pass. Added local regression for A→B, logout, direct UID switch, same-user navigation and stale cleanup. Existing owner/admin/concurrency/outcome tests pass. Browser verified logout+Back disables old draft, other-tab logout removes OP and loaded case views, and a legitimate new own case saves baseline/OP correctly. Removed one synthetic control case and both temporary accounts; exact original8-case/children snapshot unchanged. No production data, rules, claims, Git push or Vercel changes.

Separate read-only npm advisory query (no install/update) reports 28 affected package entries:4critical/12high/10moderate/2low. These are version metadata, not validated app attack paths; package updates/reachability assessment remain release blockers. EU/DSGVO, possible NIS2/CRA/MDR applicability, actual data locations/contracts and institution approval are a separate documented release gate. Firebase Auth provider documentation identifies US processing; no blanket EU-residency assurance. Details in security-review.md and workspace security outputs.

## 2026-10-27 — Restricted release preparation, approval boundary and neutral design

User explicitly authorised production publication, then required permanent administrator approval for every clinician account. Added separate memberships records (approved, approvedBy, approvedAt), a pending-account screen and Team approval/revocation UI. Firestore independently rejects unapproved clinical access, self-approval, malformed approval writes, foreign access/ownership takeover and all administrator clinical writes. Existing accounts are not auto-approved; no clinical records are migrated. The exact locally tested rules were published to meditrack-72826 and read back byte-for-byte (SHA-256 4ae91830f76ef52e421a918ece5ddedf9d1ec22e1f3cc50a9f21aa4277234c01). Prior policy retained in local release evidence. No production patient documents read or changed.

Updated existing framework and Firebase packages, kept SvelteKit 2/Node 22, pinned the official Vercel adapter and Frankfurt function region. Admin SDK moved to development tools. Two narrow transitive overrides patch cookie and gRPC; local SDK regression re-run. Known-package audit reduced from 28 affected entries (4 critical) to 2 low entries; remaining enhanced-form/prerender advisories are not exercised by this source. Remote Vercel previews now fail before build until a separate staging database is configured. Added basic framing, MIME, referrer and device-permission headers; these do not constitute a complete CSP or compliance certification.

Neutral off-white/white palette replaces yellow tones; shared select arrows/forced-colour fallback and top-aligned patient rows. Updated design references and documented actual approval flow. Browser: pending login, admin approval, own-only list, initial/new operation, linked follow-up and partial PROM save/reload; separate comments, BMI22.5, explicit zero, numbering and stored links checked. Only disposable local synthetic records used. Desktop visually inspected; the current browser ignored the requested mobile viewport (actual1280), so no new320px success is claimed. Prior24October320px evidence is historical. Final hosting outcome and fixture cleanup are recorded in workspace release evidence.

Provider metadata: Firestore Berlin/europe-west10; required userId ASC + createdAt DESC index READY; point-in-time recovery and database deletion protection disabled. No paid settings enabled. Institutional controller, privacy information, legal basis, processors/transfers, study authorisation and tested backup/recovery remain open for Prof. Doll/institution. Public technical publication is not clinical or legal approval.

Release cleanup: browser-created values and three linked child records verified, then2synthetic cases and2test accounts/profiles/memberships removed. Original8literature cases and all children retain SHA-256 ed43de15f959c0993f90defbe55b410dc7eadc5ab740e5927f2540f01e425ee7. Local administrator bootstrap is explicitly UID-selected, emulator-only and tested to refuse a missing UID. Shared controls now force48px height after desktop inspection found Safari date fields two pixels taller.

A Firebase CLI login diagnostic unexpectedly returned CLI credentials in tool output. The affected local CLI session was revoked/removed; no credential payload is copied into release files. Application accounts and service-account credentials were not changed. Firebase CLI requires a new interactive login for later cloud CLI operations.

Final route polish: unauthenticated browser navigation to clinical/team pages redirects to sign-in. The check runs only in the browser so server rendering cannot incorrectly discard a persisted Firebase session on a deep-link reload. Server-side Firestore authorization remains the independent data boundary.

## 2026-10-27 — Post-deploy shared-browser cache boundary

Final review identified that a Firebase Auth UID switch does not itself clear Firestore’s client memory cache. Added a regression reproducing an A document still readable from the same client cache after switching to B; a recreated client has no such cached document and B’s server read is denied. Root Auth changes now use full document replacement instead of SPA routing, discarding that memory. Browser-history restoration reloads persisted pages as well. No additional package, clinical data migration or backend access expansion. This complements (and does not replace) the UID-bound draft clearing and Firestore rules.

The fresh-client cache regression passed. Browser registration still completed its profile write, remained pending, and logout returned to sign-in; Back did not restore an authenticated session. Disposable registration account/profile removed. First sign-in deliberately keeps SPA navigation so it cannot interrupt registration’s profile write. Read-only provider metadata additionally found zero scheduled Firestore backups.
