# MediTrack – UI-Gesamtdurchgang

Stand: 21.10.2026, lokale Arbeitsversion. Ziel: die gesamte vorhandene Oberfläche auf Bedienbarkeit, Konsistenz und robuste Darstellung prüfen und verbessern. Keine produktive Veröffentlichung und keine Usability- oder klinische Validierungsstudie.

## Gestalterische und technische Entscheidungen

| Before | After | Why |
| --- | --- | --- |
| Seitenspezifische Schattenkarten, Emojis, uneinheitliche Formularabstände | Gemeinsame Formulargestaltung, klare englische Beschriftungen und getrennte Abschnitte | Gleiche Aufgaben sollen auf jeder Seite gleich bedienbar sein |
| Einzelne Formularbuttons nur mit Klickhandler | Native Formulare, Enter-Unterstützung und vorhandene HTML-Validierung | Vorhersehbare Tastaturbedienung und weniger versehentliche leere Pflichtfelder |
| Unterschiedliche Schriften und Buttons | Systemschrift, zentrale Feld- und Aktionsstile | Keine zusätzliche Schriftdatei; vertraute Darstellung auf dem jeweiligen Gerät |
| Kleine oder uneinheitliche Felder | 16px Feldschrift, mindestens 48px Feldhöhe, sichtbarer Fokus | Bessere Lesbarkeit und Touchbedienung; Ursache des iOS-Eingabezooms vermeiden |
| Fehlende Eingaberückmeldung und wiederholt mögliche Kontoaktionen | Pending-Zustand für Login/Registrierung, deaktivierte Aktionen während des Vorgangs | Mehrfache Ausführung vermeiden und Wartezustand verständlich machen |
| Nur Mausbedienung des Profilmenüs | Escape, Fokus zurück zum Auslöser, Schließen außerhalb und nach Navigation | Vorhersehbare Tastatur- und Zeigerbedienung |
| Potenziell überlange ID-/Textspalten | Umbruchfähige Grid-Spalten und vollständige Werte | Identifikation bleibt möglich, ohne horizontales Scrollen |
| Alle Listenzeilen gleichzeitig gerendert | Höchstens 25 sichtbare Datensätze pro Seite | Große Listen belasten das DOM weniger; dies ist noch keine Firestore-Pagination |
| Ungültige Datumsstrings konnten normalisiert oder anders typisierte Werte falsch behandelt werden | Defensive Datumsprüfung; nicht lesbare Werte als Not recorded gekennzeichnet | Anzeige erfindet kein Datum und bleibt bei alten Daten stabil |
| Alte /case-Seite schrieb Platzhalterdaten | Weiterleitung zur regulären Anlage | Kein zweiter, veralteter Dokumentationsweg |
| Unbenutzte direkte uuid-Abhängigkeit nach Stilllegung des Prototyps | Direkte Abhängigkeit entfernt | Schlankere Projektdefinition; ggf. transitive Nutzung durch andere Pakete bleibt npm überlassen |
| Geplanter Skalierungseffekt auch bei Tastatureingabe | Unmittelbare Deckkraft-Rückmeldung ohne Animation | Keine bewegten klinischen Bedienelemente und keine Tastaturverzögerung |
| Ein neuer Back-to-baseline-Link hätte einen nicht unterstützten Bearbeitungsschritt suggeriert | Back to patients | Keine falsche Zusage zur Entwurfsbearbeitung; dauerhafte Entwürfe brauchen eine eigene Umsetzung |

## Umfang

Gelesen und überarbeitet: gemeinsames Layout, Startseite, Login, Registrierung, Profil, Einstellungen, beide Patientenübersichten, Fallansicht und Feldanzeige, Baseline, Initialoperation, weitere Operation, Follow-up und PROM. Für die Kontoseiten und klinischen Formulare wurden doppelte lokale CSS-Regeln entfernt. Die ursprünglichen klinischen Speicherfunktionen und Datenpfade wurden erhalten. Änderungen an der Formularbedienung sind dennoch funktionale Änderungen: Browservalidierung greift jetzt vor dem Submit.

Die bestehenden UI-Quelldateien schrumpften in diesem Durchgang von 2.458 auf etwa 1.940 Zeilen; hinzu kommt eine kleine, ausdrücklich auf lokale Entwicklung beschränkte Testansicht. Keine neue Laufzeitbibliothek installiert. Die Zahl ist ein Größenvergleich, kein Qualitätsnachweis.

## Einsatz der Skills

- **emil-design-eng:** Hierarchie, konsequente Bedienelemente, gute Defaults und unmittelbare Rückmeldung.
- **apple-design:** Systemtypografie, klare Zustände, konsistente Navigation, Zurückhaltung statt dekorativer Effekte.
- **mobile-native:** 16px-Felder, Touchziele, Hover nur bei geeigneter Eingabe, Safe-Area-Abstände, dynamische Viewporthöhe, Zoom nicht gesperrt.
- **break-ui:** synthetische Fälle über dieselben PatientList-/RecordFields-Komponenten, umschaltbar zwischen Demo data, Worst case, Empty, One und 1,000 rows.
- **improve-animations / find-animation-opportunities / review-animations:** unabhängige Quellcodeprüfung; überflüssige Einblendungen, Datenanimationen und Menüanimation bewusst verworfen. Eine Tastaturanimation wurde gefunden und entfernt.
- **animate / animation-performance:** Häufigkeits- und Zweckprüfung ergibt für diese Arbeitsoberfläche keine benötigte Bewegungsanimation. Kein GPU-Layer-, Blur- oder Animationsbibliotheks-Zusatz.
- **pick-ui-library:** vorhandene Svelte-/Browser-Mittel reichen aus. Die überwiegend auf React ausgerichteten Bibliotheksempfehlungen werden nicht in Svelte hineingezwungen.
- **prototype:** keine offene Variantenwahl in diesem konkreten Durchgang; keine parallelen Produktoberflächen eingebaut.
- **animate-expo, write-swift, ask-sonner:** keine passende technische Grundlage (Svelte-Web-App statt Expo, Swift oder React/Sonner). **animation-vocabulary / find-skills:** keine Benennungs- oder Skillsuchaufgabe. Diese Skills wurden nicht künstlich ausgeführt.

## Synthetische Prüfdaten und Grenzen

| Wert | Quelle/Typ | Grenze im vorhandenen Code | Getestet |
| --- | --- | --- | --- |
| Fall-ID | PatientList.id, string | keine UI-Längenbegrenzung | lange plausible Studien-ID, CJK-ID, vollständiger Umbruch |
| Sex | optionaler String | Formulare bieten male/female; Altdaten zur Laufzeit nicht schemavalidiert | leer, langer Altdatenhinweis |
| Geburts-/OP-Datum | optionale Datumstrings | keine verlässliche Leseschema-Validierung außerhalb dieser Anzeige | leer, ungültiger Kalendertag, gültige Daten |
| Erstellungszeit | Date/null in Listenmodell | kein gemeinsames Altdatenschema | null, Invalid Date, Zeitzonengrenze |
| Arzt-/Kliniktext | RecordFields, string | keine maxLength in bestehenden Formularen | langer Name mit Diakritika, lange Klinikbezeichnung |
| Kommentare | RecordFields/string | keine maxLength | Zeilenumbrüche, lange URL, HTML als sichtbarer Text statt ausführbarem Inhalt |
| Numerische/boolesche Werte | RecordFields, unknown | heterogene Altdaten möglich | 0, false, NaN |
| Listenumfang | Patientenarray | Abfrage lädt weiterhin alle passenden Fälle | 0, 1, 3 und 1.000 Fälle; 25 gerenderte Zeilen, Seite 2 beginnt mit Datensatz 26 |
| Formularwerte | Baseline, number/null | bisherige min/required-Regeln, keine vollständige fachliche Validierung | 180cm/80,5kg → BMI 24,8; Löschen des Gewichts leert BMI; Dezimalgewicht zulässig |

Die lokale Testansicht unter `/dev/ui` hat keine Speicheraktion. Ihre Auswahlbuttons werden erst nach Initialisierung aktiviert, damit ein sehr früher Klick nicht wirkungslos bleibt. Eine Quellcodeprüfung des Produktionsbuilds bestätigt: Der Loader gibt außerhalb der Entwicklungsumgebung 404 zurück. Synthetische Testdaten werden nicht in Firestore geschrieben.

## Prüfung und Aussagegrenzen

- Svelte-/TypeScript-Prüfung und Build durchgeführt; Ergebnisse siehe Entwicklungsprotokoll.
- Desktopansichten mit nachgemessenen 1280px und schmale Ansichten mit 320px. Getestete Formulare, Kontoansichten und Grenzfallliste ohne horizontalen Dokumentüberlauf.
- Accountmenü: Enter öffnet, Escape schließt und stellt Fokus wieder her, Klick außerhalb schließt.
- Die Datenumschaltung wurde auch nach Hydrierung und einem Wechsel von Demo zu Worst case geprüft. RecordFields aktualisiert dabei seine verfügbaren Feldnamen.
- Zusätzliche unabhängige UI-Prüfung und Bewegungsprüfung. UI-Prüfung zunächst fix wegen falscher Rücknavigation; nach Korrektur ship für diese Korrektur. Bewegungsprüfung nach Entfernen der Skalierung approve.
- Kein echter Smartphone-/Tablet-Hardwaretest. Softwaretastatur, Notch, Touchgefühl und reale Bildschirmvergrößerung auf 200% sind noch nicht validiert. Mobile Browsergrößen ersetzen diese Prüfung nicht.
- Helles Theme ausdrücklich festgelegt; kein ungeprüftes Dark-Mode-Versprechen. Browser-eigene Datumsdialoge folgen der Systemsprache.
- Keine realen Login-/Registrierungs-/Speicher-/Logout-Aktionen im UI-Test ausgeführt. Die getrennte Kontovorschau auf lokalem Port 5174 diente nur der anonymen Ansicht.
- Vorhandene fachliche Probleme bleiben offen: Kommentarüberschreibung, Konflikte bei Follow-up-Nummern, doppelte Profilspeicherung bei Registrierung, unklare historische hospitalDays-Einheit, flüchtiger Entwurf und produktive Security Rules. Der UI-Durchgang ist kein Sicherheits- oder Datenintegritätsaudit.
