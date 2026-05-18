## Goal

Bring the second aesthetic — **isometric technical line illustrations** (stacked UI planes, dashed grids, constellation graphs) — into LedgerOath as foreground decorative artwork, while the Renaissance painterly backdrops keep doing their atmospheric job underneath.

The two aesthetics complement each other perfectly:
- **Painterly backdrops** = soul, gravitas, "celestial governance" mood.
- **Isometric lineart** = mind, system, "this is engineered" signal.

## Strategy (credit-efficient)

Generate **2 transparent-PNG line illustrations** at standard quality, then drop each into one carefully chosen section. CSS handles theme inversion (black ink on ivory → ivory ink on navy) so one asset works in both modes.

### The 2 illustrations

1. **`iso-stack.png`** — isometric stack of UI/browser planes (matches uploaded image #4): floating windows, a password field, wires connecting to a central glowing node, dashed grid floor. Pure black lineart on transparent.
   → Placed in **Command Center** as a right-side hero illustration. Reinforces "this is where you wire up the review."

2. **`iso-network.png`** — isometric translucent plane with a constellation/network graph of nodes and edges floating above a faint UI plane (matches uploaded image #5). Pure black lineart on transparent.
   → Placed in **Agent Timeline (Star Chart)** as a header illustration. Reinforces the multi-agent topology.

Both are transparent PNGs so the painterly backdrop and SVG linework continue to show through where the illustration's negative space falls.

## Implementation

### 1. Generate assets (2 parallel calls, standard quality)
- `src/assets/atmos/iso-stack.png` (1536×1024, transparent)
- `src/assets/atmos/iso-network.png` (1536×1024, transparent)

Prompts: "isometric technical line illustration, thin black ink on transparent background, dashed perspective grid floor, no color, no text, editorial blueprint style" — variant 1 stacks browser/auth windows + central node; variant 2 shows a node-edge constellation on a translucent plane.

### 2. Add a single theme-aware utility in `styles.css`
```css
.iso-lineart { opacity: 0.85; }
.dark .iso-lineart, html:not(.light) .iso-lineart { filter: invert(1) brightness(1.05); opacity: 0.55; }
```
This is the only CSS needed — one rule, both themes covered.

### 3. Place in 2 sections (one `<img>` each, no new components)

**`src/components/app/CommandCenter.tsx`**
- Wrap the existing header/intro row in a relative container and add `iso-stack.png` as an absolutely-positioned decorative `<img>` on the right side at a contained size (e.g. `max-w-[480px]`, `right-0`, `top-0`, `hidden lg:block`, `iso-lineart`, `aria-hidden`, `loading="lazy"`).
- Existing form/content keeps its current grid; the illustration sits behind it via `-z-0` so nothing interactive is blocked.

**`src/components/app/AgentTimeline.tsx`**
- Same pattern: add `iso-network.png` as a decorative absolutely-positioned `<img>` near the section header (top-right, `hidden lg:block`, `max-w-[420px]`, `iso-lineart`).

No layout changes, no flow changes, no copy changes.

### 4. Readability guards
- `hidden lg:block` keeps them off mobile/tablet where space is tight.
- `pointer-events-none` + `aria-hidden` on both.
- `-z-0` behind cards but above the celestial backdrop layer.
- Opacity caps (0.55 dark / 0.85 light) prevent the lineart from competing with text.

## Files touched
- **New**: `src/assets/atmos/iso-stack.png`, `src/assets/atmos/iso-network.png`
- **Edit**: `src/styles.css` (one utility class)
- **Edit**: `src/components/app/CommandCenter.tsx` (one `<img>`)
- **Edit**: `src/components/app/AgentTimeline.tsx` (one `<img>`)

**Total: 2 image generations + 3 small edits.**

## What you'll see
- Command Center: faint isometric stack of UI panes on the right, behind your inputs, sitting on the painterly fresco haze.
- Agent Timeline: faint isometric network/constellation in the top-right of the section header, hovering above the aurora backdrop.
- Both flip from black ink (light mode) to ivory ink (dark mode) automatically.
- Everything else — flows, copy, painterly backdrops — untouched.

## Risks / mitigations
- **Visual clutter** → opacity caps + `hidden lg:block` + restricted to 2 sections only.
- **Generated lineart looking messy** → standard quality + transparent PNG + the existing layers will mask imperfections.

Approve and I'll execute.