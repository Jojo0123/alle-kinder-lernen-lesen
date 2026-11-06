# Alle Kinder lernen Lesen

> Eine freie, werbefreie Lese-Lern-App für Kinder im Leselernprozess (1. Klasse / Vorschule).
> Lautgetreu, offline-fähig und ohne Accounts — mit animierten Buchstaben und echtem
> Fortschritts-Tracking für Eltern.

**Live:** [leselernspiel.de](https://leselernspiel.de) · [kinder.extensos.de](https://kinder.extensos.de)

---

## English summary

A free and open-source German reading-learning PWA for first graders. The core idea is a
**phoneme-fidelity-first** approach: children learn letter–sound relations with real,
lautgetreue (sound-faithful) audio instead of letter names ("ef" vs. /f/). Includes a
letter game with 26 animated letter videos, syllable/sound-segmentation exercises, a
recording studio for self-pronunciation, and a parent dashboard with real progress data.
Runs fully client-side (offline via service worker), no accounts, no ads, no tracking.
Built with React 19 + Vite + TypeScript, packaged for Android via Capacitor.

The project applies for funding via the **Prototype Fund** (BMBF/BMFTR) and **NLnet**;
the planned work (privacy hardening, i18n content packs, asset factory) is described in
the applications.

---

## Funktionen

- **Lautgetreue Phonem-Bibliothek** — Laute und Wörter als echte Sprachaufnahmen, keine Buchstabennamen
- **LetterGame** — Buchstaben zuordnen; bei Erfolg läuft eine von **26 animierten Buchstaben-Videos** (A wie Affe … Z wie Zebra)
- **TierSpiel** — Tiere den passenden Anlauten zuordnen
- **Lautabschnitte** — Wörter in Laute/Silben zerlegen (Hören, tippen, sprechen)
- **RecordingStudio** — Kinder sprechen Laute/Wörter selbst ein und hören sich ab
- **ParentDashboard** — echte Lernfortschritte (Wörter, Laute, Übungszeit), PIN-geschützt
- **Offline-PWA** — Service Worker mit Precache, funktioniert ohne Netz
- **Android-App** — über Capacitor (`android/`)

## Technik

- React 19, Vite 6, TypeScript
- PWA (Service Worker, Precache inkl. aller 26 Video-Clips)
- Capacitor für Android
- Komplett client-seitig — kein Backend, keine API-Schlüssel nötig

## Starten

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Produktions-Build nach dist/
```

Android (nach einem Build die Web-Assets synchronisieren):

```bash
npm run build && npx cap sync android
```

## Struktur

- `components/` — die einzelnen Screens (LetterGame, TierSpiel, Lautabschnitte, …)
- `data/` — Wörter, Laute und Audio-Material pro Lernpaket
- `public/` — Buchstaben-Animationen und weitere Assets
- `animationen/` — Quell-Vorlagen der Buchstaben-Animationen
- `docs/` — Strategiepapier Fördermittel

## KI-Transparenz

Der Code entstand mit KI-Unterstützung (u. a. Google AI Studio) unter menschlicher
Leitung. Teile der Medien-Assets (26 Buchstaben-Animationen) sind KI-generiert — Details
und Herkunft in [CREDITS.md](CREDITS.md). Diese Deklaration entspricht den
Transparenz-Anforderungen der NLnet Foundation.

## Roadmap (Auszug)

1. **Privacy Hardening** — externe CDN-Ressourcen (Tailwind, Google Fonts, aistudiocdn) entfernen
2. „Über dieses Projekt"-Modal (Offenlegung KI & Förderantrag)
3. Echte Fortschrittsdaten im Parent-Dashboard (Mock-Daten ersetzen)
4. i18n-Content-Packs (Pilot: Türkisch, Ukrainisch)
5. Asset-Factory für weitere Lernpakete

## Lizenz

[AGPL-3.0](LICENSE) — Code und Inhalte. Asset-Herkunft siehe [CREDITS.md](CREDITS.md).