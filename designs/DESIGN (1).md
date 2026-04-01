# Design System Strategy: The Intelligent Interface

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built on the philosophy of **The Digital Curator**. In an industry crowded with cluttered dashboards and rigid tables, we move toward a high-end editorial experience that feels authoritative yet effortless. 

The "Mission Control" and "Minimal Classic" modes are not merely color swaps; they are intentional atmospheric shifts. We break the "template" look by utilizing **intentional asymmetry** (e.g., unbalanced margins that guide the eye), **overlapping editorial elements**, and a **radical typography scale** that favors massive headlines against micro-data points. We are building a workspace that feels like a premium intelligence report, not a generic spreadsheet.

---

## 2. Colors & Surface Architecture

### Dark Mode: Mission Control
*   **Primary Background:** `#080C18` (Deep Space)
*   **Card Surface:** `#0E1525`
*   **Elevated Surface:** `#131E30`
*   **Accents:** Gold (`#F59E0B`), AI Purple (`#8B5CF6`)
*   **Semantic Fit:** Excellent (`#10B981`), Good (`#F59E0B`), Poor (`#EF4444`)

### Light Mode: Minimal Classic
*   **Primary Background:** `#F8FAFC` (Gallery White)
*   **Card Surface:** `#FFFFFF`
*   **Accents:** Indigo (`#4F46E5`), Link Blue (`#3B82F6`)
*   **Semantic:** Success (`#22C55E`), Warning (`#F59E0B`), Danger (`#EF4444`)

### Core Execution Rules
*   **The "No-Line" Rule:** 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the definition a user needs without the visual noise of a line.
*   **Surface Hierarchy & Nesting:** Treat the UI as physical layers. Use the `surface-container` tiers (Lowest to Highest) to create "nested" depth. An inner data module should sit on a slightly higher tier than its parent container to denote its interactive priority.
*   **The "Glass & Gradient" Rule:** Floating action panels or navigation overlays should utilize **Glassmorphism**. Use semi-transparent surface colors with a `backdrop-blur` (12px–20px) to allow the background context to bleed through.
*   **Signature Textures:** For high-impact areas like "Excellent Fit" badges or Hero CTAs, use a subtle linear gradient (e.g., `primary` to `primary-container`) at a 135-degree angle. This adds "soul" and dimension that flat hex codes lack.

---

## 3. Typography: Editorial Authority
We utilize a high-contrast pairing to distinguish between narrative guidance and hard intelligence.

*   **Display & Headlines (Space Grotesk):** This is our "Editorial" voice. It is architectural, wide, and modern. Use `display-lg` (3.5rem) for main dashboard welcomes to establish a clear focal point.
*   **Body & Titles (Manrope):** Our "Workhorse." It provides high legibility for long-form candidate descriptions.
*   **Data & Stats (JetBrains Mono):** (Interpreted through the `label` and `body-sm` tokens). Use this for all numerical data, match percentages, and timestamps. Monospacing ensures that shifting numbers don't cause layout "jitter" and communicates a sense of technical precision.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop"; we use them to create "atmosphere."

*   **The Layering Principle:** Stack `surface-container` tiers to create hierarchy. A `surface-container-lowest` card placed on a `surface-container-low` section creates a natural "recessed" or "lifted" feel through color value alone.
*   **Ambient Shadows:** For floating modals, use extra-diffused shadows: `box-shadow: 0 20px 50px rgba(x, x, x, 0.06)`. The shadow color must be a tinted version of the `on-surface` color, never pure black, to simulate natural ambient light.
*   **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use the `outline-variant` token at **10-15% opacity**. It should be felt, not seen.

---

## 5. Components & UI Patterns

### Buttons
*   **Primary:** High-contrast (e.g., AI Purple in Dark Mode). Use a `0.75rem` (xl) corner radius. No borders.
*   **Secondary/Tertiary:** Use "Ghost" styles. In Dark Mode, this is a semi-transparent `surface-variant` with white text.

### Candidate Cards
*   **The Card Rule:** Strictly no divider lines. Use vertical white space (Spacing `8` or `10`) to separate the header from the body. Use a subtle background shift (`surface-container-high`) for the "Stats" footer of the card to separate it from the "Bio" section.

### AI Fit Badges (Chips)
*   **Excellent Fit:** Use a glassmorphic background of the semantic green with a `2px` JetBrains Mono font weight for the percentage. 

### Input Fields
*   **State:** Soft focus. When active, the background shifts from `surface-container` to `surface-bright`. No heavy blue outlines; use a subtle `primary` glow (4px blur).

### Specialized Component: The "Match Pulse"
*   For AI-generated scores, use a circular progress indicator with a gradient stroke (`primary` to `tertiary`) to signify the "living" nature of the AI's calculation.

---

## 6. Do’s and Don'ts

### Do:
*   **Embrace Negative Space:** If a section feels "empty," leave it. In this design system, white space (or dark space) is a luxury.
*   **Use Asymmetric Grids:** Align labels to the far left and data to the far right, leaving a wide gap in the middle to emphasize the editorial look.
*   **Mix Typefaces:** Use `JetBrains Mono` for small metadata labels directly next to `Space Grotesk` headlines.

### Don’t:
*   **Don't use 100% Opaque Borders:** This immediately breaks the premium "curated" feel and makes the app look like a legacy SaaS tool.
*   **Don't use Standard Drop Shadows:** Avoid "Card Shadows" that look like they are hovering 2 inches off the page. Depth should be subtle and tonal.
*   **Don't Over-Color:** Keep the backgrounds neutral. Let the semantic colors (Excellent/Poor Fit) and the Purple/Gold accents do the heavy lifting.