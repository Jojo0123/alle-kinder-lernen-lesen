# Antrags-Vordrucke: Prototype Fund (BMFTR „Software Sprint")
## Projekt: „Alle Kinder lernen lesen" / leselernspiel.de — Ausfüll-Vorlage

**Stand: 06.11.2026 · Bewerbungsfrist: 30. November 2026! · Budget: bis 47.500 € (Einzelantrag)**

---

## 0. Kopfdaten & Empfehlung

| Punkt | Wert |
|---|---|
| Förderlinie (Empfehlung) | **Jahrgang 03 – „Resilienz"** („Freie Alternativen zu proprietärer, zentralisierter und dominierender Software") — die kommerziellen Lern-App-Monopole sind exakt das, wogegen diese Linie fördert |
| Alternative | „Innovation" (Datensicherheit/Software-Infrastruktur) — falls die Jury Resilienz anders schneidet |
| Nicht geeignet | „Up and Coming" (unter 26 / in Ausbildung) |
| Ablauf | **Phase 1:** Online-Bewerbung bis 30.11.2026 auf bewerben.prototypefund.de → Jury-Auswahl → **Phase 2:** formaler Antrag via easy-online (Vorhabenbeschreibung + Erklärungen, Workshop des Projektträgers, s. Anhang) |
| Stundensatz | pauschal 50,00 € anerkannt → **47.500 € = 950 Arbeitsstunden** (6 Monate, ~158 h/Monat ≈ Vollzeit) |
| Eigenanteil | 5 % = **2.375 €** (Eigenleistung/Kapital; Kontoauszug-Nachweis!) — Auszahlung quartalsweise **nachschüssig**, Vorleistung nötig |
| Steuer | Zuwendung i. d. R. umsatzsteuerfrei (BMF-Schreiben 26.08.1999); Einkommensteuer: Steuerberater fragen |

---

## A. Bewerbungstexte — Phase 1 (Portal bewerben.prototypefund.de)

*Die Textblöcke sind so geschnitten, dass sie in die üblichen Portal-Felder passen (Projektname, Kurzbeschreibung, Beschreibung, Passung, Zielgruppe, Budget, Links, Team). Beim Ausfüllen 1:1 übernehmen; Zeichenlimits im Portal prüfen und ggf. kürzen.*

### A1. Projektname
**Alle Kinder lernen lesen — die offene Leselern-App (OER)**

### A2. Tagline (ein Satz)
Eine datenschutzfreundliche, kostenlose Open-Source-App, die Kindern das Lesen über Laute beibringt — statt über Werbung, Abofallen und Buchstabennamen-Fehler.

### A3. Kurzbeschreibung — Was ist das Ziel?
„Alle Kinder lernen lesen" ist eine quelloffene Lese-Lern-App für Vorschulkinder und Leseanfänger (4–7 Jahre). Die App trainiert die wissenschaftlich belegten Vorläuferfähigkeiten des Leseerwerbs — Graphem-Phonem-Zuordnung, Phonemsegmentierung, Wort-Bild-Zuordnung — in vier spielerischen Modi, komplett offline nutzbar, ohne Tracking, ohne Werbung, ohne Abo. Sie ist als Progressive Web App für jedes Handy und Tablet nutzbar und wird als Open Educational Resource (Code AGPL, Inhalte CC BY-SA) veröffentlicht. Ziel ist, die frühe Leseförderung vom Geldbeutel und Bildungshintergrund der Eltern zu entkoppeln: ein Werkzeug, das jede Familie ohne Anmeldung und ohne Kosten nutzen kann — und das Pädagog:innen und Eltern inhaltlich durchschaubar und selbst erweiterbar ist (eigene Wortlisten, eigene Audio-Aufnahmen in Familienstimme).

### A4. Gesellschaftliches Problem & Motivation
Internationale Schulleistungsstudien (IGLU) zeigen seit Jahren: ein Viertel der Viertklässler:innen in Deutschland verfehlt die Mindeststandards im Lesen — mit starkem Gefälle nach sozialer Herkunft. Die frühe Phase vor dem Schuleintritt entscheidet dabei maßgeblich über den späteren Leseerfolg. Gleichzeitig ist der Markt für Leselern-Apps geprägt von Abo-Modellen (5–10 €/Monat), Werbe-SDKs, Tracking von Kindern unter sechs Jahren und — am gravierendsten — didaktischen Fehlern: Viele Apps spielen Buchstabennamen statt Laute ab („Em-Ah-Te" statt „mmm-a-mmm-a") und erzeugen damit genau die falschen Lesestrategien, die später zu Lese-Rechtschreib-Schwierigkeiten beitragen. Kostenlose, didaktisch korrekte, datenschutzfreundliche Werkzeuge fehlen weitgehend. Genau diese Lücke adressiert das Projekt: Bildungsgerechtigkeit durch freie Software.

### A5. Technische Lösung & Abgrenzung
React/TypeScript-PWA mit strikter Trennung von Lernlogik und Inhalten (Wörter, Laute, Bilder liegen als versionierte Datenpakete vor — neue Sprachen/Themen sind Content-Pakete, kein Fork). Der Audio-Kern ist phonemtreu aufgebaut (verifizierte Laut-Bibliothek, Digraphen- und Schwa-Behandlung nach Grundschul-Kanon) und umfasst eine Aufnahme-Pipeline, mit der Eltern eigene Aussprache einsprechen können („Familienstimmen"). Vollständige Offline-Nutzbarkeit per Service-Worker, Null Third-Party-Requests, keine Cookies/Konten/Analytik. Alle Illustrationen und Animationen (26 Buchstaben-Animationen, 77 Wort-Animationen) wurden über eine lokal betriebene generative Asset-Pipeline erzeugt und sind lizenzfrei reproduzierbar — die „OER-Asset-Factory" löst das Lizenzproblem von Kinder-Medienmaterial grundsätzlich. Bestehende Alternativen: proprietäre Abo-Apps (unerreichbar für bildungsferne Haushalte, intransparent didaktisch), einzelne Schul-Buchstaben-Apps mit Werbung, offene Lese-Software meist für Desktop/Schule ohne mobile PWA- und Audio-Ausstattung. Keines dieser Projekte verbindet phonemtreue Didaktik + Offline-First + Privacy-by-Design + selbst erweiterbare Inhalte in einem mobilen, kindgerechten Produkt.

### A6. Passung zur Förderlinie „Resilienz"
Der kommerzielle Markt für frühkindliche Bildungssoftware ist oligopolistisch strukturiert: zwei, drei Abo-Apps dominieren die Stores, Bindung entsteht über Streaks/Punkte statt Lernfortschritt, Daten fließen in Analytik-Netzwerke. Das Projekt ist die freie Alternative im Wortsinn der Linie: es ersetzt ein proprietäres, datensammelndes Konsumprodukt durch eine offene Infrastruktur, die niemandem gehört und allen gehört. Es ist resilience-building im doppelten Sinn — für Familien (Unabhängigkeit von Anbietern, von Zahlungsfähigkeit, von Plattform-Ökosystemen: die App läuft offline auf alten Geräten) und für die Bildungslandschaft (Pädagog:innen können Inhalte einsehen, ändern, ergänzen — statt Software zu konsumieren, die sie nicht verstehen dürfen).

### A7. Zielgruppe & Verbreitung (Ergebnisverwertung)
Primär: Familien mit Kindern von 4–7 Jahren, besonders solche mit geringem Bildungskapital und mehrsprachige Haushalte (die Audio-Aufnahmen erlauben Lautsprache in jeder Familiensprache). Sekundär: Kita-Fachkräfte, Vorschul-Förderkurse, Grundschulen (Eingangsphase), LRS-Therapeut:innen. Verbreitung über: (1) die Website leselernspiel.de als sofort nutzbare Demo (keine Installation nötig), (2) OER-Portale und Bildungsserver der Länder, (3) Kooperationen mit Kitas/Grundschulen für den Feldtest (geplant in AP4), (4) Selbstverbreitung über die PWA (Homescreen-Installation, offline), (5) Veröffentlichung des Repositories mit sauberer Dokumentation, damit andere Projekte die Engine für andere Sprachen/Themen übernehmen können.

### A8. Repository / Links
- Live-Demo: https://leselernspiel.de (Zweit-Domain: https://kinder.extensos.de)
- Quellcode: wird vor Bewerbungsschluss auf einer offenen Plattform veröffentlicht (GitHub/GitLab, Lizenz AGPL-3.0; Inhalte CC BY-SA 4.0) — *offener Punkt: Repo-URL nach Veröffentlichung eintragen*

### A9. Budget & Zeitrahmen (Kurzfassung fürs Portal)
950 Arbeitsstunden à pauschal 50,00 € = **47.500 €** (6 Monate). Eigenanteil 5 % (2.375 €) wird als Eigenleistung eingebracht. Keine Sachkosten nötig (Entwicklungsumgebung vorhanden). Detaillierter Arbeitsplan in der Vorhabenbeschreibung (Abschnitt C).

### A10. Team / Wer steckt dahinter
Einzelperson: erfahrener Softwareentwickler und Inhaber eines Software-Unternehmens (Web-/Mobile-Entwicklung), Entwickler mehrerer selbst gehosteter Open-Source-Projekte. Der Prototyp der App ist fertig und live (siehe Demo) — inklusive vier Lernmodi, 77-Wörter-Kanon, Audio-Bibliothek und animierten Lernmaterialien. Bezug zur Bildungsarbeit: Umsetzung in enger Abstimmung mit der Zielgruppe (eigene Kinder als Testkohorte, Lese-Lern-Praxis als Anforderungsquelle).

---

## B. Die drei Zusammenfassungen (easy-online Felder V07–V08, max. 2.000 Zeichen, Sachform ohne „ich/wir")

### B1. Zusammenfassung Vorhabenbeschreibung — Was ist das Ziel des Vorhabens?
*(~1.800 Zeichen)*

> Ziel des Vorhabens ist die Weiterentwicklung der quelloffenen Lese-Lern-App „Alle Kinder lernen lesen" vom derzeitigen, live betriebenen Prototypen zur barrierefreien Version 1.0 als Open Educational Resource. Die App begleitet Kinder von vier bis sieben Jahren spielerisch beim Einstieg ins Lesen und trainiert die wissenschaftlich belegten Vorläuferfähigkeiten des Leseerwerbs: die lautgetreue Zuordnung von Buchstaben zu Lauten, die Zerlegung von Wörtern in Lautabschnitte inklusive Digraphen und Schwa-Laut sowie die Wort-Bild-Zuordnung. Der Bestandsprototyp umfasst vier Spielmodi, einen phonemtreuen Audio-Kanon, 77 Wörter mit Illustrationen und Animationen sowie eine Aufnahmefunktion, mit der Familien eigene Aussprache einsprechen können. Im Förderzeitraum werden vier Arbeitspakete umgesetzt: (1) adaptive Lernstufen mit echter Fortschrittsdokumentation sowie Silben- und Reimübungen, (2) ein Eltern- und Pädagogen-Editor zum Anlegen eigener Lektionen und Wortlisten, (3) systematische Barrierefreiheit nach WCAG 2.1 AA einschließlich Tastaturbedienung und Screenreader-Unterstützung, (4) Mehrsprachigkeit und Deutsch als Zweitsprache mit Pilotpaketen für Türkisch und Ukrainisch sowie ein Feldtest mit zwei Vorschuleinrichtungen. Die Software wird unter AGPL-3.0, die Inhalte unter CC BY-SA 4.0 veröffentlicht. Übergeordnetes Ziel ist die Demokratisierung der frühen Leseförderung: ein werbefreies, datenschutzfreundliches, offline nutzbares Werkzeug, das unabhängig vom Einkommen und Bildungshintergrund der Familien funktioniert und von Pädagog:innen inhaltlich durchschaut, verändert und erweitert werden kann.

### B2. Zusammenfassung Arbeitsplan — Was ist der Arbeits-/Meilensteinplan?
*(~1.800 Zeichen)*

> Der Arbeitsplan gliedert den sechsmonatigen Förderzeitraum in vier Arbeitspakete mit insgesamt 950 Arbeitsstunden. AP 1 (Monat 1–2, 320 h) „Adaptive Lernstufen und Lernstandsdaten": Implementierung einer anpassenden Aufgabenauswahl auf Basis der Trefferquote, persistente Fortschrittsdokumentation lokal auf dem Gerät, Erweiterung um Minuskeln sowie ein Silben- und Reimmodul entlang der bestehenden Content-Struktur; Meilenstein M1 nach Monat 2 (funktionsfähige adaptive Lernsteuerung). AP 2 (Monat 2–3, 200 h) „Eltern- und Pädagogen-Editor": Oberfläche zum Anlegen eigener Lektionen mit Bild-Upload und Audio-Einsprache, Export und Import von Lektionspaketen als JSON; Meilenstein M2 nach Monat 3 (Editor produktiv, Beispiel-Lektion exportiert). AP 3 (Monat 3–5, 220 h) „Barrierefreiheit": Tastaturbedienung und Screenreader-Kompatibilität aller Spielmodi, Kontrastoptimierung, vereinfachter Modus, Nutzung der vorhandenen automatischen Bildschirmskalierung für Sehschwäche; Meilenstein M3 nach Monat 5 (Prüfung nach WCAG 2.1 AA mit externem Feedback). AP 4 (Monat 4–6, 210 h) „Mehrsprachigkeit und Feldtest": Auslagerung aller Inhalte in Sprachpakete, Pilotpakete Türkisch und Ukrainisch, Feldtest in zwei Vorschuleinrichtungen mit kurzer didaktischer Evaluation; Meilenstein M4 nach Monat 6 (Version 1.0 mit Evaluationsoffentlichem Abschlussbericht). Jährlich begleitend: Dokumentation, Lizenz-Infrastruktur, Veröffentlichung des Repositories. Risikomanagement: die Kernarchitektur ist erprobt (live laufender Prototyp); größtes Risiko ist die zeitliche Verfügbarkeit von Kooperationspartnern für den Feldtest — ausgewichen werden kann auf eine familienbasierte Testkohorte.

### B3. Zusammenfassung Ergebnisverwertung — Zielgruppe und Erreichung?
*(~1.800 Zeichen)*

> Zielgruppen sind (1) Familien mit Kindern von vier bis sieben Jahren, insbesondere Haushalte mit geringem Bildungskapital und mehrsprachige Familien, (2) Kita-Fachkräfte, Vorschul-Förderkurse und Grundschulen der Eingangsphase, (3) Fachkräfte der Lese-Rechtschreib-Förderung. Die Erreichung erfolgt über fünf Wege: die sofort nutzbare Web-App unter leselernspiel.de (keine Installation, kein Konto, offline nutzbar), die Installation als App auf dem Homescreen über Web-Technologie, die Listung auf OER-Portalen und Bildungsservern der Länder, direkte Zusammenarbeit mit zwei Vorschuleinrichtungen im Feldtest (Arbeitspaket 4) als Referenz und Multiplikator, sowie die Veröffentlichung des Quellcodes mit umfassender Dokumentation, damit andere Initiativen die Engine für weitere Sprachen und Themen übernehmen. Die Nachhaltigkeit ist strukturell angelegt: als freie Software ohne Server-Zwischenstation entstehen nach Projektende keine Betriebskosten; Inhalte können von der Community erweitert werden; die Aufnahmefunktion macht die App in jeder Familiensprache nutzbar. Angestrebt wird die Aufnahme in die Empfehlungslisten von Trägern der frühen Bildung sowie die Übernahme der Materialien in offene Unterrichtssammlungen. Der Feldtest wird als offener Bericht veröffentlicht, um die didaktische Wirksamkeit transparent zu dokumentieren und die Verbreitung in der Fachcommunity zu unterstützen. Alle Ergebnisse stehen unter offenen Lizenzen und sind damit dauerhaft frei verfügbar, veränderbar und weiterverteilbar.

*(Zeichenlimits bei Portal-Eingabe verifizieren — die Texte sind auf ~1.800 Zeichen gehalten und lassen Raum für Portal-spezifische Kürzungen.)*

---

## C. Vorhabenbeschreibung mit Verwertungsplan (Anlage zum easy-online-Antrag, Mustergliederung 1:1)

**{SWS JG3: Alle Kinder lernen lesen (AKLL)}**

### 1.) Kurze Projektbeschreibung
„Alle Kinder lernen lesen" ist eine quelloffene Lese-Lern-App für Vorschulkinder und Leseanfänger. Vier Spielmodi trainieren die Vorläuferfähigkeiten des Leseerwerbs: Graphem-Phonem-Zuordnung (Laut hören → Buchstabe wählen), Wort-Bild-Zuordnung mit orthografischer Reihenfolge (Wort aus Buchstabenkacheln bauen), Phonemsegmentierung (Wörter aus Lautabschnitten zusammensetzen, inkl. Digraphen und Schwa) und gezieltes Wortlesen (Tiername in einer Szene finden). Ein phonemtreuer Audio-Kanon, 77 animierte Lernwörter und 26 animierte Buchstabenkarten bilden die Materialsammlung; eine Aufnahmefunktion erlaubt das Einsprechen eigener Aussprache (Familienstimmen). Der Prototyp ist fertig, live und wird täglich genutzt. Das Vorhaben führt ihn zur barrierefreien, mehrsprachigen Version 1.0.

### 2.) Problem / gesellschaftliche Herausforderung / Motivation
Ein Viertel der Viertklässler:innen in Deutschland verfehlt die Mindeststandards im Lesen (IGLU), mit starkem Gradienten nach sozialer Herkunft; das BMBF-Startchancen-Programm benennt genau diese Ungleichheit als politisches Kernproblem. Die frühe Phase des Buchstabeninteresses (4–6 Jahre) entscheidet über Leseanbahnung und LRS-Risiken. Der Markt für Lern-Apps ist jedoch strukturell ungerecht: Abo-Pflicht (5–10 €/Monat), Tracking von Kleinkindern, Werbung, intransparente Didaktik, und — am schlimmsten — der verbreitete „Buchstabennamen-Fehler" (Audio „Em-Ah-Te" statt „mmm-a-mmm-a"), der falsche Lesestrategien verfestigt. Motivation: frühe Leseförderung darf kein Kaufprodukt sein. Freie Software mit geprüfter Didaktik ist der Hebel für Bildungsgerechtigkeit.

### 3.) Lösung / technische Umsetzung / ähnliche Ansätze
Technisch: React/TypeScript-PWA (offline nutzbar, Service-Worker, keine Third-Party-Requests, keine Cookies/Konten/Analytik), Android via Web-Wrapper, Inhalte als versionierte JSON-Datenpakete getrennt von der Lernlogik (Sprachwechsel = Content-Paket, kein Fork). Phonemtreue Audio-Bibliothek mit dokumentierten Segmentierungsregeln (Vokal-/Konsonant-Digraphen als Einheiten, e-Schwa als eigener Laut), Aufnahme-Pipeline mit automatischer Lautheits-Normalisierung. Barrierefreiheit: bestehende automatische Bildschirmskalierung (Zoom-to-Fit 0,6–1,6) als Basis für Sehschwäche-Großdarstellung. Ähnliche Ansätze: proprietäre Abo-Apps (Lernspaß mit didaktischen Mängeln, Datenabfluss), Desktop-Lese-Software für Schulen (nicht mobil, nicht für Familien), einzelne offene Buchstaben-Apps ohne Audio-Didaktik. Unser Projekt unterscheidet sich durch die Kombination aus (a) verifizierter Lauttreue, (b) Offline-First mit Null Tracking, (c) Familienstimmen-Aufnahmen, (d) erweiterbaren Inhalts-Paketen und (e) einer reproduzierbaren Asset-Pipeline (generierte Illustration/Animation auf eigener Hardware, lizenzfrei).

### 4.) Risiken & Risikominderung
- **Risiko: Barrierefreiheit braucht Fachfeedback.** Minderung: frühzeitige Kontaktaufnahme mit Selbsthilfe-/Fachverbänden (Sehbehindertenverband), Prüfung mit automatisierten Tools plus manuellem Screenreader-Test; WCAG-Tokens strukturell im Designsystem verankert.
- **Risiko: Verfügbarkeit von Kitas für den Feldtest.** Minderung: parallele familienbasierte Testkohorte als Fallback; M4-Roadmap so geschnitten, dass der Editor (AP2) unabhängig davon Wert stiftet.
- **Risiko: Mehrsprachigkeit (nicht-lateinische Schriften).** Minderung: Content-Schicht ist bereits getrennt; Pilot zunächst Türkisch (lateinisch) und Ukrainisch (kyrillisch = früher Struktur-Test); Schrift-Rendering ist reine CSS-Aufgabe.
- **Risiko: Trägigkeit der Verbreitung.** Minderung: Live-Demo ab Tag 1, offene Lizenzen, Dokumentation; die App ist ohne Installation erlebbar.
- **Technisches Restrisiko:** vernachlässigbar, da Kernarchitektur im Live-Betrieb erprobt.

### 5.) Zielgruppe & Nutzen & Erreichung
(siehe B3 — Familien 4–7 Jahre v. a. mit geringem Bildungskapital und mehrsprachig; Kitas/Vorschule/Grundschule Eingangsphase; LRS-Förderung. Erreichung über leselernspiel.de, PWA-Installation, OER-Portale/Bildungsserver, Feldtest-Referenzen, offenes Repository.)

### 6.) Bisheriger Stand
Der vollständige Prototyp ist live (leselernspiel.de): vier Spielmodi, phonemtreue Audio-Bibliothek (md5-verifizierte Lauttreue), 77-Wörter-Kanon mit Illustrationen, 77 Wort-Animationen, 26 Buchstaben-Animationen, Tier-Szene mit Belohnungsclips, Aufnahme-Studio für Familienstimmen, Offline-Caching, automatische Bildschirmskalierung. Neu im Förderzeitraum: adaptive Lernsteuerung, echte Fortschrittsdaten (aktuell Demo-Anzeige), Minuskel-/Silben-/Reimmodule, Editor, Barrierefreiheit, Mehrsprachigkeit, Evaluation.

### 7.) Bisherige Software-Projekte
Entwicklung mehrerer selbst gehosteter Open-Source-Anwendungen (Web-/Mobile-Stack: React, TypeScript, Python/FastAPI, PWA-Muster, Service-Worker-Architekturen), Erfahrung mit Audio-/Sprachverarbeitung und generativen Medien-Pipelines, langjährige Praxis in der Web-Entwicklung mit Fokus Datenschutz und Selbsthosting. *(Hinweis: hier die konkreten Projekte/Repos von Johannes auflisten — GitHub-Profile/Links ergänzen!)*

### 8.) Arbeitspakete, Meilensteine, Stunden (6 Monate, 950 h)
*(Vollständige Tabelle siehe B2; Aufstellung für den Antrag:)*

| AP | Inhalt | Zeitraum | Stunden | Meilenstein |
|---|---|---|---|---|
| AP1 | Adaptive Lernstufen, Lernstandsdaten, Minuskeln, Silben/Reime | Monat 1–2 | 320 h | M1 (Monat 2): adaptive Lernsteuerung funktionsfähig |
| AP2 | Eltern-/Pädagogen-Editor, Lektions-Pakete (Import/Export) | Monat 2–3 | 200 h | M2 (Monat 3): Editor produktiv |
| AP3 | Barrierefreiheit WCAG 2.1 AA (Tastatur, Screenreader, Kontrast, Modus „einfach") | Monat 3–5 | 220 h | M3 (Monat 5): WCAG-Prüfung bestanden |
| AP4 | Mehrsprachigkeit (TR/UK), Feldtest 2 Einrichtungen, Evaluation, Release 1.0 | Monat 4–6 | 210 h | M4 (Monat 6): v1.0 + offener Bericht |
| — | Dokumentation, Lizenz-Infrastruktur, Repo-Veröffentlichung (laufend) | 1–6 | (enthalten) | — |
| **Summe** | | | **950 h** | = 47.500 € |

### 9.) Second-Stage-Förderung beantragen?
**Nein.** Nach sechs Monaten liegt mit v1.0 ein tragfähiges, community-fähiges Produkt vor; die Nachhaltigkeit ist strukturell über offene Lizenzen und fehlende Betriebskosten gesichert. *(Falls gewünscht, kann stattdessen „Ja" gewählt werden — dann sind die Fragen 10–12 auszufüllen; die inhaltliche Basis dafür wäre: Aufnahme in OER-Kataloge, Community-Aufbau, Support-Struktur.)*

---

## D. Vorkalkulation (fürs Portal / den Antrag)

- Arbeitsleistung Einzelperson: 950 h × 50,00 € = **47.500 €** (Förderquote 95 %)
- Eigenanteil 5 % = **2.375 €** (Eigenleistung, per Kontoauszug nachzuweisen — Saldo ≥ 2.375 €)
- Sachkosten: 0 € (Entwicklungsumgebung vorhanden)
- Hinweis: **Auszahlung quartalsweise nachschüssig** — die ersten Wochen sind vorzufinanzieren!

---

## E. Checkliste: Was Johannes noch besorgen/machen muss

- [ ] **Bewerbung bis 30.11.2026** auf bewerben.prototypefund.de (Texte aus Abschnitt A einfügen; Förderlinie „Resilienz")
- [ ] **Repository veröffentlichen** (AGPL-3.0 + CREDITS/LICENSE/README) und URL in A8 eintragen
- [ ] Abschnitt A10: eigene Projektliste/Links ergänzen
- [ ] **Steuernummer** für selbständige Tätigkeit (oder Anmeldebestätigung vom Finanzamt)
- [ ] Kontoauszug (positiver Saldo ≥ 2.375 €, nur Datum/Name/IBAN sichtbar)
- [ ] Falls während der Förderung angestellt: **Arbeitgeber-Genehmigung** für Nebentätigkeit (Zweizeiler)
- [ ] Für Phase 2 (nach Jury-Auswahl): Unterschriften-Formulare (Anhang F) handschriftlich!

---

## F. Anhang: Formular-Vordrucke für Phase 2 (easy-online) — offizieller Wortlaut zum Ausfüllen

*Quelle: wiki.prototypefund.de/Antragsstellung (Mustervorlagen). Nach Jury-Auswahl sind diese Erklärungen **handschriftlich zu unterschreiben**; digitale Signaturen werden nicht akzeptiert!*

### F1. Erklärung zum Eigenanteil (5 %)
> Erklärung der Antragsteller zum Eigenanteil
> Laut Bekanntmachung können zuwendungsfähige projektbezogene Personal- und Gemeinkosten für mein bzw. unser Projekt in einer Höhe von bis zu 95% anteilfinanziert werden, was einer maximalen Höhe der Fördermittel (Zuwendung) von 47.500 € entspricht. Der konkrete Zuwendungsbetrag ergibt sich aus der Vorkalkulation des Antrags. Die Auszahlung der Zuwendung erfolgt jeweils zu Beginn eines Kalenderquartals anteilig für die projektbezogenen Kosten, die im abgelaufenen Quartal entstanden sind. Aufgrund dieser nachschüssigen Auszahlung muss zunächst in Vorleistung gegangen werden.
> Hinsichtlich der von mir bzw. uns aufzubringenden Eigenmittel von mindestens 5% der Vorkalkulation wird eine vereinfachte Bonitätsprüfung vorgenommen. Dazu wird eine Bankauskunft über das im Projektantrag angegebene Konto vorgelegt. Den erforderlichen Eigenanteil kann ich bzw. können wir aufbringen über Eigenkapital.
> Hiermit wird bestätigt, dass ich bzw. wir während der gesamten Projektlaufzeit Eigenleistungen in Höhe von 5% in mein bzw. unser Projekt **Alle Kinder lernen lesen (AKLL)** einbringen werden.
> ____________  __________________
> Ort, Datum    Unterschrift

### F2. Erklärung zum Ausschluss der Privatinsolvenz
> Erklärung zum Ausschluss einer Privatinsolvenz
> Ich, {VORNAME NAME}, geboren am {DATUM} in {ORT}, erkläre hiermit eidesstattlich, dass ich mich nicht in einer Privatinsolvenz befinde.
> ____________  __________________
> Ort, Datum    Unterschrift

### F3. Einwilligung zur Akzeptanz der Entscheidung bei Second-Stage-Bewerbungen (Einzelantragsstellende)
> Ich, {VORNAME NAME}, erkläre hiermit, dass ich im Rahmen der Fördermaßnahme Software-Sprint der Juryentscheidung über die Second-Stage-Förderung meines Projektes **Alle Kinder lernen lesen (AKLL)** folgen werde und entsprechend einer Kürzung ggf. gesperrter Fördermittel (bei negativer Juryentscheidung) bzw. einer Laufzeitverlängerung um 4 Monate (bei positiver Juryentscheidung) explizit zustimme.
> ____________  __________________
> Ort, Datum    Unterschrift

### F4. Weitere Antrags-Unterlagen (Formulare liegen beim Projektträger / im easy-online-Portal)
- Antrag auf Gewährung einer **De-minimis-Beihilfe** (offizielles FORMULAR, wird im Portal mitgeliefert)
- **Vorhabenbeschreibung** = Abschnitt C dieses Dokuments
- **Steuernummer**-Nachweis / Kopie Finanzamt-Anmeldung
- Der formale Antrag wird via **easy-online** erstellt (Direktlink im Antragsportal des Projektträgers); Verifizierung per TAN-Verfahren oder handschriftlich+postalisch
