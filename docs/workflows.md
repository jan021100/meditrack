# MediTrack: Codeabläufe verstehen

Stand: 24.10.2026 · lokale Arbeitsversion, nicht veröffentlicht. Frühere Änderungsabschnitte bleiben datiert; aktueller Sicherheitsstand siehe security-review.md.

Diese Diagramme beschreiben den gelesenen Code, keine geplante Zielarchitektur. Sie sind eine technische Arbeitsdokumentation und Grundlage für spätere Abbildungen der Dissertation. Bei Änderungen am Datenfluss diese Datei aktualisieren. Sie enthalten keine Patientendaten oder Zugangsdaten. Für eine wissenschaftliche Veröffentlichung müssen Abbildungen einem konkreten Versionsstand zugeordnet werden.

## Die Bausteine

- **Svelte-Seite:** zeigt Felder an und reagiert auf Eingaben.
- **Speicherfunktion:** sammelt Feldwerte und ruft Firebase auf.
- **Store:** vorübergehender Speicher im Arbeitsspeicher des Browsers.
- **Firebase Auth:** verwaltet Anmeldung und Benutzerkennung (UID).
- **Firestore:** speichert Dokumente dauerhaft. Security Rules entscheiden über erlaubte Zugriffe; das Ausblenden eines Buttons ersetzt diese Regeln nicht.

## 1. Anmeldung und Patientenübersicht

```mermaid
flowchart TD
    A[Login: E-Mail und Passwort] --> B[Firebase Auth prüft Anmeldung]
    B --> C{Anmeldung erfolgreich?}
    C -->|Nein| D[Login zeigt Fehlermeldung]
    C -->|Ja| E[Navigation zum Dashboard]
    E --> F[Dashboard liest Auth-Token-Claims]
    F --> G{Auth-Claim admin?}
    G -->|Ja| H[Alle Patientendokumente abfragen]
    G -->|Nein| I[Eigene Fälle nach createdAt absteigend abfragen]
    H --> J[Firestore Rules entscheiden über Zugriff]
    I --> J
    J -->|Erlaubt| K[Fallkarten anzeigen]
    J -->|Fehler| L[Sichtbare Fehlermeldung und erneutes Laden anbieten]
```

Code: `src/routes/login/+page.svelte` → `src/routes/dashboard/+page.svelte` → `src/lib/components/PatientList.svelte`. Das Root-Layout (`src/routes/+layout.ts`) liest zusätzlich Auth-Zustand und Claims für die gemeinsame Navigation; Profiltexte werden separat geladen.

**Aktuell:** Die Oberfläche und der Regelkandidat verwenden Auth-Claims, nicht das Profil-Rollenfeld. Lokale Zugriffstests bestanden; produktive Regelabweichungen sind dokumentiert und noch nicht veröffentlicht korrigiert. Die Admin-Abfrage hat weiterhin keine explizite Sortierung.

## 2. Patient mit Initialoperation anlegen

```mermaid
flowchart TD
    A[Baseline-Felder eingeben] --> V[Browser prüft vorhandene Pflichtfelder und Grenzen]
    V --> B[Continue ruft goToSurgeryForm auf]
    B --> C[caseData speichert Baseline im Browser-Arbeitsspeicher]
    C --> D[Navigation zum Initial-OP-Formular]
    D --> E[OP-Felder eingeben und Save wählen]
    E --> F{Aktueller Nutzer vorhanden?}
    F -->|Nein| G[Anmeldefehler anzeigen]
    F -->|Ja| H[saveCase kombiniert Baseline und OP-Felder]
    H --> I[addDoc: patients mit userId und Serverzeit]
    I --> J{Schreibzugriff erfolgreich?}
    J -->|Ja| K[Navigation zum Dashboard]
    J -->|Nein| L[Fehlermeldung im Formular]
```

Code: `src/routes/patients/new/+page.svelte` → `src/lib/stores/caseStore.ts` → `src/routes/patients/new/surgery/+page.svelte`.

**Wichtig:** Initial-OP und Baseline liegen gemeinsam im Patientendokument. Weitere OPs liegen in einer Unterkollektion. Der Store ist noch kein gespeicherter Datenbankentwurf.

**Stand 24.10.2026:** Neuladen verliert den Entwurf; die initiale OP kann ohne Baseline nicht gespeichert werden. Ein vollständiger Seitenaufruf führt zur Baseline zurück. Nach erfolgreichem Speichern wird der Store geleert. Neue Fälle bewahren Baseline-Bemerkungen als `baselineComments` und OP-Bemerkungen als `comments`. Keine Migration alter Fälle. Fachliche Vollständigkeit und Plausibilität werden noch nicht verlässlich geprüft.

## 3. Weitere Dokumentation speichern

```mermaid
flowchart TD
    A[Fallansicht] --> B{Welche Dokumentation?}
    B -->|Weitere OP| C[saveSurgery: Nutzer prüfen und Altbestand lesen]
    C --> D[Transaktion: Zähler und neue surgeries-ID]
    B -->|Follow-up| E[saveFollowUp: Altbestand lesen]
    E --> F[Transaktion: Zähler und neue followups-ID]
    B -->|PROM| G[saveProm: explizite Antworten validieren]
    G --> H[addDoc in proms mit Version 2 und null für fehlende Werte]
    D --> I[Firestore Rules prüfen den Schreibzugriff]
    F --> I
    H --> I
    I -->|Erfolg| J[Zurück zur Fallansicht]
    I -->|Fehler| K[Fehlermeldung im jeweiligen Formular]
```

Code: die drei Seiten unter `src/routes/patients/[id]/{surgery,followup,proms}/+page.svelte`. Alle Unterkollektionen gehören zu `patients/{patientId}`. Die gemeinsame Transaktionsfunktion erzeugt zufällige IDs für weitere OPs und Follow-ups. PROMs nutzen addDoc.

**Stand 24.10.2026:** Neue Follow-ups und weitere OPs verwenden zufällige Dokument-IDs und einen atomaren Patientenzähler (siehe Abschnitt unten). Weitere-OP-Nummern zählen zusätzliche OPs ohne Initial-OP. Die manuelle Follow-up-Nummer entfällt. Neue PROMs starten leer und tragen Version 2; Altwerte bleiben unklar. Neue Follow-ups und PROMs benötigen Operations-ID und Erhebungsdatum; historische Dokumente bleiben unverändert.

## 4. Einen Fall anzeigen

```mermaid
flowchart TD
    A[Fallkarte als Link öffnen] --> B[Patientendokument laden]
    B --> C{Dokument vorhanden?}
    C -->|Nein| D[Patient not found anzeigen]
    C -->|Ja| E[surgeries, followups und proms laden]
    E --> F[Ereignisse zu einer Liste zusammenführen]
    F --> G[Nach OP-Datum, Follow-up-Datum oder Erstellungszeit sortieren]
    G --> H[Baseline, Initialoperation und weitere Ereignisse anzeigen]
    B -->|Ladefehler| I[Failed to load patient anzeigen]
    E -->|Ladefehler| I
```

Code: `src/lib/components/PatientList.svelte` verlinkt auf `src/routes/patients/[id]/+page.svelte`. Nach erfolgreichem Speichern navigieren die Formulare wieder hierher; die Ansicht lädt die Dokumentation erneut.

**Anzeige aktualisiert (21.10.2026):** Baseline und Initialoperation werden getrennt dargestellt; Zahlen und boolesche Werte bleiben sichtbar. Die Komponente `RecordFields.svelte` übersetzt Feldbezeichnungen für die Anzeige, ohne Daten zu verändern. **Offen:** Die Initialoperation liegt weiterhin im Hauptdokument und wird separat vor den weiteren Ereignissen angezeigt. Die Sortierung ist keine verlässliche OP-Zuordnung und keine wissenschaftliche Verlaufsanalyse.

## 5. Registrierung

```mermaid
flowchart TD
 A[Create account] --> B[Firebase Auth account]
 B --> C[One profile write with details and role user]
 C --> D[Own dashboard]
 B -->|Error| E[Show registration error]
 C -->|Error| E
 D --> F[Optional email verification in profile]
```

Auth-Konto und Profil sind nicht atomar; bei einem Profilfehler kann das Konto schon existieren. Die E-Mail-Verifizierung ist keine Prüfung ärztlicher Qualifikation.

## Änderung am 21.10.2026: 77 Warnungen behoben

| Bisher | Jetzt | Zweck |
|---|---|---|
| 69 Beschriftungen ohne technische Feldzuordnung | `label for` verweist auf die jeweilige Feld-`id` | Beschriftung anklickbar und für Hilfstechnologien zugeordnet |
| Fallkarten als anklickbare div-Elemente (4 Warnungen) | echte Links mit sichtbarem Tastaturfokus | Navigation per Maus und Tastatur |
| Avatarbilder anklickbar; Gruppenlabel unverbunden (3 Warnungen) | beschriftete Buttons mit Auswahlzustand, fieldset und legend | Tastaturbedienung und verständliche Gruppierung |
| selbstschließendes div (1 Warnung) | regulär geschlossenes div | eindeutiges HTML |

Keine neuen App-Abhängigkeiten, keine Unterdrückung von Warnungen, keine Änderungen am Speichermodell. Neue Datei im Projekt: nur diese Dokumentation. Codeprüfung: **0 Fehler, 0 Warnungen**. Build: erfolgreich; adapter-auto erkennt bei lokalem Build keine Hostingplattform. Keine Schreibtests in Firebase und kein manueller vollständiger UI-Test durchgeführt. Die hier beschriebenen offenen Funktionsfehler werden durch die warnungsfreie Prüfung nicht behoben.

## Ergänzung: UI-Gesamtdurchgang vom 21.10.2026

Alle klinischen Eingaben nutzen jetzt native Formulare. Ihre bestehenden Speicherfunktionen und Datenpfade sind unverändert; vorhandene HTML-Validierung greift vor dem Submit. Login und Registrierung haben einen sichtbaren Pending-Zustand. Die Patientenliste zeigt je Seite maximal 25 bereits geladene Fälle; dies ändert die Datenbankabfrage nicht. Der alte `/case`-Prototyp leitet auf die reguläre Anlage um und schreibt keine Beispieldaten mehr. Die lokale Testansicht `/dev/ui` verwendet ausschließlich synthetische Daten ohne Speicheraktion und ist im Produktionsbuild gesperrt. Prüfgrenzen und bekannte offene fachliche Fehler siehe `ui-review.md`.


## Local test isolation (2026-10-23)

```mermaid
flowchart TD
  A[Start MediTrack] --> B{Development or loopback browser?}
  B -->|Yes| C[demo-meditrack configuration]
  C --> D[Local Auth and Firestore emulators]
  D --> E[Separate test account and synthetic patients]
  D -->|Emulator unavailable| F[Request fails, no production fallback]
  B -->|No| G[Existing production Firebase configuration]
```

Reload existing tabs after changing the connection. Local emulator rules are a proposed test policy; production rule parity is not established.


## Published individual-case extraction (2026-10-23)

```mermaid
flowchart TD
 A[Public primary publication] --> B{Individual patient facts available?}
 B -->|No| C[Keep aggregate study data separate]
 B -->|Yes| D[Extract facts with case and section locator]
 D --> E[Preserve missing values and flag source contradictions]
 E --> F[Versioned source manifest]
 F --> G[Local demo-only import with duplicate protection]
 G --> H[Case view with provenance and relative intervals]
```

Literature extracts are selected publication cases, not newly recruited patients or a representative cohort.


## Atomare Nummerierung und deskriptive Analyse (24.10.2026)

```mermaid
flowchart TD
 A[Dokumentation speichern] --> B[Altbestand: Nummern und Lücken prüfen]
 B --> C[Transaktion liest Zähler im Patientendokument]
 C --> D[Neue Nummer und zufällige Dokument-ID]
 D --> E[Zähler und Unterdokument gemeinsam committen]
 E -->|Konflikt: erneuter Versuch| C
 F[PROM ohne Vorgabewert] --> G[Unbeantwortet null, bewusst eingegebene Null bleibt 0]
 G --> H[Werte validieren und PROM-Version 2 speichern]
 I[Analyse lädt zugängliche Fälle] --> J[Synthetische Fälle ausschließen]
 J --> K[Datensatz und Quelle auswählen]
 K --> L[Median, Bereich, verfügbare und fehlende Werte; Quellen anzeigen]
```

Code: src/lib/firebase/documentation.ts, src/lib/prom.ts, src/lib/analysis/summary.ts und src/routes/analysis/+page.svelte. Produktive Regelprüfung steht aus. Die gefüllte Analyse wurde nach ausdrücklicher lokaler Lesefreigabe auf Desktop und bei320px geprüft; temporäres Konto und Rechte anschließend entfernt.


## Claim-based access and linked assessments — 24 October 2026

```mermaid
flowchart TD
 A[Sign in with Firebase Auth] --> B[Read trusted Auth claims]
 B --> C{Admin claim?}
 C -->|No| D[Query own patient IDs only]
 C -->|Yes| E[Read all cases and recorder profiles]
 D --> F[Own case entry and own analysis]
 E --> G[Read-only global overview and analysis]
 F --> H[Firestore independently checks existing owner]
 G --> I[Firestore candidate denies clinical writes]
```

```mermaid
flowchart TD
 A[Select case and stable operation ID] --> B[Enter actual assessment date]
 B --> C[Validate known operation date and clinical sequence]
 C --> D{Follow-up or PROM?}
 D -->|Follow-up| E[Classify persistent, recurrent, no recurrence reported or uncertain]
 D -->|PROM| F[Explicit responses with null distinct from zero]
 E --> G[Save definition version, recorder and assessment context]
 F --> G
 G --> H[Save record; number surgeries and follow-ups atomically]
 H --> I[Case timeline uses assessment date]
 I --> J[Analysis excludes synthetic records and discloses missingness]
```

Registration: create Auth account, then one default-user profile write. These two services are not atomic; a profile failure can leave a sign-in-capable account requiring recovery. Actual deployed rule differences are documented in release-readiness.md; the above write boundary describes the tested candidate, not current production.


## Kontowechsel und Patientenentwürfe — 24.10.2026

Entwürfe gehören zu einer Auth-UID. Logout und direkte UID-Wechsel löschen sie; vor dem Speichern wird die UID erneut geprüft. Die gesamte klinische Seiteninstanz wird bei Kontoänderung neu aufgebaut. Abmelden in einem zweiten Tab führt ebenfalls zurück zur Anmeldung. Verspätete Speicherantworten von A löschen keinen Entwurf von B. Siehe Diagramm und Nachweise in security-review.md.

## Dauerhafte Team-Freischaltung — 27.10.2026

```mermaid
flowchart TD
 A[Registrierung: Auth-Konto und eigenes Profil] --> B[Warteseite: keine klinischen Rechte]
 B --> C[Admin prüft Identität, Studienteilnahme und institutionelle Erlaubnis]
 C --> D[Admin speichert Freigabe mit UID und Serverzeit in memberships]
 D --> E[Firestore prüft Freigabe UND vorhandenen Fall-Eigentümer bei jedem Zugriff]
 E --> F[Eigene Fälle erfassen und eigene Daten deskriptiv auswerten]
 G[Zugang entziehen] --> H[Freigabe false: weitere klinische Zugriffe gesperrt]
 H --> I[Patientendokumente bleiben erhalten]
 J[Vertrauenswürdiger Admin-Claim] --> K[Alle Fälle lesen und Teamzugang verwalten]
 K --> L[Klinische Schreibzugriffe bleiben verboten]
```

Code: src/lib/access.ts, src/routes/+layout.ts, src/routes/pending, src/routes/admin/users und security/firestore.rules. Profilfelder können keine Freigabe oder Adminrolle erteilen. Bereits gelesene Daten lassen sich durch einen Rechteentzug nicht aus externen Kopien zurückholen.


## Paketwartung und Datensicherung — 27.10.2026

```mermaid
flowchart TD
  A[Bekannte Paketwarnung] --> B[Offizielle Korrektur und Kompatibilität prüfen]
  B --> C[Pakete und betroffene Aufrufe lokal aktualisieren]
  C --> D[Typprüfung, Build, lokale Rechte- und Datentests]
  D --> E[Browserprüfung und temporäre Testdaten entfernen]
  E --> F[Dokumentierter lokaler Stand]
  F --> G[Veröffentlichung erst nach ausdrücklicher Anweisung]
  H[GitHub: Programmcode] -. keine Patientendaten .-> I[Firestore: Patientendokumente]
  I --> J[Eigene Sicherung und getestete Wiederherstellung nötig]
  J --> K[Automatische kostenpflichtige Backups vom Nutzer abgelehnt]
```

Der Paketstand wurde zunächst lokal aktualisiert und geprüft; die anschließende Veröffentlichung über GitHub/Vercel wurde am27.10. ausdrücklich beauftragt. Der Bereitstellungsnachweis liegt im Arbeitsbereich. Die Backup-Lücke bleibt offen. Es wurde weder eine automatische Sicherung aktiviert noch eine lokale Kopie echter Patientendaten angelegt.
