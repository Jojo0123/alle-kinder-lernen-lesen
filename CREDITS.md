# CREDITS — Herkunft der Assets

## Sprachaufnahmen (Laute, Wörter)

Eigene Aufnahmen des Projektteams (`Laute/`, `data/<id>/*.mp3`). Die Laute sind
lautgetreu (Phoneme, keine Buchstabennamen) — das Kern-Merkmal der App.

## Buchstaben-Animationen (26 Stück, `public/`)

KI-generierte Kurzvideos (Image-to-Video, MiniMax H3 via ComfyUI, lokal gerendert) aus
eigenen Vorlagen (`animationen/`). Je Buchstabe ein Tier-Motiv (A wie Affe … Z wie Zebra).
Die Animationen sind stumm — die Aussprache kommt aus den Sprachaufnahmen.

## Grafiken & Illustrationen

Eigene Gestaltung des Projektteams.

## Code

Entstand mit KI-Unterstützung (u. a. Google AI Studio, Hermes Agent) unter menschlicher
Leitung und inhaltlichen Vorgaben des Projektteams.

## Dritt-Bibliotheken

- React (MIT), React DOM (MIT)
- Vite (MIT), @vitejs/plugin-react (MIT)
- TypeScript (Apache-2.0)
- Capacitor (MIT)

## Hinweis zu externen Ressourcen

Die aktuelle Version lädt noch Ressourcen von externen CDNs (Tailwind, Google Fonts,
aistudiocdn). Deren Entfernung ist Teil von Meilenstein 1 (Privacy Hardening).