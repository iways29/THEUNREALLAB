# Handoff: The Unreal Lab — venture studio site

## Overview
Full redesign of theunreallab.com. The Unreal Lab is repositioning from an AI product lab to a **venture studio**: it builds its own AI products, advises companies on enterprise AI, is building vendor partnerships for enterprise deployment, and backs founders at the earliest stage with architecture, people, introductions, launch help and hours (a small agreed stake, capital later). Long-term: a venture fund with LPs; the site also solicits first LPs.

The story is told through the Mahabharata (Krishna guiding Arjuna at Kurukshetra — the studio as the charioteer, founders as Arjuna) and Chhatrapati Shivaji Maharaj (Swarajya built one fort at a time — the studio → portfolio → fund path). Bright neoclassical oil-painting imagery, drifting white clouds, gold light.

Primary conversion: **email** (`ishanpanchaal@theunreallab.com`). Two audiences: founders (apply) and LPs / companies / partners (start a conversation).

## About the Design Files
`The Unreal Lab v3.dc.html` is a **design reference built in HTML** — a working prototype showing intended look and behaviour. Do not ship it. Recreate it in the existing codebase (`iways29/THEUNREALLAB`, Next.js 16 App Router, React 19, Tailwind v4, TypeScript, Vercel) using its patterns. Replace the current `app/page.tsx` sections and `components/*` with the screens below; keep `app/layout.tsx` metadata structure, update fonts and copy.

Open the prototype by serving the folder (`npx serve .`) and opening `The Unreal Lab v3.dc.html` — it needs `support.js` next to it. `Current Site (Recreation).dc.html` is a faithful copy of the live site for before/after only.

## Fidelity
**High-fidelity.** Colours, type, spacing, copy and motion are final. Recreate pixel-perfectly. The one intended upgrade over the prototype is the **frame-scrub engine** (see "Phase 2") which the prototype approximates with autoplaying video.

## Global shell

**Stage (background)** — `position:fixed; inset:0; z-index:0; background:#100c08`. Six scene layers, each `position:absolute; inset:0` containing a full-bleed `<video muted loop playsinline preload="none" poster>` with `object-fit:cover`. A film-grain overlay on top: inline SVG `feTurbulence` noise, `opacity:.5; mix-blend-mode:multiply` (see prototype for the data-URI).

**Content column** — `position:relative; z-index:1`; each section `min-height:100vh`, inner container `max-width:1500px; margin:0 auto; padding: clamp(120px,16vh,180px) clamp(20px,5vw,72px); box-sizing:border-box`. Hero uses `padding-top: clamp(100px,16vh,140px)`.

**Nav** — fixed, `padding:20px clamp(20px,4vw,56px)`, `background:linear-gradient(to bottom, rgba(16,12,8,.55), transparent)`. Left: 11px gold diamond (`background:#e6c76a; transform:rotate(45deg)`) + "THE UNREAL LAB" 12px / .24em / uppercase / 500. Right: links in Libre Caslon Display italic 16px, opacity .85 → 1 on hover: The Promise `#promise`, The Practice `#practice`, The Room `#room`, The Fund `#fund`; CTA "Apply →" 11px / .2em uppercase, `border:1px solid rgba(244,239,228,.6); padding:10px 18px`, hover fills `#f4efe4` with ink text. Mobile (<768): collapse links to a hamburger; keep mark + Apply.

**Progress line** — fixed top, `height:2px; background:#e6c76a`, width = scrollY / (scrollHeight − innerHeight).

**Cursor** (pointer:fine only) — hide native (`cursor:none` on body). 6px gold dot (`#e6c76a`) follows pointer exactly; 34px ring `border:1px solid rgba(244,239,228,.75)` lerps toward pointer at 0.14/frame; over `a, button` ring grows to 64px and fills `rgba(230,199,106,.18)`, 250ms transitions.

## Screens / sections (one scene each, in scroll order)

Scrim gradients are laid over the stage per section so text reads on bright paintings. All body text `#eadfc4`, headings `#f4efe4`, gold `#e6c76a`.

### 0 · Hero — `#top` — scene: chariot at dawn
- Layout: content bottom-aligned; two-column grid `repeat(auto-fit, minmax(min(100%,420px),1fr))`, gap `clamp(28px,4vw,64px)`, `align-items:end`. Scrim: `linear-gradient(to top, rgba(16,12,8,.94) 0%, rgba(16,12,8,.6) 40%, transparent 70%)`.
- Eyebrow: 44×1px gold rule + "THE UNREAL LAB · VENTURE STUDIO" 11px / .26em / uppercase, colour `#eadfc4`.
- H1: Libre Caslon Display italic, `clamp(42px,7.4vw,124px)`, line-height .96, letter-spacing −.02em, max-width 12ch: **"Every Arjuna needs a Krishna."** — "Krishna." in `#e6c76a`. Word-by-word reveal (see Motion).
- Sub (max 50ch, `clamp(14px,1.2vw,17px)`, lh 1.7): "We build AI products of our own. We advise companies on AI that has to actually work. And we ride beside founders who are too early for everyone else, from nothing to the field. Not a fund yet. A charioteer first."
- CTA: "ENTER THE FIELD →" `background:#f4efe4; color:#100c08; 12px / .2em uppercase; padding:20px 30px`, hover `translateY(-3px)`. Beside it "SCROLL" 10px + 52×1px pulsing line (`pulseLine` 2.6s).
- Verse card (right column, `max-width:420px; padding:28px 30px; border:1px solid rgba(244,239,228,.22); background:rgba(16,12,8,.38); backdrop-filter:blur(10px)`):
  - Devanagari (Tiro Devanagari Sanskrit, `clamp(18px,1.5vw,22px)`, lh 1.7): यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः । / तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम ॥
  - Translation (Caslon italic 16px): "Where Krishna and Arjuna stand together, there follow fortune, victory, prosperity and firm resolve."
  - Source (10px / .22em gold): "BHAGAVAD GITA · 18.78"

### 1 · The promise — `#promise` — scene: Krishna counsels Arjuna
- Left-aligned block max 760px. Scrim: `to right, rgba(16,12,8,.88) 0%, .55 50%, .05 100%`.
- Label "I · THE PROMISE" 10px / .26em gold. H2 Caslon italic `clamp(34px,5.4vw,86px)`, lh 1, max 14ch: **"You already hold the bow. You are only doubting your right to draw it."**
- Body 16px lh 1.8, max 52ch: "Arjuna did not lack skill on the morning of Kurukshetra. He lacked someone beside him who had seen the whole field. That is the seat we take." / "Founders who come through here stop trading depth for speed, stop waiting for permission, and become the people other founders call first. Not because they raised. Because what they built worked, and the right people saw who built it."
- Verse block (`border-left:1px solid #e6c76a; padding-left:22px`): क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते । — "Do not yield to weakness, Partha. It does not become you." — BHAGAVAD GITA · 2.3

### 2 · The practice — `#practice` — scene: Arjuna draws the bow
- Right-aligned block max 820px (flex `justify-content:flex-end`). Scrim mirrored (`to left`).
- Label "II · THE PRACTICE". H2 max 14ch: **"Four ways we draw the bow."**
- 2×2 card grid: `grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)); gap:1px; background:rgba(244,239,228,.18)`; cards `background:rgba(16,12,8,.55); backdrop-filter:blur(8px); padding:clamp(24px,2.6vw,36px)`. Each: Caslon italic gold number `clamp(34px,3vw,48px)`; label 11px / .2em uppercase; body 14px lh 1.75.
  - 01 WE BUILD — "Our own AI products, shipped and live. Mumba.ai, a tree-based conversation interface. ASHVAA, open-source codebase intelligence. The next one is unnamed." (Mumba.ai → https://mumba.ai, ASHVAA → https://github.com/iways29/ASHVAA, underlined, offset 3px)
  - 02 WE ADVISE — "Enterprise AI that is not allowed to misbehave: governance, evaluation, agent platforms. Hands-on experience from inside a Fortune 500 build, brought to companies that need it to work."
  - 03 WE PARTNER — "We are building relationships with product companies now, with an eye toward deploying the right ones inside the enterprises our partners serve. The architects in the room when it has to ship."
  - 04 WE BACK — "Founders at the very beginning, before there is a deck or a company. Architecture, people, introductions, launch, hours. A small agreed stake. Capital as the portfolio earns it."
- Verse: कर्मण्येवाधिकारस्ते मा फलेषु कदाचन । — "Your right is to the work alone, never to its fruits." — BHAGAVAD GITA · 2.47

> Copy note: "We partner" is deliberately forward-looking (relationships in progress). Do not rewrite it as an existing deployment pipeline or name any employer.

### 3 · The room — `#room` — scene: royal assembly
- Two columns `minmax(min(100%,320px),1fr)`, gap `clamp(28px,5vw,96px)`, `align-items:end`. Scrim `to top .92 → .5 → .1`.
- Label "III · THE ROOM". H2 max 12ch: **"We put you in rooms you would have waited years to enter."**
- Right: intro "Krishna's strength at Kurukshetra was never the weapon. It was the alliances gathered long before the first arrow. Access is the advantage no term sheet lists, so we make it the first thing we give." then a 4-row list, rows `padding:18px 0; border-bottom:1px solid rgba(244,239,228,.25)`, left Caslon italic `clamp(18px,1.6vw,24px)`, right 11px / .18em uppercase:
  - Enterprise buyers — WHO DECIDE IF YOU ARE REAL
  - Operators and engineers — WHO HAVE SHIPPED BEFORE
  - Launch — YOUR FIRST HUNDRED USERS, ON PURPOSE
  - Capital — ANGELS AND FUNDS, WHEN YOU ARE READY

### 4 · The fund — `#fund` — scene: Raigad fort above clouds
- Left block max 800px. Scrim `to right`.
- Label "IV · THE FUND". H2 max 13ch: **"Swarajya was not declared. It was built, one fort at a time."**
- Body: "Shivaji Maharaj did not begin with an empire. He began with a hill, a few loyal people, and the discipline to hold each fort before reaching for the next. Speed where the incumbents were slow. Strongholds where they had none. Loyalty to the people he served above all." / "That is our path. Today, a studio that builds and backs a handful of founders with hours instead of cheques. Next, a portfolio that speaks for itself. Then, a venture fund with limited partners who want to be early to the founders no one else has met yet. We are looking for our first LPs now."
- 3 stage cards (same card style, `padding:22px 24px`): NOW / Studio / "Build, advise, back with hours." · NEXT / Portfolio / "Founders who took off from nothing." · THEN / Fund / "Limited partners, first cheques, same seat."
- Verse: प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता । / शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ॥ — "Like the new moon, this seal of Shivaji, son of Shahaji, grows and is honoured by the world. It shines for the welfare of all." — RAJMUDRA OF CHHATRAPATI SHIVAJI MAHARAJ

### 5 · The conch — `#apply` — scene: Krishna sounds Panchajanya
- Bottom-aligned column; `padding-top: clamp(140px,18vh,220px)`. Scrim `to top .96 → .6 → .05`.
- Label "V · THE CONCH". H2 `clamp(38px,6.4vw,104px)` lh .98, max 12ch: **"Sound the conch. Tell us what you are building."**
- Two CTA cards (grid, 1px gap, `background:rgba(16,12,8,.6)`, hover `rgba(244,239,228,.1)`), whole card is a `mailto:` link:
  - FOUNDERS · "Apply for a seat in the chariot" · "One email. No deck required. Tell us what you are making and what is in your way. Every application is read; when the model fits we answer within a week." · "SEND THE APPLICATION →" · `mailto:ishanpanchaal@theunreallab.com?subject=Founder application — The Unreal Lab`
  - LPS, COMPANIES AND PARTNERS · "Be early with us" · "If you want to back founders before anyone else has met them, need enterprise AI that actually works, or have a product that belongs inside the enterprise, start a conversation." · "START THE CONVERSATION →" · `?subject=LP / partner conversation — The Unreal Lab`
- Footer inside the section: top border `rgba(244,239,228,.2)`; mark + THE UNREAL LAB; Caslon italic 18px "We make the unreal real."; links Mumba.ai / ASHVAA / email (11px / .18em uppercase, `#eadfc4` → `#f4efe4`); "© {year} The Unreal Lab".

## Motion (prototype behaviour — Phase 1)
- **Scene mix**: every frame, for each section compute `cover` = fraction of viewport it occupies. Layer opacity = eased(cover); the section nearest viewport centre is forced to opacity 1 so the stage is never dark. Layer scale = `1 + 0.22 * t` where `t` = section progress for even scenes and `1 − progress` for odd (alternating zoom-in / zoom-out). Videos play when opacity > .02, pause otherwise.
- **Floating panels**: every `[data-reveal]` block gets `translateY(−c·48px + sin(time/2600 + i·1.7)·6px)` where `c` is its centre offset from viewport centre in viewport units — scroll parallax plus a slow idle drift.
- **Reveal**: blocks start `opacity:0; translateY(34px)`, IntersectionObserver (threshold .1, rootMargin −6% bottom) → `opacity 1s ease`.
- **Hero intro**: words `opacity 0 → 1, translateY(30px → 0)`, 1s, `cubic-bezier(.16,.84,.3,1)`, stagger 90ms from 300ms; eyebrow 200ms; sub 900ms; CTA 1200ms.
- **Buttons**: `translateY(-3px)` 350ms on hover. Section links: smooth scroll.
- **Reduced motion**: honour `prefers-reduced-motion` — static posters, no parallax/drift.

## Phase 2 — frame-scrub engine (the intended final behaviour)
Replace videos with scroll-scrubbed image sequences so the camera moves exactly as far as the user scrolls, forward and backward.
- Assets: `frames/0N-<scene>/0001.jpg … 0120.jpg` (1920×1080, JPG q80) exported from the six clips at 15 fps; optional `frames-sm/` 960×540 for mobile. Source clips are listed under Assets.
- One full-screen `<canvas>`; section progress `p ∈ [0,1]` → frame `round(p·119)`. Draw with cover-fit; keep the alternating scale mapping.
- Handoffs: cross-dissolve the last/first 10% of adjacent sections between the two frames.
- Preload: first frame of every scene immediately; then current + next two scenes; decode via `createImageBitmap`. Render in `requestAnimationFrame`, only when scroll or size changed.
- Sections should be ~2 viewport-heights tall (tunable) to give each scene enough scroll travel.
- Verses can be keyed to frame ranges (e.g. Gita 2.3 fades in when Arjuna lifts his head).
- Mobile fallback: autoplay video (Phase 1 behaviour) or `frames-sm/`.

## Design tokens
- Ink / page: `#100c08` · Paper text: `#f4efe4` · Body text: `#eadfc4` · Gold: `#e6c76a`
- Rules / borders: `rgba(244,239,228,.18 / .2 / .22 / .25 / .6)` · Panels: `rgba(16,12,8,.38 / .55 / .6)` + `backdrop-filter: blur(8–10px)`
- Type: **Libre Caslon Display** (italic, headings/nav) · **Archivo** 300–600 (UI/body) · **Tiro Devanagari Sanskrit** (verses). All Google Fonts.
- Type scale: H1 `clamp(42px,7.4vw,124px)`; H2 `clamp(34px,5.4vw,86px)` (practice/fund `clamp(34px,5vw,80px)`, conch `clamp(38px,6.4vw,104px)`); body 16/1.8; card body 14/1.75; labels 10–11px, letter-spacing .18–.26em, uppercase.
- Spacing: section padding `clamp(120px,16vh,180px)` vertical, `clamp(20px,5vw,72px)` horizontal; grid gaps `clamp(28px,4–5vw,64–96px)`; card padding `clamp(24px,2.6vw,36px)`.
- Radius: 0 everywhere. Shadows: none (light comes from scrims).
- Easing: `cubic-bezier(.16,.84,.3,1)`; durations 1–1.4s for reveals/mixes, 250–350ms for hover.

## Assets (all generated in Higgsfield for this project; download and self-host under `/public/scenes/`)
Posters (PNG) and clips (MP4, 8s, 16:9, muted loop):
- 0 chariot: `…/hf_20260912_235512_6bcaf24c-8919-40a2-b271-22386d5c4eee.png` · `…/hf_20260912_235605_4a534740-e6b5-46ea-921b-b71f458e64f7.mp4`
- 1 counsel: `…235512_6fb87105-f80a-40ff-b387-8135d81b481e.png` · `…235606_e6cbf045-b575-4919-9f39-ea50564d1d70.mp4`
- 2 bow: `…235512_9576414f-298d-4146-bca5-49df6ff87aa1.png` · `…235606_00ae2c8d-e73e-4f0d-b30c-8b233ee317f0.mp4`
- 3 assembly: `…235512_1ec55012-d796-4060-8250-e9773ba76a1d.png` · `…235605_885433bd-24cc-4e52-b004-533c73fed814.mp4`
- 4 raigad: `…235512_cd787800-05c6-401b-8de4-5b548dc18f17.png` · `…235605_72af3618-6c48-49aa-b201-fda449d66b78.mp4`
- 5 conch: `…235512_0ace1308-fa21-4fa3-8a82-60b5ba32771c.png` · `…/hf_20260913_000423_f631c4a7-b397-432e-862f-85aea4dbf360.mp4`
Full URLs are in `The Unreal Lab v3.dc.html` (`poster` attributes and the `VIDEOS` map in the script). Base: `https://d8j0ntlcm91z4.cloudfront.net/user_38cmvE8atrrp59M4kTuHbPQ1KMB/`. Brand mark is a plain CSS diamond; the old SVG logos in `public/` are retired.

## Files
- `The Unreal Lab v3.dc.html` — the design (template + inline logic script at the bottom). Needs `support.js`.
- `support.js` — prototype runtime, reference only.
- `Current Site (Recreation).dc.html` — the live site today, for comparison.
- `github.md` — source repo association and screen map.
