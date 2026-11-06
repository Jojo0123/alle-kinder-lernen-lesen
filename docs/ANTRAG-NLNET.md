# Application Draft: NLnet Foundation — „Early-Literacy Engine"
## Ready-to-paste answers, field by field (form: nlnet.nl/propose)

**Next deadline: January 3rd 2027, 12:00 CET · First grant: €5,000–€50,000 · Milestone-based**

*Every block below maps to one form field. Character limits of the form are noted per field — the drafts are written under the limits. Update the repository URL before submitting!*

---

## 0. Pre-flight

| Field | Value |
|---|---|
| Which fund? | **NGI Zero Commons Fund** (open infrastructure for the public good, privacy, digital commons) — alternative: NGI Zero Core if Commons is out of scope |
| Amount requested | **€45,000** (5 milestones, see M-section) |
| Licence | Code: AGPL-3.0 · Content/assets: CC BY-SA 4.0 · open formats (JSON, MP3/H.264) |
| Human-made proposal? | NLnet requires disclosure of generative-AI use in proposal writing and in the codebase — see section 11 (mandatory, honesty policy). |

---

## 1. Project title
**Early-Literacy Engine — a privacy-by-design, offline-first open-source toolkit for child language acquisition**

## 2. Project website(s) / repositories
- Live demo: `https://leselernspiel.de`
- Repository: *TO BE INSERTED — public repo with AGPL-3.0, issue tracker, docs (must be public before submission)*

## 3. Summary — "Please summarise the proposed project and its expected results in a few lines." (max. 1,000 characters)

Draft (~950 characters):

> We build reusable open-source infrastructure for early literacy: a modular, offline-first PWA engine that teaches children (4–7) to read via phoneme-faithful grapheme-phoneme mapping, phonemic segmentation and word reading — with zero tracking, no accounts and no third-party requests. A working prototype is live today (leselernspiel.de) with four game modes, a verified phoneme audio library and 100+ generated open-licensed learning assets. This project turns the prototype into a documented, accessible (WCAG 2.1 AA), multilingual engine: content packs instead of forks (German, Turkish, Ukrainian pilots), an educator/parent editor for custom lessons, and a reproducible OER asset pipeline. Expected results: an AGPL engine + CC BY-SA content that any school, family or NGO can run, adapt and trust — infrastructure for digital commons in a market captured by subscription apps that track children.

## 4. Proposed effort — "How much money do you request?" (between €5,000 and €50,000)

**€45,000** — broken down over 5 milestones (below).

## 5. "Please provide a breakdown clarifying how the requested budget would be used. Which tasks will you undertake, and (roughly) how much time/effort will each take? Will there be any expenses?" (max. 4,000 characters)

Draft (~3,600 characters):

> **Total: €45,000** — development effort (~900 hours at €50/h blended rate); no material expenses (hardware and build infrastructure already in place).
>
> **M1 — Privacy hardening & supply-chain cleanup (€8,000, ~160 h).** Remove all third-party requests from the production app: compile Tailwind at build time, self-host fonts/icons, remove dead CDN import maps. Add a strict Content-Security-Policy, document a threat model and privacy statement, produce reproducible builds (lockfile + CI build attestation). Delivered as tagged commits with a before/after network-traffic audit.
>
> **M2 — Content engine & schema (€9,000, ~180 h).** Formalise the content layer: JSON schemas for lessons, phonemes, syllables and rhyme units; a validation CLI; import/export of language packs; written format documentation plus an example pack. This is the piece that makes the engine reusable beyond German: a language becomes a data package, not a fork. Includes lower-case letter units and syllable/rhyme exercise types.
>
> **M3 — Offline-first v2 & release engineering (€9,000, ~180 h).** Robust service-worker lifecycle: atomic content-pack updates, storage quota handling, update UX for installed PWAs, deterministic SW releases, network-failure test suite in CI. Target: the full app works on low-end Android devices with no connectivity after first load — an equity requirement for the families early literacy must reach.
>
> **M4 — Accessibility & i18n toolkit (€9,000, ~180 h).** Keyboard navigation and ARIA semantics for all game modes, screen-reader smoke tests, contrast remediation, a simplified cognitive-accessibility mode, RTL groundwork and an abstracted phoneme-layer interface for non-Latin scripts (Cyrillic pilot). Includes automated accessibility tests in CI.
>
> **M5 — Open asset pipeline („OER asset factory") (€10,000, ~200 h).** Document and package the reproducible pipeline that generates the app's illustrations and animations with locally hosted generative models: re-runnable scripts, licensing manifest with checksums, CI job proving asset regeneration, contribution guide. This solves the OER media-licensing bottleneck (no stock-media ambiguity) and is directly reusable by other educational projects.
>
> All deliverables are released under free licences (AGPL-3.0 code, CC BY-SA 4.0 content) with per-milestone tags for straightforward milestone accounting.

## 6. "Please compare your own project with other relevant efforts (both existing and historical). What is new, more thorough or otherwise different? Have you considered contributing to any of the others?" (max. 4,000 characters)

Draft (~3,500 characters):

> **Commercial early-literacy apps (Antolin-class reading apps, subscription phonics apps).** Dominant in the market, but structurally opposed to the commons: subscriptions (€5–10/month), advertising and analytics SDKs, engagement gamification instead of learning progress, opaque didactics. A recurring technical failure across them is playing letter NAMES ("em-a-te") instead of phonemes ("mmm-a-mmm-a"), which cements the wrong decoding strategy. Our engine's phoneme layer is verified phoneme-faithful (byte-identical phoneme assets across exercise types, digraph and schwa handling per the German primary-school canon) — and auditable, because everything is open.
>
> **School-oriented open reading software (German: "Lesen lernen" desktop programs, Montessori material digitisations).** These serve classrooms on desktop, usually single-language, rarely mobile, with no offline PWA story and no parent-facing audio tooling. We share the didactic ground (phonemic awareness as the strongest predictor of reading acquisition) but target the home/kita context on low-end mobile devices.
>
> **Open educational content repositories (OER Commons, ZUM-Unterrichten, Lehraufträge-style material collections).** They host static materials; nobody provides a maintained, accessible ENGINE with adaptive exercise logic, audio and accessibility baked in. We contribute infrastructure rather than another content silo: our content packs are importable/exportable JSON under CC BY-SA, designed to flow INTO such repositories.
>
> **Adjacent open-source efforts we considered contributing to instead:** GCompris (excellent activity suite in Qt, but a monolithic activity model without a phoneme-aware content layer or web/offline-PWA parity for low-end devices), and Moodle-style LMS ecosystems (learner-management orientation, heavy servers, not designed for pre-literate children). Rather than forking either, our engine is structured as a standalone web component set with an explicit content-schema, so exercises can later be embedded in GCompris or LMS front-ends — we will pursue this interoperability in M2 (schema) and M5 (contribution guide). We deliberately avoid duplicating their frameworks and instead contribute the missing layer: a phoneme-faithful, privacy-first early-literacy engine with machine-readable content packs.

## 7. "What technical challenges do you expect during the project?" (max. 4,000 characters)

Draft (~3,300 characters):

> **1. Phoneme layer generalisation.** The German phoneme library is tightly coupled to German orthography (digraphs, schwa). M2/M4 abstract this into a per-language phoneme interface; the challenge is doing so WITHOUT forcing every language into a Latin-grapheme assumption — Cyrillic pilots will validate the abstraction early. Mitigation: schema-first design with two real language packs as acceptance tests.
>
> **2. Offline storage constraints.** The asset set (audio + short video clips) is ~50 MB; browsers impose per-origin storage quotas, and low-end devices throttle IndexedDB. M3 tackles atomic content updates with quota-awareness and graceful asset degradation (static-image fallbacks are already implemented for every animation).
>
> **3. Accessibility for a pre-literate audience.** WCAG assumes literate users; our users cannot read UI labels. The accessibility work (M4) must therefore combine screen-reader semantics for adults/assistive tech with icon/audio-driven UI for children — a documented tension we will resolve with a dual-mode interface and test with a specialist feedback loop.
>
> **4. Speech/audio quality and offline speech.** The app currently uses pre-rendered phoneme audio (parent-recorded voices as a feature) plus browser TTS for feedback phrases. Keeping zero third-party requests while supporting more languages means shipping audio packs per language; optional local on-device speech for validation is technically feasible (small ASR models) but constrained on low-end hardware — treated as stretch goal, not core.
>
> **5. Reproducible generative asset pipeline.** The asset factory (M5) uses locally hosted generative models; model/version drift can change outputs. We address this by pinning model versions, recording prompts and seeds, and checksum-verifying outputs in CI — the pipeline is treated as build infrastructure, deterministic and re-runnable.
>
> **6. Sustaining accessibility across future changes.** Automated a11y tests plus manual screen-reader passes must become part of the CI contract (M4) so later contributions cannot silently regress.

## 8. "What is the ecosystem around your own project, and how will you engage relevant actors? Who would be the main users?" (max. 2,000 characters)

Draft (~1,800 characters):

> **Users:** families with children aged 4–7 (especially low-income and multilingual households), kita staff, preschool literacy courses, primary schools in the entry phase, and dyslexia-support practitioners. The live prototype already serves real family use.
>
> **Engagement:** (1) A field test with two preschool institutions during the grant (M4/M5) produces an open evaluation report — evidence-based adoption for educators. (2) OER portals and state education servers receive the content packs (CC BY-SA) — we will approach ZUM/State Education servers for listing. (3) The parent/educator editor (M2) turns users into contributors: a kita can author its own lesson packs. (4) We engage accessibility organisations (e.g. German blind/low-vision associations) for M4 review, and dyslexia associations for didactic validation. (5) The engine is deliberately embeddable — we will open an interoperability conversation with GCompris and OER platform maintainers (schema-first, see comparison answer).
>
> **Dependencies:** the web platform itself (no hard server dependency — a deliberate equity choice), browser TTS for optional feedback, and the pinned open generative models used by the asset pipeline. The project depends on no proprietary cloud service; documentation and maintainer time are the sustaining resources. The applying developer maintains the existing prototype and will maintain the engine; the AGPL + content-pack model lowers the contribution barrier for educators (JSON, not code) and for developers (documented schema, CI-tested).

## 9. Background — "What makes you the right person(s) for this effort?" (max. 2,000 characters)

Draft (~1,500 characters):

> The applicant is a professional software developer and company owner with a decade of experience building self-hosted, privacy-focused web applications (React/TypeScript PWA architectures, service workers, offline-first patterns, Python/FastAPI backends, audio pipelines). The early-literacy engine is not a mock-up: the applicant designed and shipped the working prototype end-to-end — including a verified phoneme audio architecture, a parent voice-recording pipeline with loudness normalisation, an offline caching layer and an automated viewport/accessibility QA harness. This combination of production engineering and hands-on iteration with the target group (the app is used daily by the family it was built for; every design decision was tested against real 4–7-year-olds) is the qualification for this effort. Practical experience with open-source delivery: multiple maintained self-hosted projects, documented workflows, CI usage, and a habit of shipping reproducible pipelines (including locally hosted generative media tooling). References and repository links available on request. *(Hinweis Johannes: hier ggf. konkrete Projekte/GitHub-Links ergänzen.)*

## 10. "Does (or did) the project have other funding sources?" (max. 1,000 characters)

Draft (~400 characters):

> No external funding to date. The prototype was self-funded (development time and hardware provided by the applicant). A parallel application to the German Prototype Fund (BMFTR "Software Sprint", €47.500) targets the German-language product track (educator editor, field test); this NLnet application targets the ENGINE layer (privacy, content schema, offline infrastructure, accessibility toolkit, asset pipeline). If both were awarded, work packages are non-overlapping and accounting kept strictly separate. If only one is awarded, the other work packages are deferred — no double funding for the same effort.

## 11. Generative AI disclosures (MANDATORY — NLnet policy)

**"Yes, I have used generative AI in writing this proposal"** — checkbox YES, and paste this text (max. 8,000 chars):

> Generative AI (a locally operated assistant) was used as a drafting and editing aid for this proposal: structuring sections, editing for clarity, and checking character limits. All technical claims describe work actually performed and verified by the applicant; the final text was reviewed and approved by the applicant, who takes full responsibility for it. The underlying facts (architecture, milestones, measured results) come from the applicant's own project documentation. AI was not used to invent claims, citations or comparisons; the comparison section is based on the applicant's own market/tech assessment.

**"Yes, the codebase contains AI-generated code"** — checkbox YES if the published repo contains AI-assisted code (it does — be honest), and paste (max. 1,000 chars):

> Parts of the application code and the asset pipeline scripts were written with AI assistance and are human-reviewed, tested and maintained by the applicant. The learning CONTENT (words, phoneme structure, pedagogical sequencing) and all design/UX decisions are human-made and domain-driven. Illustrations and animations in the content packs are generated by locally hosted generative models (documented, reproducible pipeline, M5) and released under CC BY-SA with a licensing manifest.

*(Hinweis Johannes: Diese Angaben sind Pflicht — NLnet lehnt Anträge ohne/ mit falscher AI-Deklaration ab. Ehrlich bleiben: die obigen Texte sind genau dafür geschrieben.)*

## 12. Contact information
- Your name (or pseudonym): *{Johannes Stetten — oder gewünschter Pseudonym-Name}*
- Email: *{Kontakt-Email}*
- Phone (with country code): *{+49 …}*
- OpenPGP key (optional): *falls vorhanden einfügen*

---

## Milestone summary (for the effort question / annex)

| # | Milestone | Amount | Outcome |
|---|---|---|---|
| M1 | Privacy hardening & supply chain | €8,000 | Zero third-party requests, CSP, threat model, reproducible builds |
| M2 | Content engine & schema | €9,000 | JSON schemas + validation CLI + language-pack format (TR/UK pilots) |
| M3 | Offline-first v2 | €9,000 | Atomic content updates, quota handling, SW release pipeline, CI failure tests |
| M4 | Accessibility & i18n toolkit | €9,000 | WCAG 2.1 AA gameplay, screen-reader support, RTL groundwork, non-Latin phoneme layer |
| M5 | Open asset pipeline | €10,000 | Reproducible OER asset factory, licensing manifest, CI regeneration |
| | **Total** | **€45,000** | Engine v1.0 as free infrastructure |

Each milestone ends in a tagged Git release with documented diff and test scope — straightforward milestone accounting, exactly as NLnet requests.

## Timeline note
Roughly one milestone per 5–6 weeks across ~7 months (part-time capacity), with M1 first (fastest trust win) and M5 last (documentation-heavy). Milestones are independently valuable — a reduced grant can drop M5 (defer asset factory docs) while keeping M1–M4 intact.