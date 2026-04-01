# HireTrackAI — Product Requirements Document
**Version:** 1.0 | **Date:** February 2026 | **Owner:** Delin Shabu
**Platform:** Web App (Vanilla JS + Firebase + AI APIs)
**Purpose:** AI-powered job application tracker for active UAE job seekers

---

## AI Design Tool Instructions

> This document is structured for AI-assisted UI generation.
> Each screen section contains: layout description, component list, visual hierarchy,
> color intent, and interaction states. Use the Design System section first to
> establish tokens before generating individual screens.

---

## 1. Product Overview

HireTrackAI is a **dark-themed, data-dense job tracking dashboard** for a single power user actively applying to jobs in the UAE. It combines a Kanban-style application tracker with an AI cold email writer, a real-time job fit scoring engine, and smart role recommendations.

### Core User Problem
Job seekers in competitive markets apply to dozens of roles and lose track of what they sent, where, and when. They waste time on ineligible roles, send generic emails that get ignored, and never follow up systematically.

### What the App Does
- Tracks every job application with status, salary, platform, and HR contact
- Detects duplicate applications in real time as the user types
- Scores every job 0–100% fit against the user's skill profile
- Generates personalized cold emails via AI (Gemini / Grok / Anthropic)
- Recommends the best roles to target and flags ones to avoid
- Reminds the user when to follow up on pending applications

### Target User
Single user — Delin Shabu, 24, IT professional + MERN Stack developer,
currently in Abu Dhabi on visit visa, targeting 5,000+ AED/month roles,
applying 10–20 jobs per day, needs fast mobile + desktop access.

---

## 2. Design System

### 2.1 Visual Direction

**Theme:** Dark professional dashboard — NOT generic blue corporate.
The aesthetic is **mission-control meets terminal** — a serious tool for a
focused job hunt. Think Bloomberg terminal energy meets modern SaaS.

**Mood:** Focused, urgent, intelligent. Every pixel serves a purpose.
Dense with information but never cluttered. Gold accents create warmth
and highlight the most important actions.

**Personality:** Confident, sharp, data-forward. This is a tool built by
someone technical for their own use — it shows craft and intentionality.

---

### 2.2 Color Palette

```
/* Background Colors */
--bg-primary:     #080C18    /* Page background — deep navy black */
--bg-card:        #0E1525    /* Card surface — slightly lighter */
--bg-elevated:    #131E30    /* Hover states, tooltips */
--bg-input:       #080C18    /* Input fields */

/* Border Colors */
--border-subtle:  #1A2438    /* Default card borders */
--border-medium:  #243048    /* Hover borders, active states */
--border-gold:    rgba(245,158,11,0.25)  /* Highlighted card borders */

/* Brand / Accent */
--gold:           #F59E0B    /* Primary accent — CTA buttons, active nav */
--gold-light:     rgba(245,158,11,0.10)  /* Gold backgrounds */
--gold-border:    rgba(245,158,11,0.20)  /* Gold-tinted borders */

/* Semantic Colors */
--green:          #10B981    /* Success, Offer status, Excellent Fit */
--blue:           #3B82F6    /* Replied/Callback status, info, links */
--purple:         #8B5CF6    /* AI features, magic actions */
--amber:          #F59E0B    /* Pending status, warnings */
--red:            #EF4444    /* Rejected status, Poor Fit, errors */
--orange:         #F97316    /* Partial Fit, medium warnings */

/* Text Colors */
--text-primary:   #E2E8F0    /* Main readable text */
--text-secondary: #94A3B8    /* Labels, secondary info */
--text-muted:     #475569    /* Placeholders, timestamps */
--text-white:     #FFFFFF    /* Text on colored backgrounds */

/* Status Background Tints */
--status-pending-bg:  rgba(245,158,11,0.12)
--status-replied-bg:  rgba(59,130,246,0.12)
--status-callback-bg: rgba(139,92,246,0.12)
--status-rejected-bg: rgba(239,68,68,0.12)
--status-offer-bg:    rgba(16,185,129,0.12)

/* Fit Score Colors */
--fit-excellent:  #10B981    /* 80-100% */
--fit-good:       #F59E0B    /* 65-79% */
--fit-partial:    #F97316    /* 45-64% */
--fit-poor:       #EF4444    /* 0-44%  */

/* Gradients */
--gradient-ai:    linear-gradient(135deg, #8B5CF6, #3B82F6)   /* AI buttons */
--gradient-brand: linear-gradient(135deg, #F59E0B, #EF4444)   /* Logo mark */
--gradient-card:  linear-gradient(180deg, #0E1525, #080C18)   /* Card depth */
```

---

### 2.3 Typography

```
/* Font Stack */
--font-primary:  'Space Grotesk', system-ui, sans-serif
--font-mono:     'JetBrains Mono', 'Fira Code', monospace

/* Import */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* Type Scale */
--text-xs:   11px / line-height 1.4  / letter-spacing 0.5px
--text-sm:   12px / line-height 1.5  / letter-spacing 0.3px
--text-base: 13px / line-height 1.6
--text-md:   14px / line-height 1.6
--text-lg:   15px / line-height 1.5  / font-weight 600
--text-xl:   18px / line-height 1.4  / font-weight 700
--text-2xl:  22px / line-height 1.3  / font-weight 700
--text-3xl:  28px / line-height 1.2  / font-weight 700
--text-stat: 28px / line-height 1    / font-family: mono / font-weight 700

/* Usage Rules */
/* Headings: Space Grotesk Bold */
/* Stats/numbers: JetBrains Mono Bold */
/* Code/emails: JetBrains Mono Regular */
/* Labels: Space Grotesk Semibold, UPPERCASE, letter-spacing 0.5px */
/* Body: Space Grotesk Regular */
```

---

### 2.4 Spacing & Layout Grid

```
/* Base unit: 4px */
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px

/* Container */
--max-width: 1100px
--page-padding: 24px

/* Card */
--card-radius:    12px
--card-padding:   20px 24px
--card-border:    1px solid var(--border-subtle)

/* Header height: 58px */
/* Footer height: 44px */
/* Content area: full height minus header and footer */
```

---

### 2.5 Component Tokens

```
/* Buttons */
--btn-radius:   8px
--btn-padding:  10px 18px
--btn-font:     13px / font-weight 600

/* Inputs */
--input-radius:  8px
--input-padding: 10px 14px
--input-font:    14px
--input-focus:   border-color var(--gold)

/* Badges */
--badge-radius:  20px
--badge-padding: 3px 10px
--badge-font:    11px / font-weight 600 / letter-spacing 0.4px

/* Progress Bar */
--progress-height: 4px
--progress-radius: 2px

/* Scrollbar */
width: 6px / track: var(--bg-card) / thumb: var(--border-medium)
```

---

### 2.6 Shadows & Effects

```
--shadow-card:   0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)
--shadow-elevated: 0 4px 16px rgba(0,0,0,0.5)
--shadow-gold:   0 0 20px rgba(245,158,11,0.15)
--shadow-ai:     0 0 24px rgba(139,92,246,0.2)

/* Animations */
--anim-fade-in:  fadeIn 0.3s ease both
--anim-spin:     spin 1s linear infinite
--anim-pulse:    pulse 1.5s ease infinite

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
```

---

## 3. Application Structure

### Navigation Model
**Single-page app with tab-based navigation.**
Persistent top header with 4 main views.
No sidebar. No nested routes. Always visible header.

```
┌─────────────────────────────────────────────────────┐
│  HEADER (sticky, 58px height)                       │
│  [Logo] [Dashboard] [Add Job] [AI Email] [Recs]  [Avatar] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MAIN CONTENT AREA (scrollable)                     │
│  max-width: 1100px, centered, padding: 28px 24px    │
│                                                     │
├─────────────────────────────────────────────────────┤
│  FOOTER (44px)                                      │
└─────────────────────────────────────────────────────┘
```

### 4 Main Views
1. **Dashboard** — stats + job cards list with filters
2. **Add Job** — form with live duplicate detection + fit preview
3. **AI Email Writer** — two-panel: job picker + email output
4. **Smart Recommendations** — role guidance + application audit

---

## 4. Screen Specifications

---

### SCREEN 1: Header (Global — All Views)

**Height:** 58px
**Background:** `#0E1525`
**Bottom border:** `1px solid #1A2438`
**Position:** sticky, top: 0, z-index: 100

#### Layout (horizontal, space-between)
```
[Logo Mark + App Name]          [Nav Tabs]          [User Avatar]
```

#### Logo Mark
- Square: 32×32px, border-radius: 8px
- Background: `linear-gradient(135deg, #F59E0B, #EF4444)`
- Icon inside: bar-chart icon, 16px, color `#080C18`

#### App Name (beside logo)
- Line 1: `HireTrack` + `AI` (AI in `#F59E0B`) — 14px, font-weight 700
- Line 2: `Delin Shabu's Job Command Center` — 10px, color `#94A3B8`

#### Navigation Tabs (4 tabs)
Each tab is a button with icon + label, 12px text.
**Active state:** background `rgba(245,158,11,0.10)`, color `#F59E0B`, border `1px solid rgba(245,158,11,0.20)`
**Inactive state:** transparent background, color `#94A3B8`, border transparent
**Hover state:** background `rgba(255,255,255,0.03)`, color `#E2E8F0`
**Padding:** 7px 14px, border-radius: 8px

Tab items:
- Dashboard (icon: grid/home)
- Add Job (icon: plus)
- AI Email Writer (icon: cpu/brain)
- Smart Recs (icon: lightbulb)

#### User Avatar (right side)
- Container: background `#080C18`, border `1px solid #1A2438`, border-radius: 8px, padding: 6px 12px
- Circle avatar: 24×24px, gradient background (purple→blue), initial letter "D", 11px bold white
- Username: "Delin", 12px, font-weight 600

---

### SCREEN 2: Dashboard View

**Purpose:** Main hub — shows stats summary + all job applications as filterable card list.

#### 2A: Stats Row

**Layout:** Horizontal row of 4 cards, equal width flex, gap: 12px
Each card: `background: #0E1525`, `border: 1px solid #1A2438`, `border-radius: 12px`, padding: `20px 24px`

**Stat Card Structure (per card):**
```
[Stat Number]    [Icon — right aligned, colored, 70% opacity]
[Label]
```
- Stat Number: 28px, JetBrains Mono, font-weight 700, colored
- Label: 12px, `#94A3B8`, font-weight 500, letter-spacing 0.4px, UPPERCASE, margin-top: 6px

**4 stat cards:**
| Label | Color | Icon |
|---|---|---|
| TOTAL APPLIED | `#E2E8F0` | bar-chart |
| PENDING | `#F59E0B` | clock |
| REPLIED / CB | `#3B82F6` | mail |
| REJECTED | `#EF4444` | x-circle |

If there are any OFFERS — show a 5th card: label "OFFERS 🎉", color `#10B981`

---

#### 2B: Filter & Search Toolbar

**Layout:** Horizontal flex, gap: 12px, margin-bottom: 16px, flex-wrap

**Search Input (left, flex: 1, min-width: 200px):**
- Left padding: 36px (icon inside left)
- Placeholder: "Search company or position…"
- Icon: search/link icon, 14px, `#475569`, absolutely positioned left: 12px

**Status Filter Pills (right side):**
One pill per status: All / Pending / Replied / Callback / Rejected / Offer
Each pill shows count in parentheses e.g. "Pending (47)"

**Active pill styling:** background = status color at 12% opacity, text = status color, border = status color at 20% opacity
**Inactive pill:** transparent background, `#94A3B8` text, `#1A2438` border
**Pill:** padding 8px 14px, 11px font, border-radius: 20px, font-weight 600

---

#### 2C: Job Application Cards (list, gap: 10px)

Each card is a full-width row.
**Card:** `background: #0E1525`, `border: 1px solid #1A2438`, `border-radius: 12px`, padding: `16px 20px`
**Entry animation:** fadeIn 0.3s ease

**Card Layout:** CSS grid, two columns: `1fr auto`
Left column (main info) | Right column (actions, min-width: 160px)

**LEFT COLUMN — top to bottom:**

Row 1 — Title row (flex, align-center, gap: 10px):
- Company Name: font-weight 700, 15px, `#E2E8F0`
- Status Badge: colored badge (see badge spec below)
- Fit Badge: pushed to right with `margin-left: auto` — shows "92% — Excellent Fit"

Row 2:
- Position/Job Title: 13px, `#94A3B8`, margin-bottom: 8px

Row 3 — Fit Score Bar:
- Full width thin bar, height: 4px, background: `#1A2438`, border-radius: 2px
- Filled portion: width = score%, color = fit color, smooth transition

Row 4 — Meta info (flex, gap: 16px, wrap, margin-top: 8px):
- 📍 Location — 11px, `#475569`
- 💰 Salary (only if not "not mentioned") — 11px, `#475569`
- 🔗 Platform — 11px, `#475569`
- ✉️ Email (if captured) — 11px, `#475569`
- 📅 Date — 11px, `#475569`

Row 5 — Notes (if present):
- 12px, `#475569`, italic
- Left border: `2px solid #1A2438`, padding-left: 8px, margin-top: 8px

**RIGHT COLUMN — top to bottom:**

Status Dropdown:
- Width: 130px, 12px font, padding: 6px 10px
- Options: Pending / Replied / Callback / Rejected / Offer

Action Buttons row (flex, gap: 6px):
- "Draft Email" button: AI gradient (purple→blue), white text, 12px, padding: 6px 12px, icon left
- "Delete" button: red tinted, icon only (trash), padding: 6px 10px

Delete Confirmation (appears inline below buttons):
- "Confirm Delete" (red) + "Cancel" (ghost) — 11px, compact

**Status Badge spec:**
| Status | Text Color | Background |
|---|---|---|
| Pending | `#F59E0B` | `rgba(245,158,11,0.12)` |
| Replied | `#3B82F6` | `rgba(59,130,246,0.12)` |
| Callback | `#8B5CF6` | `rgba(139,92,246,0.12)` |
| Rejected | `#EF4444` | `rgba(239,68,68,0.12)` |
| Offer | `#10B981` | `rgba(16,185,129,0.12)` |

**Fit Badge spec:**
| Score | Label | Color |
|---|---|---|
| 80–100% | Excellent Fit | `#10B981` |
| 65–79% | Good Fit | `#F59E0B` |
| 45–64% | Partial Fit | `#F97316` |
| 0–44% | Poor Fit | `#EF4444` |

---

### SCREEN 3: Add Job View

**Layout:** Single column, max-width: 700px (left-aligned in content area)

**Page Title:**
- H1: "Add New Application" — 22px, bold
- Subtitle: "Real-time duplicate detection + AI fit scoring as you type" — 14px, `#94A3B8`

---

#### 3A: Duplicate Warning Banner (conditional — shown when duplicate found)

**Trigger:** Appears when user types a company name that matches existing record
**Position:** Full width, below title, above form

**Styling:**
- Background: `rgba(239,68,68,0.08)`
- Border: `1px solid rgba(239,68,68,0.30)`
- Border-radius: 10px
- Padding: 12px 16px
- Layout: flex, gap: 12px, align-items: flex-start

**Left:** Warning icon (triangle/alert), 20px, `#EF4444`, flex-shrink: 0
**Right:**
- Title: "⚠️ Possible Duplicate Detected!" — 13px, bold, `#EF4444`
- Body: "You already applied to [Company] for [Position] on [Date]. Status: [Status]. You can still add if this is a different role." — 12px, `#94A3B8`

---

#### 3B: Fit Score Preview Banner (conditional — shown when company + position filled)

**Trigger:** Appears after user fills both company and position fields
**Position:** Full width, below duplicate warning area (or below title if no warning)

**Styling varies by fit score:**
- Excellent: background = `rgba(16,185,129,0.08)`, border = `rgba(16,185,129,0.20)`
- Good: amber tint equivalents
- Partial: orange tint equivalents
- Poor: red tint equivalents

**Layout:** Same as warning banner
**Left:** Spark/star icon, 20px, fit color
**Right:**
- Title: "AI Fit Score: [X]% — [Label]" — 13px, bold, fit color
- Body: contextual advice based on score — 12px, `#94A3B8`

---

#### 3C: Add Job Form Card

**Card:** `background: #0E1525`, border, border-radius: 12px, padding: 28px

**Form grid:** `grid-template-columns: 1fr 1fr`, gap: 16px

**Full-width fields (grid-column: 1 / -1):**
- Company Name * (has red border when duplicate detected)
- Position / Job Title *
- HR Email
- Key Requirements / Notes (textarea, 3 rows)

**Half-width fields:**
- Status (select) | Platform (select)
- Salary | Location

**Label style:** 12px, `#94A3B8`, font-weight 600, UPPERCASE, letter-spacing 0.5px, margin-bottom: 6px

**Input border when duplicate:** `border-color: #EF4444`
**Input focus:** `border-color: #F59E0B`

**Bottom action row (margin-top: 20px, flex, gap: 12px):**
- "Add Application" button: full width (flex: 1), gold background `#F59E0B`, `#080C18` text, 16px plus icon, 13px bold
  - Disabled state when company or position empty: 50% opacity, cursor not-allowed
- "Cancel" button: ghost style, fixed width

---

### SCREEN 4: AI Email Writer View

**Purpose:** Two-panel layout. Left: job selector + settings. Right: generated email display.

**Page Title:**
- H1: "🤖 AI Cold Email Generator" — 22px, bold
- Subtitle: "Powered by Claude AI — personalized to your profile and the specific job" — 14px, `#94A3B8`

**Layout:** CSS grid, `grid-template-columns: 340px 1fr`, gap: 20px, align-items: start

---

#### 4A: Left Panel — Job Picker Card

**Card:** padding: 20px, border, border-radius: 12px

**Header:** label "Select Job to Target" — uppercase label style

**Job List (scrollable, max-height: 320px, gap: 8px, flex column):**

Each job item is a clickable div:
- Padding: 12px 14px, border-radius: 8px, cursor: pointer
- Default: `border: 1px solid #1A2438`, transparent background
- Selected: `border: 1px solid #F59E0B`, background `rgba(245,158,11,0.10)`
- Hover: `border: 1px solid #243048`
- Transition: all 0.15s

**Inside each job item:**
- Company: 13px, font-weight 600, color = gold if selected, else `#E2E8F0`
- Position: 11px, `#94A3B8`, margin-top: 2px
- Score + Status: 10px, fit color, margin-top: 4px — "[X]% fit · [Status]"

---

#### 4B: Left Panel — Email Type Selector Card (shown when job selected)

**Card:** padding: 20px, margin-top: 16px

**Header:** label "Email Tone & Type"

**4 option items (clickable, gap: 8px):**
- Auto-detect 🤖
- IT Support Focus 🖥️
- Developer Focus 💻
- General Tech 📋

**Each option:**
- Padding: 10px 12px, border-radius: 8px, cursor: pointer
- Default: `border: 1px solid #1A2438`, transparent background
- Selected: `border: 1px solid #3B82F6`, background `rgba(59,130,246,0.08)`
- Title: 12px, font-weight 600, color = blue if selected, else `#E2E8F0`
- Description: 10px, `#94A3B8`, margin-top: 2px

**Generate Button (below options):**
- Width: 100%, padding: 12px, margin-top: 8px
- Style: AI gradient (purple→blue), white text, font-weight 600
- Left icon: spark/star
- Loading state: spinning circle icon + "Generating…" text
- Spinner: 14×14px circle, border top-color white, animation: spin

---

#### 4C: Right Panel — Email Output Card

**Card:** padding: 24px, min-height: 480px, border, border-radius: 12px

**Empty state (no job selected):**
- Centered vertically, mail icon 40px, 30% opacity, margin-bottom: 16px
- Text: "Select a job from the list to generate a personalized cold email" — `#94A3B8`

**Ready state (job selected, not yet generated):**
- Centered vertically, AI/cpu icon 40px, 30% opacity, purple tint
- Text: "Ready to generate for [Company Name]" — company name bold, white
- Sub-text: "AI will tailor the email to this specific role and company" — 12px, faded

**Loading state:**
- Centered: 40×40px spinning circle, border `3px solid #1A2438`, border-top `#8B5CF6`
- Below: "Crafting your personalized email…" — `#94A3B8`, pulse animation

**Generated email state:**

Top bar (flex, space-between, margin-bottom: 16px):
- Left: Title "Generated Email" 14px bold + subtitle "[Company] — [Position]" 11px `#94A3B8`
- Right: "Copy" button (ghost→green when copied, check icon) + "Regenerate" button (AI gradient, spark icon)

Email content box:
- Background: `#080C18`
- Border: `1px solid #1A2438`
- Border-radius: 10px
- Padding: 20px
- Font: JetBrains Mono, 13px, line-height: 1.7
- Color: `#E2E8F0`
- White-space: pre-wrap (preserves line breaks)
- Max-height: 480px, overflow-y: auto

Footer row (margin-top: 12px):
- "💡 Tip: Personalize the [Company Name] references before sending" — 11px, `#475569`
- "📊 Fit Score: X% — Label" — 11px, `#475569`

---

### SCREEN 5: Smart Recommendations View

**Purpose:** Shows optimal role targets, roles to avoid, and audit of existing applications.

**Page Title:**
- H1: "💡 Smart Position Recommendations" — 22px, bold
- Subtitle: "Roles scored against your actual profile" — 14px, `#94A3B8`

---

#### 5A: Profile Snapshot Card

**Card:** padding: 20px, border-color: `rgba(245,158,11,0.25)` (gold tint), border-radius: 12px

**Layout:** flex, gap: 16px, flex-wrap

**Left section (flex: 1, min-width: 200px):**
- Label: "YOUR PROFILE STRENGTHS" — uppercase, 11px, `#F59E0B`, font-weight 700, margin-bottom: 8px
- Skill tags: flex-wrap list of tags
  - Each tag: padding 3px 10px, background gold-light, border gold-border, border-radius: 4px, 11px, `#F59E0B`, font-weight 500
  - Tags: MERN Stack, React.js, Node.js, IT Support, Hardware Builds, Microsoft 365, MNC Experience, Abu Dhabi Based, Immediate Joiner

**Right section (border-left: `1px solid #1A2438`, padding-left: 20px):**
- "🎯 Target Salary: 5,000+ AED" — 12px, value in white
- "📍 Preferred: Abu Dhabi / Dubai"
- "⚡ Notice Period: Immediate" — value in `#10B981`
- "📂 Projects: 3 live on GitHub" — value in `#3B82F6`

---

#### 5B: Recommended Roles Section

**Section heading:** "✅ Roles You Should Target (in priority order)" — 15px, bold, green check icon

**Role cards (grid, gap: 10px):**

Each card: `grid-template-columns: 40px 1fr auto`, gap: 16px, align-items: center
Card: padding 16px 20px, border, border-radius: 12px

**Left: Match Score Circle**
- 40×40px square, border-radius: 8px
- Background: subtle tint of tag color
- Border: tag color at 27% opacity
- Number: the match %, 16px, font-weight 800, JetBrains Mono, tag color

**Middle: Role Info**
- Title + Tag badge row (flex, gap: 8px, flex-wrap)
  - Title: 14px, bold
  - Tag: small colored badge — "Best Fit" (green) / "Strong" (blue) / "Good" (amber)
    - padding: 2px 8px, border-radius: 4px, 10px, font-weight 700, letter-spacing 0.5px
- Reason text below: 12px, `#94A3B8`, margin-top: 4px

**Right: Salary**
- Amount: 13px, bold, `#10B981`
- "per month": 10px, `#475569`, margin-top: 2px
- Text-align: right

**8 recommended roles (in order):**
| Role | Salary | Match | Tag |
|---|---|---|---|
| IT Support Engineer (L1/L2) | 5,000–8,000 AED | 95% | Best Fit |
| Junior Full Stack Developer | 5,500–9,000 AED | 92% | Best Fit |
| IT Helpdesk Analyst | 5,000–7,500 AED | 88% | Strong |
| Frontend Developer (React) | 5,500–8,500 AED | 85% | Strong |
| Web Developer | 5,000–8,000 AED | 83% | Strong |
| IT Administrator (SME) | 5,000–8,000 AED | 80% | Good |
| IT Technician (Hotels) | 4,800–7,000 AED | 74% | Good |
| Desktop Support Engineer | 5,000–7,000 AED | 72% | Good |

---

#### 5C: Avoid These Roles Section

**Section heading:** "❌ Roles to Stop Applying For" — 15px, bold, red X icon

**Cards (gap: 8px):**
Each card: padding 14px 20px, flex, gap: 14px, align-items: flex-start
Border-color: `rgba(239,68,68,0.20)`

- Left: X icon, 16px, `#EF4444`, margin-top: 2px, flex-shrink: 0
- Right: Role title in `#EF4444`, 13px, bold + Reason in `#94A3B8`, 12px

**6 roles to avoid:**
| Role | Reason |
|---|---|
| IT Manager / Senior IT Administrator | Requires 8–12 years. ATS auto-rejects. |
| UAE National / Emirati-only roles | Not eligible. Never apply. |
| AI Engineer / ML Developer | Requires specialized Python ML/LLM stack. |
| Senior Frontend (6+ years required) | Will not pass screening. |
| Cybersecurity / CISSP roles | Specialized certifications required. |
| Banking Software (Temenos/SAP) | Zero platform experience. |

---

#### 5D: Application Audit Section

**Section heading:** "📊 Your Current Application Fit Audit" — 15px, bold, chart icon gold

**Cards (sorted by score, highest first, gap: 8px):**
Each card: padding 12px 18px, `grid-template-columns: 1fr 120px 60px`, gap: 12px, align-items: center

- Left: Company name bold 13px + "— Position" in `#94A3B8` 12px
- Middle: Thin progress bar (same style as job cards)
- Right: Score % in fit color, 12px, bold, text-align: right

---

### SCREEN 6: Onboarding Flow (First Launch Only)

**Purpose:** 3-step setup wizard shown only on first launch.

**Layout:** Centered modal / full-screen overlay
Background: `rgba(8,12,24,0.95)` backdrop

**Stepper:** Horizontal, 3 steps with connector lines
- Active: gold circle with step number
- Complete: green circle with check
- Upcoming: `#1A2438` circle

**Step 1 — Profile Setup:**
- Fields: Full Name, Email, Phone, Location
- Skills multi-select: chip-style tags user clicks to toggle (pre-loaded with common skills)
- Experience summary textarea: 3 rows
- Portfolio URL + GitHub URL

**Step 2 — AI Provider Setup:**
- Provider selector: 4 options (Gemini / Grok / Anthropic / OpenAI) as large clickable cards
- Each card: provider logo area + name + "Free tier: X" label
- After selecting: API key input appears with placeholder "Paste your API key here…"
- "Test Connection" button: AI gradient, tests the key with a sample request
- Success state: green check + "Connected! Ready to generate emails."
- Note below: "Your API key is stored locally in your browser only — never sent to any server."

**Step 3 — Import Existing Data:**
- Optional step (can skip)
- Textarea: "Paste your exported XML here…"
- Or: drag-and-drop zone for XML file
- Preview: shows count of jobs found before confirming import

---

### SCREEN 7: Settings Modal

**Trigger:** User icon in header → settings option
**Style:** Centered modal, max-width: 520px, dark overlay backdrop

**Sections:**
1. Profile (name, email, phone, skills — same as onboarding Step 1)
2. AI Configuration (provider switch + API key update + test connection)
3. Notifications (toggle: follow-up reminders, browser notifications)
4. Data Management (export XML, import XML, clear all data with confirmation)

---

## 5. Feature Specifications

---

### FEATURE 1: Real-Time Duplicate Detection

**Behavior:**
1. User types in Company Name field
2. After 200ms debounce, compare against all stored companies
3. Match algorithm: exact → substring → Levenshtein distance ≤ 2
4. Case-insensitive, punctuation-stripped before comparison
5. If match found: show warning banner (Screen 3A)
6. If field cleared: hide warning banner
7. User can still submit — warning is non-blocking

**Visual states:**
- No match: normal input styling
- Match found: red border on input + warning banner above form
- Form submitted despite warning: allowed — no blocking

**Performance target:** < 50ms for up to 1,000 stored applications

---

### FEATURE 2: Live Fit Score Preview in Add Form

**Behavior:**
1. Triggers after Company Name + Position are both filled
2. Score calculated instantly using rule-based algorithm (no API)
3. Banner updates in real time as user edits position or notes fields
4. Score shown as percentage + label + contextual advice

**Scoring Rules:**
```
Base: 50 points

POSITIVE modifiers:
+ 18  Position includes "junior" or "associate"
+ 22  IT Support / Helpdesk / Desktop / Technician
+ 28  React / MERN / Node.js in position
+ 18  Full Stack / Frontend Developer
+ 14  Web Developer
+ 14  IT Administrator
+ 12  Salary between 5,000–15,000 AED
+  5  Salary above 8,000 AED

NEGATIVE modifiers:
- 30  "senior" without "junior" in same title
- 35  Manager / Director / Head of
- 25  AI Developer / ML Engineer (specialist AI)
- 20  SDET / QA / Test Engineer
- 30  Temenos / SAP Consultant
- 60  Emirati / UAE National / Family Book in notes
- 35  "10+ years" or "8+ years" in notes

Final: clamp(score, 5, 100)
```

---

### FEATURE 3: AI Cold Email Generation

**API Flow:**
```
User clicks Generate
→ App reads: selectedJob + emailType + PROFILE constant
→ Constructs prompt (job details + user profile + tone instruction)
→ Sends POST to selected AI provider endpoint
→ Streams or awaits response
→ Displays formatted email in output panel
→ User can Copy or Regenerate
```

**Prompt Structure:**
```
System: You are a professional job application coach.
        Write targeted cold emails in under 220 words.
        Start with "Subject: [line]" then blank line then body.
        Sign off with name, email, phone, portfolio, GitHub.

User: [applicant profile JSON] + [job details JSON] + [tone preference]
```

**Multi-Provider Support:**

Gemini (Default — Recommended):
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={KEY}
Body: { contents: [{ parts: [{ text: fullPrompt }] }], generationConfig: { maxOutputTokens: 800, temperature: 0.7 } }
Response: data.candidates[0].content.parts[0].text
```

Grok (xAI):
```
POST https://api.x.ai/v1/chat/completions
Headers: Authorization: Bearer {GROK_KEY}
Body: { model: "grok-beta", messages: [{role:"user", content: fullPrompt}], max_tokens: 800 }
Response: data.choices[0].message.content
```

Anthropic (Claude):
```
POST https://api.anthropic.com/v1/messages
Headers: x-api-key: {ANTHROPIC_KEY}, anthropic-version: 2023-06-01
Body: { model: "claude-sonnet-4-20250514", max_tokens: 900, messages: [{role:"user", content: fullPrompt}] }
Response: data.content[0].text
```

OpenAI:
```
POST https://api.openai.com/v1/chat/completions
Headers: Authorization: Bearer {OPENAI_KEY}
Body: { model: "gpt-4o-mini", messages: [{role:"user", content: fullPrompt}], max_tokens: 800 }
Response: data.choices[0].message.content
```

**API Key Storage:**
```javascript
// NEVER store in Firestore — localStorage only
localStorage.setItem('hiretrack_ai_key', userKey);
localStorage.setItem('hiretrack_ai_provider', 'gemini');
```

---

### FEATURE 4: Follow-Up Reminder System

**Logic:**
- If job status = "pending" AND (today - appliedDate) >= 5 days → show follow-up badge
- Badge: "Follow Up Due" in amber/orange on the job card, top-right
- "Mark Followed Up" button appears on hover of the badge
- Clicking it: sets followUpDate to today, hides badge for 5 more days

**Visual:**
- Badge position: top-right corner of job card (absolute positioned)
- Style: amber background, small, uppercase, 10px

---

### FEATURE 5: HR Contact Finder Prompt

**Trigger:** Job card has empty email field AND status = pending

**UI:** Small inline prompt on job card, below meta info row:
- "📭 No HR email captured"
- Link: "Find on Hunter.io →" opens `https://hunter.io/domain-search` in new tab
- "Add email" link: opens edit drawer for just the email field

---

## 6. Data Architecture

### Firebase Firestore Structure

```
users (collection)
  └── {userId} (document)
      ├── profile (subcollection)
      │   └── {userId} (document)
      │       ├── name: string
      │       ├── email: string
      │       ├── phone: string
      │       ├── location: string
      │       ├── skills: array<string>
      │       ├── experienceSummary: string
      │       ├── portfolioUrl: string
      │       ├── githubUrl: string
      │       ├── targetSalaryMin: number
      │       ├── preferredLocations: array<string>
      │       └── aiProvider: string (NOT the key — key is in localStorage)
      │
      └── jobs (subcollection)
          └── {jobId} (document)
              ├── companyName: string        (required)
              ├── position: string           (required)
              ├── status: string             (pending|replied|callback|rejected|offer)
              ├── platform: string
              ├── salary: string
              ├── location: string
              ├── email: string
              ├── phone: string
              ├── website: string
              ├── jobListingUrl: string
              ├── notes: string
              ├── fitScore: number           (cached, 0-100)
              ├── followUpDate: timestamp    (null if never)
              ├── appliedDate: timestamp
              ├── createdAt: timestamp
              └── updatedAt: timestamp
```

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 7. File Structure

```
hiretrackAI/
├── index.html                    # App shell — single HTML file
├── styles.css                    # All global styles + component styles
├── firebase-config.js            # Firebase credentials (user configures)
├── script.js                     # Main app logic + routing
│
├── api/
│   └── aiEmail.js                # Multi-provider AI email API router
│
├── utils/
│   ├── duplicateDetect.js        # Fuzzy match engine (Levenshtein)
│   ├── fitScore.js               # Rule-based scoring algorithm
│   └── followUp.js               # Follow-up date calculator
│
├── data/
│   └── recommendations.js        # Static role recommendation data
│
├── FIREBASE_SETUP.md             # Setup guide (existing)
└── README.md                     # Updated with new features
```

---

## 8. Development Roadmap

| Phase | Timeline | Deliverables | Priority |
|---|---|---|---|
| v1.1 | Week 1–2 | Duplicate detection (real-time) + Fit scoring on all cards + Offer status | Critical |
| v1.2 | Week 2–3 | AI Email Generator (Gemini default) + Copy/Regenerate + Multi-provider settings | Critical |
| v1.3 | Week 3–4 | Smart Recommendations screen + Application audit + Avoid list | High |
| v2.0 | Month 2 | Onboarding flow + Profile editor + Follow-up reminders + Mobile UI polish | High |
| v2.1 | Month 2–3 | HR Contact Finder prompts + Email pattern suggester + PWA manifest | Medium |
| v2.2 | Month 3 | AI-powered semantic fit scoring + Cover letter generator + Interview prep mode | Medium |
| v3.0 | Month 4+ | Chrome extension (1-click capture from LinkedIn/Indeed) + Job description analyzer | Future |

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Duplicate check < 50ms · Fit score < 10ms · AI email < 5s · Page load < 2s |
| Reliability | Firebase offline persistence — cached data accessible without internet |
| Security | API keys in localStorage only, never in Firestore or any server |
| Privacy | No analytics tracking · No email content stored · AI calls direct from browser |
| Cost | Target $0/month — Gemini free tier (1M tokens/day) covers 100+ emails daily |
| Mobile | Responsive at 375px minimum · Touch targets ≥ 44px |
| Accessibility | Keyboard navigation · ARIA labels · 4.5:1 minimum contrast ratio |
| Browsers | Chrome 90+ · Firefox 88+ · Safari 14+ · Edge 90+ |

---

## 10. User Flows Summary

### Flow A: Add New Job (standard)
```
Click "Add Job" tab
→ Type company name → duplicate check runs (200ms debounce)
→ Type position → fit score preview appears
→ Fill remaining fields
→ Click "Add Application"
→ Redirect to Dashboard — new card visible at top with fit bar
```

### Flow B: Generate AI Cold Email
```
Click "AI Email Writer" tab (or "Draft Email" on any job card)
→ Job pre-selected if coming from card, else select from list
→ Choose email type (Auto / IT Support / Developer / General)
→ Click "Generate"
→ Spinner → email appears
→ Read → edit if needed → "Copy to clipboard"
→ Toast: "Copied — remember to personalize before sending!"
```

### Flow C: Daily Job Hunt Routine
```
Morning: Check Dashboard → filter "Follow Up Due" → send follow-ups
→ Open NaukriGulf/LinkedIn → find new roles
→ Click "Add Job" → add with notes from JD
→ Check fit score preview → if < 45% consider skipping
→ After adding → "Draft Email" → copy → send directly to HR email
→ Evening: Update statuses on any callbacks received
```

---

## 11. Appendix — User Profile Data (Delin Shabu)

```json
{
  "name": "Delin Shabu",
  "email": "delinshabu.b@gmail.com",
  "phone": "+971 54 592 6143",
  "portfolio": "anomalydesignstudio.com",
  "github": "github.com/DELINSHABU",
  "location": "Abu Dhabi, UAE",
  "visaStatus": "Visit Visa — immediate joiner",
  "targetSalary": "5000+ AED/month",
  "skills": [
    "React.js", "Node.js", "Express.js", "MongoDB", "JavaScript",
    "HTML5", "CSS3", "Git", "GitHub",
    "IT Support", "Hardware Builds", "Custom PC Assembly",
    "Microsoft 365", "Office 365 Admin", "Active Directory (basic)",
    "Windows 10/11", "Linux (basic)", "macOS (basic)",
    "LAN/WAN Networking", "Wi-Fi Setup", "CCTV Configuration",
    "Streaming Setup", "Printer/Peripheral Setup"
  ],
  "experience": "Sutherland Global Services (IT Associate, Oct 2024–Oct 2025, MNC cross-cultural support) + Brototype MERN Stack internship (Jan–May 2023) + Corindians creative agency IT & video design (Jul 2019–Jan 2022) + Freelancer ongoing since May 2023 (IT support, web dev, AV setup)",
  "liveProjects": [
    { "name": "BloomCafePOS", "url": "github.com/DELINSHABU/BloomCafePOS", "type": "POS Application" },
    { "name": "StyleWav", "url": "github.com/DELINSHABU/StyleWav", "type": "E-commerce" },
    { "name": "Portfolio", "url": "anomalydesignstudio.com", "type": "Personal Portfolio" }
  ]
}
```

---

*HireTrackAI PRD v1.0 — Delin Shabu — February 2026 — Abu Dhabi, UAE*
*Document optimized for AI design tool ingestion (Google Stitch)*
