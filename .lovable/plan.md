## Goal

Layer a Renaissance/classical painterly atmosphere (like the Dualite "masterpiece" and Momentum "Celestial Drift" references) behind every section of LedgerOath — without rebuilding components, breaking themes, or hurting readability.

The current `CelestialBackdrop` is pure SVG linework. We will keep it, and add a new **painterly image layer** behind it. One small, reusable set of images does the entire app.

## Strategy (credit-efficient)

Instead of generating a unique image per section (expensive), generate **only 3 master images** and reuse them via variant + opacity + positioning:

1. `fresco-figure.jpg` — a classical robed figure / statue on the right side (used on Hero, Login, Signup, Workspace empty states). Mirrors reference image #2.
2. `celestial-drift.jpg` — atmospheric green-teal cosmic landscape (used on Decision Room, Timeline, Audit Dossier). Mirrors reference image #3.
3. `parchment-fresco.jpg` — soft ceiling-fresco texture with cherubs/clouds, very desaturated (used as the global `celestial-shell` ambient wash, behind Command Center and any long-scroll page). Mirrors reference image #1's top band.

All three generated at `standard` quality (not premium), 1536×1024, JPG. Total: **3 image gens**.

## Implementation

### 1. Generate assets (parallel, 3 calls)
- `src/assets/atmos/fresco-figure.jpg`
- `src/assets/atmos/celestial-drift.jpg`
- `src/assets/atmos/parchment-fresco.jpg`

Prompts tuned for: muted Renaissance palette, heavy grain, edges fading to ivory/navy so they composite cleanly. No text, no logos.

### 2. Extend `CelestialBackdrop.tsx` (single file edit)
Add an optional `painterly` image layer behind the existing SVG motifs:
- New prop `painterly?: "figure" | "drift" | "fresco" | "none"` (default per-variant).
- Renders an `<img>` absolutely positioned, with:
  - `mix-blend-mode: luminosity` in dark mode, `multiply` in light mode (via a `light:` variant class), so the image tints to the theme instead of fighting it.
  - Opacity `0.18` dark / `0.12` light, tunable via `intensity`.
  - Masked edges using `mask-image: radial-gradient(...)` so the painting dissolves into the page rather than sitting in a hard rectangle.
  - Positioned right-anchored for `figure`, full-bleed for `drift`, top-anchored for `fresco`.
- Existing SVG linework + grain stay on top — they keep the editorial/technical signal.

### 3. Wire variants to images (no new components)
Default mapping inside `CelestialBackdrop`:
- `observatory` (Hero) → `figure`
- `manuscript` (Auth, Workspace) → `figure` (subtle)
- `verdict` (Decision Room) → `drift`
- `starchart` (Timeline) → `drift` (subtle)
- `archive` (Dossier) → `fresco` (subtle)
- `chamber` (Command Center) → `fresco` (subtle)

All sections already use `CelestialBackdrop`, so **no section component needs touching**.

### 4. Global ambient wash in `styles.css`
Add a very faint `parchment-fresco.jpg` as a `background-image` on `.celestial-shell::before` (alongside the existing radial gradients) at ~6% opacity. This gives every long-scroll page a subtle painterly cast even between section backdrops. One CSS edit.

### 5. Readability guards
- All foreground cards keep `bg-card/90` + `backdrop-blur-sm` where they already do.
- New layer sits at `z-index: 0` behind existing `z-1` content — no interaction changes.
- `prefers-reduced-motion` unaffected (images are static).
- Light mode: lower opacity + `multiply` blend prevents the painting from muddying ivory.

## Files touched
- **New**: `src/assets/atmos/fresco-figure.jpg`, `celestial-drift.jpg`, `parchment-fresco.jpg`
- **Edit**: `src/components/app/CelestialBackdrop.tsx` (add painterly layer + variant mapping)
- **Edit**: `src/styles.css` (add image to `.celestial-shell::before`)

That's it. **3 image generations + 2 file edits.** No new routes, no new components, no flow changes, no backend.

## What you'll see
- Hero: robed classical figure dissolving on the right, behind the existing observatory linework.
- Decision Room / Timeline: deep teal celestial landscape washing the background.
- Command Center / Dossier: faint ceiling-fresco haze at the top, parchment grain below.
- Light mode: the same paintings appear as sepia-tinted parchment imprints, sovereign-audit style.
- Dark mode: same paintings appear as desaturated luminous frescoes, observatory style.

## Risks / mitigations
- **Contrast on text** → opacity caps + edge masks + existing card backdrops.
- **Image weight** → 3 shared JPGs, lazy via standard `<img loading="lazy">` except hero.
- **AI-generated faces looking off** → prompts favor statues, drapery, and landscapes over portraits; figure is partial/side-lit.

Approve and I'll execute in one batch.