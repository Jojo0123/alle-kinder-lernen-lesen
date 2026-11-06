# Strategie- und Positionierungspapier
## „Alle Kinder lernen lesen" — Open-Source-Leselernspiel für Vorschulkinder und Leseanfänger

**Stand: November 2026 · Codebasis: `AlleKinderlernenlesen` (v64) · Ziel: Fördermittel BMBF/BMFTR Prototype Fund & NLnet Foundation**

Alle Aussagen dieses Papiers basieren auf einer vollständigen Code-Analyse des lauffähigen Prototyps (Live-Demo, PWA + Android). Belege sind im Anhang A „Code-Fakten-Register" aufgeführt.

---

# TEIL 1: Ist-Analyse des Prototyps (Inventur für Fördergutachter)

## 1.1 Spielmechanik & Didaktik — Was der Code bereits leistet

Der Prototyp implementiert **vier Spielmodi** plus ein Belohnungs-System, die zusammen die frühe Leseentwicklung von der Lautwahrnehmung bis zum Wortlesen durchlaufen:

**Modus 1 — „Buchstaben lernen" (Graphem-Phonem-Zuordnung)**
Das Kind hört einen Laut (Audio) und wählt unter vier illustrierten Buchstabenkarten die passende Karte. Jeder Buchstabe ist als Aquarell-Illustration mit passendem Anlautmotiv dargestellt (A = Affe, B = Bär … Z = Zebra, 26 Motive). Bei richtiger Zuordnung erscheint die animierte Buchstabenkarte als Belohnung (4,5-s-Video: das Tier bewegt sich am Buchstaben). Fehlversuche werden nicht sanktioniert, sondern mit sanftem Shake und erneutem Lauthinweis quittiert.

**Modus 2 — „Wörter lernen" (Wort-Bild-Zuordnung & orthografische Reihenfolge)**
Aus einem Bild (77 Wörter, z. B. AFFE, SONNE, AUTO, BALL, KATZE) wird das Wort aus Buchstaben-Kacheln zusammengesetzt — per Tap oder Drag-and-drop in Leer-Slots. Die Prüfung erfolgt auf exakte Reihenfolge und Versal-Schreibung. Distraktor-Kacheln machen aus dem Raten eine echte Diskriminierungsaufgabe. Belohnung: animierte Wortkarte (Video mit Standbild-Fallback).

**Modus 3 — „Laute zusammensetzen" (Phonemsegmentierung)**
Das Herzstück der phonologischen Bewusstheit: 77 Wörter sind in **Lautabschnitte segmentiert** (`wortSegmentierung`), mit expliziter Digraphen-Didaktik: Vokal-Digraphen (au, ei, …) und Konsonant-Digraphen (sch, ch, ck, …) sind EINE Kachel, wortanlautliche Cluster bleiben zusammen (St → „Scht"), auslautliche Cluster werden getrennt, Silbengelenk-„e" wird als `e-schwa` geführt. Das Kind setzt Wörter aus Lauten zusammen — die zentrale Vorläuferfähigkeit des Leseerwerbs.

**Modus 4 — „Tiere finden" (Wortlesen mit Szenenverständnis)**
In einer Szene (Dschungel, 7 Tiere) wird unten ein Tiername eingeblendet — das Kind muss **lesen** (nicht hören: der Name wird bewusst NICHT vorgelesen, das Lesen ist die Übung), das richtige Tier tippen, erhält Tiergeräusch + Belohnungs-Video. Wichtiges Nebenmerkmal: Richtig-Falsch wird über Segmentierungsmasken (SAM) pixelgenau aufgelöst.

**Level-Logik & Feedback:** Sessions à 12 Runden, First-Try-Tracking („auf Anhieb richtig"), Abschluss-Zeremonie (CongratulationsScreen). Kein Timer, kein Punktestand, kein Wettbewerb, keine Strafen — Fehlerfreundlichkeit ist konstruktiv eingebaut („Versuch es noch einmal", Auditiv-Wiederholung). Der Wortschatz umfasst **77 Wörter der Lektion 1** (Bilder + Audio) in einer **modularen Lektionsstruktur** (`data/<id>/`, über Konfiguration erweiterbar — das Auswahlmenü für Lektionen ist bereits im Code).

**Zusätzlich implementiert:** Eltern-Bereich mit **RecordingStudio** — Eltern/Familien können eigene Aussprache-Aufnahmen einsprechen (Kategorien Laute / Lautabschnitte / Wörter, serverseitig normalisiert und validiert). Die App kann also in der **Stimme der Familie** sprechen — ein Alleinstellungsmerkmal für Bindung und Mehrsprachigkeit.

## 1.2 Audio & Phonetik-Check — Lautgetreu oder Buchstabennamen?

**Befund: Lautgetreu (phonemtreu).** Verifiziert per Datei-Analyse:

- Die 26 Dateien `public/Laute/<BUCHSTABE>.mp3` und die Phonem-Bibliothek `public/Lautabschnitte/<laut>.mp3` sind **dieselben Aufnahmen** (md5-identisch für die geprüfte Stichprobe A, F, L, M, S).
- Die Dauern belegen gehaltene Einzellaute: M = 0,68 s („mmm"), F = 1,31 s („fff"), L = 0,63 s — ein Buchstabenname („Em", „Ef") läge bei 0,2–0,4 s mit zwei distinkten Silben.
- Vokale werden kurzdauernd als Laut geführt (A = 0,47 s, e-Schwa = 0,24 s), Diphthonge und Digraphen als eigene Einheiten (au, ei, sch = 0,37 s, scht, ch-hard / ch-soft minimalpaarig getrennt).

Das ist der **entscheidende didaktische Qualitätsunterschied** zu den meisten kommerziellen Apps, die Buchstabennamen abspielen („Em-Ah-Te" statt „mma") und damit systematisch falsche Lesestrategien erzeugen. Ehrliche Einordnung: Die Laute für X („ks") und Y („üpsilon") sind Sonderfälle der deutschen Laut-Buchstaben-Beziehung und im Code als Einzel-Einträge gelöst; dies sollte in der Didaktik-Dokumentation benannt werden (Chance statt Schwäche: zeigt Fachlichkeit). Sprachausgabe-Fallback ist die Web-Speech-API des Browsers (de-DE, Rate 0,9) — primär für Feedback-Phrasen, nicht für die Lautlehre.

## 1.3 Technischer Stack & Architektur

- **Framework:** React 19 + Vite 6 + TypeScript. Kompaktes Bundle (~277 KB, 81 KB gzip) inkl. React.
- **PWA / Offline:** Service-Worker mit ~200 precached Assets, Shell = Network-first, Assets = Cache-first. Voll offline nutzbar nach erstem Aufruf. Android-App via Capacitor (derselbe Code).
- **Rendering:** DOM + Tailwind-Utility-CSS, Videos (H.264) mit Standbild-Fallback. Keine Spield-Engine nötig — geringe Einstiegshürde für Contributors.
- **Content-Architektur:** Inhalte sind streng von Logik getrennt — Wörter, Bilder, Audio, Phonem-Segmentierungen liegen als Daten (`words.ts`, `laute.ts`, `data/<id>/`). Ein Sprach- oder Themenwechsel ist primär ein Content-Import, kein Fork.
- **Asset-Pipeline (einzigartig):** Sämtliche Illustrationen und Animationen (26 Buchstaben-Animationen, 77 Wort-Animationen, Tier-Belohnungsclips) wurden über eine **lokal betriebene generative Video-KI** (MiniMax H3, auf eigener Hardware) aus den Standbildern erzeugt — eine reproduzierbare, dokumentierte OER-Asset-Factory ohne Cloud-Abhängigkeit und ohne Lizenzzweifel bei Stockmaterial.
- **Datenschutz (kritisch geprüft):** Keine Cookies, keine Accounts, keine Analyse-Tools, keine Server-Datenerhebung, Fortschritt nur lokal. **ABER drei Drittanbieter-Requests existieren:** Google Fonts (Lexend), Google Material Symbols und das Tailwind-CDN (`cdn.tailwindcss.com` — lädt die Stylesheets zur Laufzeit!), dazu eine tote Importmap-Referenz auf `aistudiocdn.com` (React wird längst lokal gebündelt). Für einen Privacy-First-Grant sind das **bekannte, planbare Quick-Wins** (Teil 5) — die Architektur selbst ist datensparsam.
- **Status Fortschritts-Tracking:** Die Statistik im Eltern-Bereich zeigt aktuell **Demo-Mock-Werte** (hardcoded). Echte Persistenz (localStorage/IndexedDB) ist als Lücke bekannt und Teil der Roadmap (Teil 3).

---

# TEIL 2: Pädagogisches Framing (Fachsprache der Grundschulpädagogik & Bildungsforschung)

## 2.1 Übersetzung der Code-Mechaniken in Fachbegriffe

| Spielmechanik im Code | Fachbegriff (Bildungsforschung) |
|---|---|
| Laut hören → Buchstabenkarte wählen | **Graphem-Phonem-Korrespondenz (GPC)**, Anlautzuordnung — Kern der Lautiermethode |
| Wort in Lautkacheln zerlegen/setzen | **Phonemsegmentierung und Lautsynthese** = phonologische Bewusstheit **im engeren Sinne** |
| Digraphen als eine Kachel (sch, ch, au, ei) | **Kanon-gerechte Lautstruktur** nach Fibel-Standard (Diphthonge/Digraphen als Einheiten) |
| `e-schwa` als eigener Laut | **Schwa-Laut-Behandlung** — fachlich korrekt, in Konsum-Apps fast nie implementiert |
| Wort aus Buchstaben ordnen (Distraktoren) | **Orthografische Reihenfolge-Kompetenz**, visuelle Differenzierung |
| Tiername im Bild finden (ohne Vorlesen) | **Ganzwort-Leseverständnis**, transferorientierte Lesekompetenz |
| Audio + Bild + sparsame Animation | **Multimedia-Lernprinzipien nach Mayer** (Kohärenz-, Signal- und Redundanzprinzip: nur das Ziel-Tier bewegt sich — kognitive Last wird reduziert, nicht erhöht) |
| Kein Timer, keine Punkte, Fehlerfreundlichkeit | **Mastery-Learning- und Selbstwirksamkeitsprinzip**, Vermeidung von Leistungsangst |
| RecordingStudio (Familienstimmen) | **Bindungsorientierte Sprachmodellierung**, mehrsprachige Aktivierung des Elternhauses |

Was **nicht** im Code ist (ehrwürdig zu benennen): Silben-Bewusstheit und Reim-Bewusstheit (beides Vorläuferfähigkeiten im weiteren Sinne), Schreibmotorik (Buchstaben nachfahren), Minuskeln (aktuell ausschließlich Versalien — didaktisch für die Einstiegsphase vertretbar, aber Ausbau-Punkt). Diese Lücken sind exakt die Roadmap des Prototype-Fund-Antrags (Teil 3.3) — Gutachter sehen so einen reifen Prototyp mit ehrlicher, begründeter Entwicklungsagenda.

## 2.2 Warum dieser Ansatz LRS-Prävention ist — drei Kernargumente

**1. Lautgetreue GPC verhindert den „Buchstabennamen-Fehler" — die häufigste didaktische Fehlentwicklung kommerzieller Apps.**
Der Code erzwingt Phonemtreu technisch (eine gemeinsame Phonem-Bibliothek, md5-verifiziert). Kinder, die mit Buchstabennamen arbeiten („M-A-M-A"), verfestigen eine Lesestrategie, die beim Übergang zum Lautieren scheitert — ein klassischer, vermeidbarer LRS-Risikofaktor. Unser Spiel etabliert von der ersten Minute die korrekte Laut-Buchstaben-Beziehung („mmm-a-mmm-a").

**2. Phonemsegmentierung ist der empirisch beste Prädiktor für den späteren Leseerwerb — und unser Kernmodul.**
Die Lautabschnitte-Übung trainiert exakt die Fähigkeit (phonologische Bewusstheit im engeren Sinne), die in Längsschnittstudien (u. a. Marburger Leseprogramm, BIPS-Kohorten) die stärkste Vorhersagekraft für den Leseerwerb und LRS-Risiken hat. Die Digraphen-Logik entspricht dem Grundschul-Kanon und bereitet den Fibel-Einstieg vor, ohne ihn vorwegzunehmen.

**3. Druckfreie, fehlerfreundliche Lautwelt bedient die sensible Phase des Buchstabeninteresses — ohne Vorlernzwang.**
Kinder zwischen 4 und 6 durchlaufen eine natürliche Phase des Interesses an Buchstaben (frühe Schriftlichkeit, logografische Phase). Das Spiel begleitet diese Phase **auditiv-visuell ohne Schreib- und Lesedruck**: kein Blatt, kein Stift, kein Vergleich — genau die „vorschulische Druckfreiheit", die Grundschulpädagogik einfordert. Damit entkräftet es den Vorwurf des „verfrühten Vorlernens" fundamental: Es wird nicht Schule vorweggenommen, sondern **Vorläuferfähigkeit geübt** — der offizielle Ansatz von „Lesen lernen" in der Eingangsphase, in spielerischer Form und ohne Notendruck. (Anschlussfähig an IGLU-Befunde zum sozialen Gradienten im Lesen und an das BMBF-Startchancen-Programm: ein Werkzeug, das Kindern aus bildungsfernen Haushalten genau die Vorerfahrung gibt, die heute ungleich verteilt ist.)

---

# TEIL 3: Positionierung BMBF/BMFTR Prototype Fund (Civic Tech, OER & Bildungsgerechtigkeit)

## 3.1 Problemstellung

Der Markt für Leselern-Apps ist gesättigt und strukturell gescheitert:

- **Paywalls & Abo-Modelle:** Die brauchbaren Inhalte kosten 5–10 €/Monat — ein Bildungsgüter-Zugangsproblem, das die Ungleichheit (IGLU-Gradient nach sozialer Herkunft) reproduziert statt zu bekämpfen.
- **Tracking von Kindern:** Werbe-SDKs, Analyse-SDKs, teils Cloud-TTS mit Datenabfluss — bei einer Zielgruppe unter 6 Jahren inakzeptabel und mit der Datenschutz-Grundverordnung kaum vereinbar.
- **Didaktische Fehler:** Viele Apps spielen Buchstabennamen statt Laute ab („Em-Ah-Te"), überfordern mit Timer/Punkte/Streaks (Gamification-Dark-Patterns) und ersetzen Lernfortschritt durch Konsumententreue.
- **Intransparenz:** Eltern und Pädagog:innen können weder Wortschatz noch Lernlogik einsehen, geschweige denn anpassen. Keine OER-Lizenz, kein Quelltext, keine didaktische Begründung.

## 3.2 Lösungsansatz: Demokratisierung durch offene Infrastruktur

„Alle Kinder lernen lesen" ist eine **freie Open Educational Resource (OER)** — Code und Inhalte unter offenen Lizenzen (Vorschlag: AGPL-3.0 für Code, CC BY-SA 4.0 für Assets/Inhalte). Damit ist Leseförderung:

- **Geldbeutel-unabhängig:** kostenlos, offline nutzbar (PWA), läuft auf jedem alten Android-Gerät — kein Account, kein Abo, keine Datenkosten nach dem ersten Laden.
- **Bildungshintergrund-unabhängig:** Die App erklärt nichts, sie spricht mit dem Kind — kein elterliches Coaching nötig. Gleichzeitig können Eltern ihre eigene Stimme einsprechen (RecordingStudio), was genau die Haushalte erreicht, in denen wenig vorgelesen wird.
- **Pädagogisch durchschaubar:** Jede Mechanik ist begründbar und dokumentierbar (Teil 2). Kitas und Grundschulen können Inhalte selbst ergänzen (eigene Wortlisten), statt Software zu konsumieren.
- **Herstellbar ohne Cloud:** Die Asset-Pipeline (generative Illustration/Animation auf eigener Hardware) macht neue Inhalte billig und lizenzfrei reproduzierbar — ein Modell, das andere OER-Projekte kopieren können.

## 3.3 Ausbau-Roadmap — 6 Fördermonate von PoC zur Version 1.0

**AP 1 — Adaptive Lernstufen-Engine & echte Lernstandsdaten (ca. 6 Wochen)**
Aus den Code-Lücken abgeleitet: Fortschrittspersistenz (localStorage/Export statt Mock), echte Statistiken im Eltern-Dashboard, adaptive Aufgabenauswahl (First-Try-Rate steuert Schwierigkeit), Minuskel-Ergänzung (a/A) und ein **Silben- & Reim-Modul** (Vorläuferfähigkeiten im weiteren Sinne — Teil 2.1-Lücke) mit derselben Content-Struktur wie `wortSegmentierung`.

**AP 2 — Eltern- & Pädagogen-Editor (ca. 5 Wochen)**
Aus dem RecordingStudio + der modularen `data/<id>/`-Struktur herauswachsen: Oberfläche zum Anlegen eigener Lektionen (Wortliste, Bild-Upload, Audio-Einsprechen), Export/Import von Lektionspaketen (JSON), vorbereitete Pakete für Kita-Gruppen und Deutsch-als-Zweitsprache-Förderkurse.

**AP 3 — Barrierefreiheit (WCAG 2.1 AA) (ca. 4 Wochen)**
Tastaturbedienung, Screenreader-Labels/ARIA für alle Spielmodi, Kontrast-Optimierung (Vision-QA identifizierte Schwächen bei gelben Kacheln/Disabled-Buttons), kognitive Zugänglichkeit (vereinfachter Modus), Ausbau der automatischen Größenanpassung (das vorhandene AutoFit-Zoom-System als Basis für Sehschwäche-Großdarstellung). Prüfung mit dem Barrierefreiheitsteam eines Partners (z. B. Blinden- und Sehbehindertenverband).

**AP 4 — Mehrsprachigkeit & DaZ + OER-Evaluation (ca. 5 Wochen)**
Content-Struktur i18n-fähig machen (Sprachpakete), Pilot-Sprachen Türkisch und Ukrainisch (stark nachgefragt in Kitas), Lautsystem-Anpassung dokumentiert (Phonem-Bibliothek ist bereits das Trennungsmerkmal). Parallel: Feld-Test mit zwei Vorschuleinrichtungen inkl. kurzer didaktischer Evaluation (Vorher-Nachher Phonem-Bewusstheit), Ergebnis als offener Report — die Währung, in der Gutachter Vertrauen messen.

**Meilenstein-Matrix:** PoC (heute) → Alpha (AP1+AP3, Monat 3) → Beta mit Editoren (AP2, Monat 4) → v1.0 mit Evaluation (AP4, Monat 6).

---

# TEIL 4: Positionierung NLnet Foundation (Open-Source-Infrastruktur, Privacy & Digital Commons)

## 4.1 Technical Pitch (English)

**Early-Literacy Engine — a privacy-by-design, offline-first open-source toolkit for child language acquisition.**

We are not pitching „an app". We are pitching **reusable infrastructure** for a domain where proprietary platforms have captured the market and children's data:

- **Architecture:** A React/TypeScript PWA with strict content-logic separation. All learning content (word lists, phoneme libraries, audio, illustrations) lives in versioned, schema-able data structures — a new language or curriculum is a content pack, not a fork. The same codebase ships as an installable Android app via Capacitor.
- **Privacy by design, verifiable:** No accounts, no cookies, no analytics, no server-side data collection, no third-party CDNs (hardening in progress — see M1). Children's progress never leaves the device. This is architected, not bolted on.
- **Offline-first as an equity feature:** A service-worker-cached asset set makes the full app work on low-end devices without connectivity — the realistic infrastructure condition for the families early literacy actually needs to reach.
- **Audio/phonics core as a reusable module:** A phoneme-faithful audio library (verified phoneme-identity across exercise types, minimal-pair digraph handling, schwa treatment) with a parent-recording pipeline (local audio capture, validated upload, loudness-normalized processing). The phoneme layer is written to be swappable per language — the technical precondition for transparent, non-colonial localization of early reading tools.
- **Reproducible OER asset factory:** All illustrations and animations are generated by locally hosted generative models on the maintainers' own hardware, with a documented, re-runnable pipeline. This solves the OER licensing bottleneck for children's media (no stock-photo ambiguity) and is itself infrastructure others can adopt.
- **Why NLnet:** The project produces digital commons (open content + open tooling), enshrines privacy for a vulnerable user group, and its content-pack architecture is directly extensible to under-served languages — aligning with NGI's goals of open, trustworthy, human-centric technology.

## 4.2 Konkrete Git-Meilensteine (Meilenstein-basierte Abrechnung)

Jeder Meilenstein endet in einem taggbaren Git-Release mit dokumentiertem Diff- und Testumfang:

- **M1 — Privacy Hardening & Supply-Chain Cleanup.** Entfernung aller Drittanbieter-Requests (Tailwind zur Build-Zeit kompilieren, Fonts self-hosted, Importmap-Rest entfernen), Content-Security-Policy, dokumentiertes Threat-Model + Privacy-Statement-Generator, reproduzierbare Builds (lockfile + CI-Build-Attest). *Basis: `index.html`, `public/sw.js`.*
- **M2 — Content-Engine & Schema.** JSON-Schema für Lektionen/Phoneme/Silben, Validierungs-CLI, Import/Export von Sprachpaketen, dokumentiertes Format (README + Beispielpack). *Basis: `data/laute.ts`, `data/words.ts`, `lessonLoader.ts`.*
- **M3 — Offline-First v2.** Robustes Cache- und Update-Verhalten (Versionierung, atomare Content-Updates, Storage-Quota-Handling), installierbare PWA mit Update-UX, deterministische Service-Worker-Releases, Netzwerk-Ausfall-Tests in CI. *Basis: `public/sw.js` (Cache-Architektur v64).*
- **M4 — Accessibility & i18n Toolkit.** ARIA/Tastatur-Navigation durch alle Modis, Screenreader-Smoke-Tests, RTL-Grundlagen, abstrahierte Phonem-Layer-Schnittstelle für nicht-lateinische Schriften, i18n-Konfiguration. *Basis: `components/*` (Spielmodi), AutoFit-System.*
- **M5 — Open Asset Pipeline („OER Asset Factory").** Dokumentierte, re-runfähige Skriptkette zur Asset-Generierung (Illustration/Animation, lokales Modell), Lizenz-Manifest mit Prüfsummen, CI-Job zur Regenerierbarkeit, Beitragsguide für Modell-/Prompt-Evolution. *Basis: `buchstaben-anim/`, `tier-spiel/`, `animationen/`.*

Budget-Orientierung: 5.000–50.000 € auf Meilenstein-Basis; realistisch: M1+M2 (Phase 1) und M3+M4+M5 (Phase 2) als gestaffelter Antrag.

---

# TEIL 5: Domain-Empfehlung & Demo-Vorbereitung

## 5.1 Domain-Ranking

Der Spielcharakter im Code: breit aufgestelltes Leselernspiel (Laute, Buchstaben, Wörter, Tiere) für Vorschulkinder — kein reines Anlaut- oder Silbenspiel. Namens-Identität im Code: „Alle Kinder lernen lesen", Maskottchen „Leo der Löwe" (Eltern-Dashboard).

**Ranking:**

1. **kinder-lernen-lesen.org** — exakte Markenübereinstimmung mit dem Produktnamen, `.org` signalisiert Gemeinwohl/OER (förderfähigkeitskonform für Prototype Fund wie NLnet), sofort verständlich für Eltern UND Gutachter. (Fallback: kinder-lernen-lesen.app — moderner, aber weniger OER-codiert.)
2. **lesefunken.org** — emotional, kurz, markenfähig; ideal, falls ein „eigener Name" gewünscht ist. `.org` bevorzugt.
3. **leselernspiel.de** — deskriptiv, stark für deutsche Suche (SEO), `.de` für das Kernmarkt-Vertrauen; weniger einzigartig.

*Nicht empfohlen:* anlautspiel.de / silbenspiel.de (zu eng — das Spiel ist mehr als das, Silben existieren noch nicht als Modul und würden den Erwartungsrahmen sprengen), lautzauber.de (reizvoll, aber nur ein Aspekt), kinder-lernen-lesen.app (Fallback).

**Eigener Namensvorschlag aus den Code-Motiven:** **„Leo liest" (leoliest.de / .org)** — abgeleitet aus dem Maskottchen Leo (Löwe, bereits im Code als „Leos Fortschritt" verankert) und den 26 Tier-Motiven der Buchstabenbilder. Kindgerecht, alliterativ, auf allen Sprachen gut aussprechbar, als Marke ausbaufähig („Leos Lautladen", „Leos Tierparcours"). Für die Förderanträge bleibt der Arbeitstitel „Alle Kinder lernen lesen" (beschreibend = gutachterfreundlich), Leo wird die Kind-Marke.

## 5.2 Quick-Wins vor dem Demo-Deployment (sofort im Repo machbar)

1. **Drittanbieter-CDNs eliminieren (DSGVO/NLnet-Blocker Nr. 1).** Tailwind-CDN durch Build-Time-CSS ersetzen, Lexend-Font + Material-Symbols lokal einbetten, tote `aistudiocdn.com`-Importmap entfernen. Danach: **Null Third-Party-Requests** — im Privacy-Audit der stärkste einzelne Hebel. (Halber Tag Arbeit.)
2. **Fortschritts-Tracking echt machen.** Die Mock-Werte („124 gelernte Wörter") durch echte localStorage-Persistenz ersetzen (Wortliste + First-Try-Raten). Demo-Killer, wenn Gutachter nach dem Reload leere/irreale Zahlen sehen. (1–2 Tage.)
3. **„Über dieses Projekt"-Button im Startscreen** (Info-Modal): Didaktik in 5 Sätzen (Teil 2.2 verdichtet), Open-Source-Hinweis, Lizenz-Links, „Keine Daten, kein Tracking"-Versprechen. Gutachter wollen nach dem Klick sofort verstehen, WARUM das gut ist. (Ein halber Tag.)
4. **Lizenz- und Rechts-Infrastruktur anlegen:** `LICENSE` (Code), `CREDITS.md` (Tiergeräusche CC-BY bereits vorhanden — ins Hauptverzeichnis ziehen; H3-Assets: Generierung dokumentieren), `DATENSCHUTZ.md` + `IMPRESSUM.md` (Pflicht für .de-Angebote und Förderanträge). (Ein Tag.)
5. **Zwei Screenshots + 60-Sekunden-Video der Demo** (Screen-Recording mit Voiceover „So lernt ein Kind seinen ersten Buchstaben") direkt auf die Landingpage — Gutachter klicken selten 4 Minuten lang; ein Video verkauft das Didaktik-Konzept in 60 Sekunden. (Ein halber Tag, mit vorhandener Video-Pipeline.)

**Reihenfolge-Empfehlung:** 1 → 3 → 2 → 4 → 5. Punkt 1 ist der einzige echte Compliance-Punkt, 3 und 5 heben die Gutachter-Erfahrung sofort.

---

# Anhang A: Code-Fakten-Register (Auswahl, verifiziert)

- Phonem-Bibliothek `Laute/*.mp3` ≡ `Lautabschnitte/*.mp3`: md5-identisch (Stichprobe A, F, L, M, S); Dauern 0,24–1,31 s = gehaltene Laute, keine Buchstabennamen.
- Digraphen-Regeln in `wortSegmentierung` (77 Wörter): Vokal-/Konsonant-Digraphen = 1 Einheit, e-Schwa als eigener Laut, wortanlautliche Cluster zusammengefasst.
- Lektionsstruktur `data/<id>/` (77 Bilder + 77 Sounds in Lektion 1), Auswahlmenü im Code.
- 4 Spielmodi + SuccessScreen (Wort-Animation mit Standbild-Fallback) + CongratulationsScreen + ParentDashboard + RecordingStudio (Kategorien: laute/lautabschnitte/woerter, Regex-Validierung, Loudness-Normalisierung).
- AutoFit: automatische Zoom-Skalierung (0,6–1,6) für alle Bildschirmgrößen — Basis für Barrierefreiheits-Vergrößerung.
- Service-Worker v64: ~200 precached Assets inkl. 26 Buchstaben-Animationen; Shell network-first, Assets cache-first.
- Asset-Inventar: 26 Buchstabenbilder (1024²), 26 Buchstaben-Animationen (768², 4,5 s), 77 Wort-Animationen, TierSpiel-Szene + Tier-Clips + Tiergeräusche (CC-lizenziert, `CREDITS.txt`), 26 Laut-MP3, ~25 Lautabschnitts-MP3, 77 Wort-MP3.
- Datenschutz-Status: keine Cookies/Accounts/Analyse; Drittanbieter: Google Fonts, Material Symbols, Tailwind-CDN (Quick-Win 1), tote aistudiocdn-Importmap. Fortschritt: Mock-Daten (Quick-Win 2).
- Stack: React 19, Vite 6, TypeScript, Tailwind (derzeit CDN), PWA + Capacitor-Android, H.264-Video, Web-Speech-API (de-DE) als Feedback-Fallback.
