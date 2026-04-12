# Gibson & Messer — Brand Visual Design System
### Amsterdam · XV · VIII · MMXXVI

---

## Brand Philosophy

This is a wedding website, not a wedding website. The distinction matters. Most wedding sites are digital save-the-dates — functional, forgettable, transactional. This one is an invitation into a world: the world Riley and Sam built together, translated into a weekend in Amsterdam.

The visual language borrows from European editorial design and old-world printing traditions — parchment, brass rules, ink. But it doesn't live in the past. It moves. It breathes. It has cinematic timing.

**Governing principles:**
- **Generous space.** Nothing crowds. Every element has room to land.
- **Restraint over decoration.** Ornament earns its place or it doesn't appear.
- **Atmosphere over polish.** The texture overlay, the grain, the sepia tints — warmth beats perfection.
- **Cinematic motion.** Entrances are events. Nothing snaps; everything dissolves.

---

## Color System

### Palette Overview

| Token | Name | Hex | Use |
|---|---|---|---|
| `--color-surface-page` | Cream | `#F2E8D5` | Page background, default surface |
| `--color-surface-card` | Parchment | `#E8DBBE` | Card backgrounds, image-break bg |
| `--color-cream-400` | Sand | `#C8BB9E` | Borders, dividers, pip inactive |
| `--color-cream-900` | Dark Ink | `#2A1F14` | Body text |
| `--color-ink` | True Black | `#0F0E0C` | Display headings, section titles |
| `--color-brand-primary` | Venetian Red | `#C8392B` | Primary CTA, accent |
| `--color-red-700` | Deep Red | `#A8341F` | CTA hover, pressed state |
| `--color-red-400` | Dusty Rose | `#D9654F` | Menu link hover |
| `--color-brand-secondary` | Navy | `#2B5270` | Secondary headings, subheader color |
| `--color-blue-900` | Midnight | `#1E3A4A` | Dark prose sections, overlays |
| `--color-blue-400` | Slate | `#5B8FAF` | Menu sublinks, decorative text |
| `--color-verdigris` | Verdigris | `#4A6B5A` | Labels, eyebrows, pip complete |
| `--color-brass` | Brass | `#9C8355` | Rules, dividers, pip active |

### Contextual Rules

**Backgrounds** cycle through three moods as the user scrolls:
1. **Cream** (`#F2E8D5` → `#E8DBBE` radial) — default narrative sections, warm and readable
2. **Deep Blue** (`#1E3A4A`) — prose pullquotes, high-contrast moments
3. **Dark overlay** — hero images, footer CTA; `rgba(30,58,74,0.6)` to `rgba(42,31,20,0.85)` gradient

**Never** use a solid white (`#FFFFFF`) background. The cream palette is the white.

**Overlay tint formula for hero images:**
```
linear-gradient(rgba(30,58,74,0.6), rgba(42,31,20,0.85))
```

---

## Typography

### Typefaces

| Role | Family | Source | Character |
|---|---|---|---|
| Display / Statement | **Tangerine** 400 | Google Fonts | Romantic, calligraphic, ceremonial |
| Subheader / Label | **Fondamento** 400 | Google Fonts | Antiquarian, precise, editorial |
| Body | **Square Peg** 400 | Google Fonts | Loose, warm, handwritten without being casual |

**One weight only.** All three typefaces are used at `font-weight: 400`. No bold. No faux-bold. `-webkit-text-stroke: 0` is enforced globally.

### Type Scale

| Class | Typeface | Size | Tracking | Use |
|---|---|---|---|---|
| `.statement-font` | Tangerine | contextual (see below) | none | Hero titles, section headings, CTA text |
| `.subheader-font` | Fondamento | contextual | `0.02em` | Labels, nav, event meta, eyebrows |
| `.body-font` | Square Peg | `clamp(1.1rem, 1.8vw, 1.5rem)` | `0.04em` | All body copy, cards, descriptions |

### Display Sizes

| Context | Size |
|---|---|
| Hero title (home) | `clamp(5rem, 12vw, 13rem)` |
| Page hero h1 | `clamp(4rem, 10vw, 11rem)` |
| Footer CTA h2 | `clamp(4rem, 10vw, 11rem)` |
| Section title | `clamp(3rem, 6vw, 6rem)` |
| Menu links | `clamp(4rem, 8vw, 10rem)` |
| Menu sublinks | `clamp(1.8rem, 2.5vw, 3rem)` |
| RSVP step headings | `clamp(3rem, 6vw, 5.5rem)` |

### Line Heights

| Token | Value | Applied to |
|---|---|---|
| `--lh-display` | `1.05` | Large display headings |
| `--lh-heading` | `1.1` | Section/card headings |
| `--lh-label` | `1.4` | Fondamento labels, nav |
| `--lh-body` | `1.65` | Square Peg body copy |

### Eyebrow / Label Pattern

Small-caps labels in Fondamento, used to precede section headings:

```css
font-family: 'Fondamento', cursive;
font-size: 0.65rem;
letter-spacing: 0.3em;
color: #4A6B5A; /* verdigris */
text-transform: uppercase;
```

Examples: `PROGRAMME`, `A NOTE FROM US`, `R.S.V.P.`

---

## Spacing & Layout

### Spacing Tokens

| Token | Value | Use |
|---|---|---|
| `--section-padding` | `clamp(12rem, 25vh, 25rem)` | Top/bottom padding on all major sections |
| `--space-block` | `6rem` | Between content blocks within a section (desktop) |
| `--space-block-mobile` | `3rem` | Between content blocks (mobile) |

### Grid System

The site uses a **3-column editorial grid** as its primary content layout:

```
[  3fr — sticky label  ]  [gap: 15vw]  [  7fr — content  ]
```

Applied via `.story-section`, `.content-grid`, `.events-container .event-item`. The narrow left column holds a sticky section title; the wide right column holds all readable content.

On tablet and below (`≤1024px`), all multi-column grids collapse to a single column.

### Layout Constants

| Element | Value |
|---|---|
| Page horizontal padding | `5vw` |
| Menu horizontal padding | `10vw` |
| Image-break container width | `60vw` (right-aligned) |
| RSVP form max-width | `620px` (centered) |
| Body text max-width | `800px` |
| Prose pullquote max-width | `920px` |

---

## Texture & Atmosphere

### Parchment Overlay

A fixed, full-viewport overlay applies grain and warmth to every surface:

```css
background-image: url('https://www.transparenttextures.com/patterns/cream-paper.png');
mix-blend-mode: multiply;
opacity: 0.65;
z-index: 9999;
pointer-events: none;
```

This is always on. It is the single most important atmospheric element on the site. It unifies photography, cream backgrounds, and white text under one visual register.

### Image Treatment

All photography is treated with a consistent filter that ages it slightly toward the warm palette:

```css
filter: grayscale(10%) sepia(20%) contrast(110%);
```

Combined with a subtle zoom-out on scroll reveal (`scale(1.05)` → `scale(1)`), photos feel like they're surfacing from memory.

### Brass Rule

Used as a structural divider between event items and form labels:

```css
--rule-brass: 1px solid #9C8355;
```

Never decorative. Only appears where it carries structural meaning.

---

## Motion & Animation

Motion is the most opinionated part of this system. Two easings govern everything.

### Easing Tokens

| Token | Curve | Character |
|---|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Fast start, long graceful deceleration. Used for entrances. |
| `--ease-in-out-dramatic` | `cubic-bezier(0.77, 0, 0.175, 1)` | Sharp acceleration and deceleration. Used for the menu clip-path. |

### Scroll Reveal — `.reveal-up`

Every content element enters with this animation, triggered by IntersectionObserver at 15% viewport entry:

```css
/* Resting state */
opacity: 0;
transform: translateY(32px);
filter: blur(4px);

/* Active state (.visible added by JS) */
opacity: 1;
transform: translateY(0);
filter: blur(0);

transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
```

**Stagger delays:** `.delay-1` (0.1s), `.delay-2` (0.2s), `.delay-3` (0.3s). Use sparingly — only when two elements in the same visual cluster benefit from slight offset.

### Image Reveal

Images within `.image-wrapper` begin scaled up and settle on entry:

```css
transform: scale(1.05);
transition: transform 2.5s cubic-bezier(0.16, 1, 0.3, 1);
/* On .visible: scale(1) */
```

The longer duration (`2.5s`) gives photography a slow cinematic quality distinct from text reveals.

### Menu Overlay

Opens and closes via `clip-path` — no fade, no slide, a wipe:

```css
clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);   /* closed */
clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); /* open */
transition: clip-path 1.2s cubic-bezier(0.77, 0, 0.175, 1);
```

### Intro / Loader Sequence

The home page loader runs for ~4.8 seconds and coordinates four animations:

| Element | Animation | Delay | Duration |
|---|---|---|---|
| Monogram | `loaderReveal` (fade + blur in) | 0.3s | 2.2s |
| Brass divider | `lineExpand` (scaleX 0→1) | 1.9s | 1.0s |
| Names | `loaderFadeUp` | 2.6s | 1.4s |
| Date | `loaderFadeUp` | 3.1s | 1.4s |

After 4.8s, the loader fades out and the floating monogram flies from center to its nav position.

### RSVP Step Transitions

Steps exit upward, enter from below:

```css
/* Exit */   opacity: 0; transform: translateY(-16px); duration: 0.4s
/* Entrance */ opacity: 0; transform: translateY(20px); duration: 0.7s
```

---

## Components

### Navigation

Three-column grid: `[RSVP] [Logo] [Hamburger]`

- Fixed, full-width, `z-index: 1000`
- `mix-blend-mode: difference` on light backgrounds (inverts the white elements to appear dark over light hero)
- Switches to `mix-blend-mode: normal` when menu is open
- Logo shrinks from 72px → 42px on scroll past 80px
- The floating monogram (`#logo-floater`) is a separate fixed element that animates from center on load

### Fullscreen Menu

- Background: `radial-gradient(circle at 50% 100%, #2B5270, #1E3A4A)`
- Opens via clip-path wipe (see Motion)
- Links stagger in at 0.3s, 0.4s, 0.5s, 0.6s intervals
- Menu link hover: `color: #D9654F`, `translateX(16px)`

### Hero

- Full viewport height (`100vh`)
- Title bottom-left, metadata bottom-right
- Background on `background-attachment: fixed` (disabled on mobile — iOS Safari bug)
- Title uses largest statement size: `clamp(5rem, 12vw, 13rem)`

### Event Cards

Interactive stacked deck. Cards positioned with CSS custom properties `--tx` (translateX) and `--r` (rotate):

```
Card 1: --tx:-220px  --r:-14deg  z-index:5   (front/active)
Card 2: --tx:-110px  --r:-7deg   z-index:4
Card 3: --tx:0px     --r:0deg    z-index:3
Card 4: --tx:110px   --r:7deg    z-index:2
```

Clicking any inactive card makes it active (rises `translateY(-64px)`, rotates to `0deg`). On mobile, stacks vertically with no transforms.

### RSVP Progress Pips

```
Inactive:  6px circle, color: #C8BB9E (sand)
Active:    6px circle scale(1.4), color: #9C8355 (brass)
Complete:  6px circle, color: #4A6B5A (verdigris)
```

### Footer CTA

Full-viewport-height section. Always uses the florals background with the dark overlay tint. The single button uses a ghost style (transparent bg, `rgba(242,232,213,0.4)` border, cream text) with a backdrop blur:

```css
backdrop-filter: blur(5px);
/* hover: */ background: #F2E8D5; color: #1E3A4A; border-color: #F2E8D5;
```

---

## Imagery Direction

**Subject matter:** Architectural, atmospheric, editorial. Avoid posed portraiture at the compositional level — let context carry the emotion.

**Mood:** Warm, golden-hour, slightly desaturated. The CSS filter (`grayscale(10%) sepia(20%) contrast(110%)`) is applied universally and should inform how raw images are selected — they should look good *after* the filter, not despite it.

**Cropping:** Images live in `overflow: hidden` containers. Composition should work at various aspect ratios, especially for the image-break (landscape, 90vh max height) and story-block images (portrait-friendly, 500px max height).

**Exceptions:** Illustrations (like the Steeple graphic) use `filter: none` and `object-fit: contain`. They exist outside the photo treatment system.

---

## Voice & Tone

**Understated, not flat.** The copy is warm but never gushing. It trusts the reader.

**Specific, not generic.** "We must have put over a hundred miles on our shoes" beats "we spent a lot of time together." Concrete details carry more romance than abstract sentiment.

**Dutch flourishes, sparingly.** `Tot gauw`, `AMSTERDAM · XV · VIII · MMXXVI`, `Wolk (Dutch for "Cloud")` — these appear once each and earn their place.

**Date formatting:** `15 August 2026` or `XV · VIII · MMXXVI`. Never `8/15/26`.

**Address formatting:** Full address on a separate line when used for directions. Venue name leads.

---

## Do's & Don'ts

### Do
- Use radial gradients on section backgrounds — always cream to slightly warmer cream
- Maintain the 3fr/7fr editorial grid for narrative content
- Let sections breathe — `--section-padding` exists for a reason
- Apply `.reveal-up` to every content element that enters on scroll
- Keep all type at `font-weight: 400`
- Use Fondamento for any label, eyebrow, or metadata that needs authority

### Don't
- Use `font-weight` above 400 on any element
- Add `text-shadow` — it's explicitly zeroed out globally
- Use solid white (`#FFFFFF`) anywhere on the page
- Set `background-attachment: fixed` without a mobile scroll fallback
- Stack more than 3 delay classes in one visual cluster
- Add `box-shadow` values outside the established range (`rgba(42,31,20,...)` tints only)
- Use any Google Font not in the approved set of three
- Introduce a fourth color family — the red/blue/cream/brass palette is complete

---

*Gibson & Messer · Amsterdam 2026*
