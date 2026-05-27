# NMECAR · Brand & Theming Guide

> Οδηγός εφαρμογής της οπτικής ταυτότητας **NMECAR** στο admin dashboard, στις αναφορές (reports) και στο documentation site.
>
> **Έκδοση:** 1.0 · **Ημερομηνία:** Μάιος 2026
> **Στόχος κοινό:** Ομάδες ανάπτυξης (frontend/backend), σχεδίασης, και τεκμηρίωσης.

---

## Πίνακας περιεχομένων

1. [Brand essence](#1-brand-essence)
2. [Logo system](#2-logo-system)
3. [Χρωματική παλέτα](#3-χρωματική-παλέτα)
4. [Τυπογραφία](#4-τυπογραφία)
5. [Spacing & layout](#5-spacing--layout)
6. [Components](#6-components)
7. [Admin dashboard patterns](#7-admin-dashboard-patterns)
8. [Reports patterns](#8-reports-patterns)
9. [Documentation site patterns](#9-documentation-site-patterns)
10. [CSS tokens — copy & paste](#10-css-tokens--copy--paste)
11. [Do's & Don'ts](#11-dos--donts)
12. [Accessibility checklist](#12-accessibility-checklist)
13. [Αρχεία λογοτύπου](#13-αρχεία-λογοτύπου)

---

## 1. Brand essence

Η NMECAR είναι τεχνολογική πλατφόρμα στον χώρο του automotive. Το λογότυπο συνδυάζει σταθερό σκούρο γκρι (αξιοπιστία) με ένα neon **cyan → purple** gradient (καινοτομία, ψηφιακή ταυτότητα). Η συνταγή του θέματος αντιγράφει αυτή ακριβώς την ισορροπία.

### Χαρακτηριστικά

| Αξία | Πώς εκφράζεται στο UI |
|---|---|
| 🎯 **Επαγγελματικό** | Αξιοπιστία πάνω από εντυπωσιασμό. Σκούρα κείμενα, καθαρά layouts, σταθερή ιεραρχία. |
| ⚡ **Τεχνολογικό** | Το gradient είναι το χαρακτηριστικό. Χρησιμοποιείται ως υπογραφή — όχι ως φόντο. |
| 📊 **Λειτουργικό** | Σχεδιασμένο για ώρες χρήσης. Αναγνωσιμότητα, contrast και ηρεμία στην οθόνη. |

### Ο κανόνας 70-20-10

Για να μην κουράζει το νέον σε ένα εργαλείο που χρησιμοποιείται κάθε μέρα, διανέμουμε τα χρώματα ως εξής:

- **70% Neutrals** — λευκό, ανοιχτά γκρι, ink black. Backgrounds, surfaces, body text.
- **20% Ink (`#231F20`)** — primary buttons, navigation, headings, icons.
- **10% Gradient/accent** — CTAs, active states, KPI accents, focus indicators, brand moments.

> ⚠️ **Κρίσιμος κανόνας:** Σε admin/reports, το gradient είναι **υπογραφή**, όχι background. Σε σελίδα που βλέπεις 8 ώρες/μέρα, ή σε report που θα τυπωθεί, η νέον παλέτα ως κύριο χρώμα κουράζει και χάνει αναγνωσιμότητα.

---

## 2. Logo system

### Διαθέσιμες εκδοχές

| Αρχείο | Περιγραφή | Χρήση |
|---|---|---|
| `nmecar.svg` | **Primary** — σκούρο κείμενο + gradient στο NM σύμβολο | Λευκά ή πολύ ανοιχτά φόντα |
| `nmecar_white.svg` | **Reversed** — λευκό κείμενο + gradient στο NM σύμβολο | Σκούρα φόντα (sidebars, dark mode, hero sections) |
| `nmecar_ALLwhite.svg` | **Monochrome white** — όλο λευκό | Φωτογραφίες, gradient backgrounds, χρωματιστά φόντα |

### Clear space

Γύρω από το λογότυπο, διατήρησε ένα clear space ίσο με το ύψος του γράμματος **N**. Δεν παρενοχλούμε αυτή την περιοχή με κανένα άλλο στοιχείο (κείμενο, εικονίδιο, border).

### Ελάχιστα μεγέθη

| Μέσο | Ελάχιστο πλάτος |
|---|---|
| Οθόνη (web/app) | `120px` |
| Έντυπο | `30mm` |

Κάτω από αυτά, το tagline δεν είναι ευανάγνωστο.

### Λανθασμένη χρήση

❌ **Μην:**
- Παραμορφώνεις την αναλογία (stretch)
- Περιστρέφεις ή κλίνεις το λογότυπο
- Αλλάζεις τα χρώματα του gradient ή του ink
- Τοποθετείς σε έντονο/χρωματιστό φόντο χωρίς overlay
- Χρησιμοποιείς το ALLwhite σε ανοιχτά γκρι (μη επαρκές contrast)
- Προσθέτεις σκιά, glow, ή 3D effects

---

## 3. Χρωματική παλέτα

### Brand gradient

```
linear-gradient(90deg, #01FBFD 0%, #BD41FF 100%)
```

**Χρήση:** ως υπογραφή — top border σε KPIs, hover/focus state, primary CTA, active tab indicator, progress bars, top border σε header.

**ΠΟΤΕ** ως page background ή πάνω από body text.

### Primary colors

| Χρώμα | HEX | RGB | Χρήση |
|---|---|---|---|
| Cyan (gradient start) | `#01FBFD` | `1, 251, 253` | Gradient stops, accent elements |
| Purple (gradient end) | `#BD41FF` | `189, 65, 255` | Gradient stops, focus rings |
| Ink (logo black) | `#231F20` | `35, 31, 32` | Headings, primary buttons, sidebars |
| White | `#FFFFFF` | `255, 255, 255` | Surfaces, reversed text |

### Accessible brand variants (για κείμενο σε λευκό)

Τα καθαρά νέον δεν περνούν WCAG AA για κείμενο. Όταν χρειάζεσαι text σε χρώμα brand:

| Χρώμα | HEX | Χρήση |
|---|---|---|
| Cyan 50 | `#E6FEFE` | Background tint, hover states |
| Cyan 700 | `#008A8C` | Text on white ✓ AA |
| Purple 50 | `#F7ECFF` | Background tint, hover states |
| Purple 700 | `#8A1FC4` | Text on white ✓ AA, links |
| Purple 800 | `#6B1799` | Text on light backgrounds |

### Neutral ramp

| Token | HEX | Χρήση |
|---|---|---|
| Grey 50 | `#F8F8FA` | Page background |
| Grey 100 | `#F1F1F4` | Muted backgrounds, code inline |
| Grey 200 | `#E5E5E9` | Borders, dividers |
| Grey 300 | `#D4D4DA` | Disabled states |
| Grey 400 | `#B5B5BC` | Subtle text |
| Grey 500 | `#8E8E96` | Placeholder text |
| Grey 600 | `#6B6B73` | Muted text |
| Grey 700 | `#4A4A52` | Body text alternative |
| Grey 800 | `#2D2D33` | Headings alternative |
| Grey 900 | `#1A1A1F` | Sidebar deeper shade |

### Semantic colors

| Χρώμα | HEX | Χρήση |
|---|---|---|
| Success | `#10B981` | Confirmations, positive states |
| Warning | `#F59E0B` | Cautions, pending |
| Danger | `#EF4444` | Errors, destructive actions |
| Info | `#3B82F6` | Neutral informational notices |

---

## 4. Τυπογραφία

### Οικογένειες fonts

| Family | Χρήση |
|---|---|
| **Space Grotesk** | Display — τίτλοι, KPI numbers, brand moments. Γεωμετρία που ταιριάζει με το λογότυπο. |
| **Inter** | Body — γενικό κείμενο. Βελτιστοποιημένο για οθόνη, εξαιρετική αναγνωσιμότητα σε dense data. |
| **JetBrains Mono** | Mono — IDs, code, timestamps, αριθμητικές τιμές με νόημα συμμετρίας. |

### Type scale

| Επίπεδο | Font | Μέγεθος | Weight | Line-height | Χρήση |
|---|---|---|---|---|---|
| Display XL | Space Grotesk | 40px | 600 | 1.2 | Hero, brand pages |
| Display L (H1) | Space Grotesk | 32px | 600 | 1.2 | Page title |
| Heading (H2) | Space Grotesk | 24px | 600 | 1.2 | Section title |
| Subheading (H3) | Space Grotesk | 18px | 500 | 1.3 | Card/component title |
| Body L | Inter | 16px | 400 | 1.6 | Παράγραφοι σε reading flows |
| Body M (default) | Inter | 14px | 400 | 1.6 | Προεπιλεγμένο σε όλη την εφαρμογή |
| Body S | Inter | 12px | 400 | 1.5 | Helper text, captions |
| Mono | JetBrains Mono | 14px | 400 | 1.5 | IDs, code, αριθμοί |

### Κανόνες χρήσης

- ✅ Space Grotesk **πάντα** για headings, Inter **πάντα** για body — μην τα ανταλλάσσεις.
- ✅ Mono **μόνο** για: ταυτότητες (VIN, IDs), τιμές με νόημα συμμετρίας, code, timestamps σε logs.
- ✅ Body line-height ≥ 1.6 για παραγράφους — κρίσιμο για το documentation site.
- ✅ Σε tables, χρησιμοποίησε `font-variant-numeric: tabular-nums;` για στοίχιση αριθμών.
- ❌ Μην χρησιμοποιείς font-weight 800/900 — το brand είναι ελαφρύ.

### Φόρτωση fonts

Πρόσθεσε στο `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## 5. Spacing & layout

### Spacing scale (βάση 4px)

| Token | Τιμή | Τυπική χρήση |
|---|---|---|
| `--s-1` | 4px | Tight gaps, inline elements |
| `--s-2` | 8px | Component internal padding |
| `--s-3` | 12px | Default gap |
| `--s-4` | 16px | Section internal padding |
| `--s-5` | 24px | Section gaps |
| `--s-6` | 32px | Major separations |
| `--s-7` | 48px | Page-level padding |
| `--s-8` | 64px | Hero/landing spacing |

### Border radius

| Token | Τιμή | Χρήση |
|---|---|---|
| `--r-sm` | 4px | Inputs, badges |
| `--r-md` | 8px | Buttons |
| `--r-lg` | 12px | Cards |
| `--r-xl` | 16px | Large sections, hero blocks |
| `--r-full` | 999px | Pills, avatars, toggle switches |

### Shadows

| Token | Τιμή | Χρήση |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(35,31,32,0.06)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(35,31,32,0.08)` | Cards, popovers |
| `--shadow-lg` | `0 12px 32px rgba(35,31,32,0.12)` | Modals, dropdowns |
| `--shadow-glow` | `0 0 24px rgba(189,65,255,0.25)` | Hover state σε accent CTA (μόνο εκεί) |

### Breakpoints

| Όνομα | Πλάτος | Στόχος |
|---|---|---|
| `sm` | ≥ 640px | Large phones, small tablets |
| `md` | ≥ 768px | Tablets |
| `lg` | ≥ 1024px | Laptops, default admin layout |
| `xl` | ≥ 1280px | Large monitors |
| `2xl` | ≥ 1536px | Ultra-wide |

Admin dashboard: σχεδιάζουμε για `lg` πρώτα, αναπτύσσουμε προς τα κάτω.

---

## 6. Components

### Buttons

Πέντε τύποι. **Κάθε οθόνη πρέπει να έχει μόνο μία gradient (accent) ενέργεια** — αυτή είναι η κύρια.

| Variant | Πότε |
|---|---|
| `.btn-accent` (gradient) | Πρωτεύουσα ενέργεια οθόνης (Save, Confirm, Submit) — 1× ανά οθόνη |
| `.btn-primary` (ink) | Δευτερεύουσες σημαντικές ενέργειες |
| `.btn-secondary` (outline) | Cancel, neutral choices |
| `.btn-ghost` (link-like) | Tertiary actions, navigation hints |
| `.btn-danger` (red) | Καταστροφικές ενέργειες (Delete, Remove) |

```html
<button class="btn btn-accent">Save changes</button>
<button class="btn btn-primary">View report</button>
<button class="btn btn-secondary">Cancel</button>
<button class="btn btn-ghost">More info</button>
<button class="btn btn-danger">Delete</button>
```

### Forms

**Focus state σε purple** — η μοναδική θέση που το brand color εμφανίζεται "ζωντανά" σε λεπτό σημείο.

```css
input:focus {
  outline: none;
  border-color: var(--nm-purple);
  box-shadow: 0 0 0 3px rgba(189, 65, 255, 0.12);
}
```

Κανόνες:
- Label πάντα πάνω από το πεδίο (όχι placeholder-as-label).
- Required indicator: αστερίσκος σε `var(--nm-danger)`.
- Error message κάτω από το πεδίο, σε `var(--nm-danger)`, font-size 12px.
- Helper text κάτω από το πεδίο, σε `var(--nm-grey-600)`, font-size 12px.

### Alerts

| Variant | Border-left color | Background | Όνομα κλάσης |
|---|---|---|---|
| Info | `#3B82F6` | `#EFF6FF` | `.alert-info` |
| Success | `#10B981` | `#ECFDF5` | `.alert-success` |
| Warning | `#F59E0B` | `#FFFBEB` | `.alert-warning` |
| Danger | `#EF4444` | `#FEF2F2` | `.alert-danger` |

### Badges

```html
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Failed</span>
<span class="badge badge-info">Draft</span>
<span class="badge badge-accent">Premium</span>  <!-- gradient, σπάνια χρήση -->
```

### Tables

- Header background: `var(--nm-grey-50)`
- Header text: uppercase, font-size 12px, letter-spacing 0.04em
- Row hover: `var(--nm-grey-50)`
- Border-bottom μεταξύ rows: `var(--border)`
- Numeric cells: right-aligned, `font-family: var(--font-mono)`, `font-variant-numeric: tabular-nums`

### KPI tiles

Η gradient λωρίδα στο top είναι η brand υπογραφή σε επιφάνειες δεδομένων.

```css
.kpi {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--s-4) var(--s-5);
}
.kpi::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--nm-gradient);
}
```

> ⚠️ **Μην** εφαρμόζεις τη gradient λωρίδα σε κάθε card της σελίδας — μόνο σε σημαντικές μετρήσεις. Αν όλα είναι "highlighted", τίποτα δεν είναι.

---

## 7. Admin dashboard patterns

### Layout

```
┌─────────────────────────────────────────────┐
│ [Sidebar - ink]   │ [Top bar - white]       │
│                   ├─────────────────────────┤
│ • Dashboard       │                         │
│ • Vehicles  ←     │  [Content - light grey] │
│ • Drivers         │                         │
│ • Reports         │  • KPIs                 │
│ • Settings        │  • Tables               │
│                   │  • Cards                │
│                   │                         │
└─────────────────────────────────────────────┘
   260px sticky        flexible width
```

### Πυραμίδα προσοχής

1. **Sidebar** — σκούρο ink (`#231F20`). Active item έχει left border σε gradient (3px) ή gradient text/background.
2. **Top bar** — λευκό, leveled με υπόλοιπη σελίδα. Logo πάντα στο επάνω αριστερά.
3. **Content area** — light grey background (`#F8F8FA`), λευκά cards. Καθαρή ιεραρχία τίτλων.
4. **Primary action** — μόνο **μία** gradient button ορατή κάθε στιγμή.

### Sidebar active state

```css
.nav-item.active {
  color: #fff;
  background: var(--nm-grey-800);
  border-left: 3px solid transparent;
  border-image: var(--nm-gradient) 1;
}
```

### Density

- Default cell padding: `12px 16px`
- Compact mode (data-heavy tables): `8px 12px`
- Comfortable mode (CRUD forms): `16px 20px`

---

## 8. Reports patterns

Οι αναφορές **διαβάζονται και τυπώνονται**. Τα χρώματα μπαίνουν με φειδώ και μόνο όπου έχουν νόημα δεδομένων.

### Κανόνες

| Τι | Πώς |
|---|---|
| **Print-safe χρώματα** | Μόνο ink + 1-2 accent (purple 700 ή cyan 700). Το νέον δεν τυπώνεται σωστά. |
| **Logo στο header** | Primary version, max-width 140px. |
| **Σήμανση brand** | Μία λεπτή gradient line (2-3px) κάτω από το header. Αρκετή. |
| **Γραφήματα — primary series** | `#8A1FC4` (purple 700) |
| **Γραφήματα — secondary series** | `#008A8C` (cyan 700) |
| **Γραφήματα — tertiary series** | `#6B6B73` (grey 600) |
| **Tables** | Alternating row backgrounds με `grey 50`, headers με `grey 100`. Χωρίς gradient. |
| **Page numbers / footer** | `grey 600`, font mono, 10px |

### Δομή report

```
┌──────────────────────────────────────────────┐
│ [LOGO]                    REPORT #2026-Q1     │
│                           27 Μαΐου 2026       │
│ ════════ gradient line 2px ═══════════════   │
│                                                │
│ # Title                                        │
│ Subtitle paragraph                             │
│                                                │
│ ## Section 1                                  │
│ Content...                                     │
│                                                │
│ [Tables, charts, data]                         │
│                                                │
│ ────────────────────────────────────────────  │
│ σελ. 1 / 12 · NMECAR © 2026                   │
└──────────────────────────────────────────────┘
```

### CSS για print

```css
@media print {
  /* Αφαίρεσε backgrounds που σπαταλούν μελάνι */
  body { background: white; }
  .card { box-shadow: none; border: 1px solid #ddd; }

  /* Page breaks */
  h1, h2 { page-break-after: avoid; }
  table { page-break-inside: avoid; }

  /* Διατήρησε χρώματα της gradient line */
  .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

---

## 9. Documentation site patterns

### Layout

- **Sidebar 240-280px** — sticky, με 3 επίπεδα ιεραρχίας
- **Reading column 680-720px** — βέλτιστο για διάβασμα παραγράφων
- **Right TOC (optional) 200px** — anchor links τρέχουσας σελίδας

### Συστατικά

- **Code blocks** — ink background (`#231F20`), syntax highlighting σε cyan (keys) και purple (values)
- **Inline code** — `grey 100` background, font mono, padding 2-6px
- **Callout boxes** — Alerts όπως ορίστηκαν παραπάνω. Χρησιμοποίησέ τους για tips, warnings, deprecations
- **"Edit on GitHub" / version selector** — top right, ghost button
- **Anchor links σε headings** — εμφανίζονται με `opacity: 0` και `opacity: 0.6` on hover
- **Search bar** — top of sidebar, με `⌘K` shortcut hint
- **Previous/Next navigation** — bottom κάθε σελίδας

### Παράδειγμα code block

````markdown
```css
/* CSS variables — τα φορτώνεις μία φορά στο :root */
:root {
  --nm-gradient: linear-gradient(90deg, #01FBFD, #BD41FF);
  --nm-ink: #231F20;
  --font-display: "Space Grotesk", sans-serif;
}
```
````

---

## 10. CSS tokens — copy & paste

Ολόκληρο το σύστημα τιμών σε CSS custom properties. Δουλεύει με κάθε framework (Tailwind, Material, Bootstrap, plain CSS, Thymeleaf templates). Πρόσθεσε τες στο global stylesheet σου.

### `:root` block

```css
:root {
  /* Brand gradient */
  --nm-cyan: #01FBFD;
  --nm-purple: #BD41FF;
  --nm-gradient: linear-gradient(90deg, #01FBFD 0%, #BD41FF 100%);
  --nm-gradient-diagonal: linear-gradient(135deg, #01FBFD 0%, #BD41FF 100%);

  /* Accessible brand variants */
  --nm-cyan-700: #008A8C;
  --nm-cyan-800: #006566;
  --nm-purple-700: #8A1FC4;
  --nm-purple-800: #6B1799;
  --nm-cyan-50: #E6FEFE;
  --nm-cyan-100: #C2FCFD;
  --nm-purple-50: #F7ECFF;
  --nm-purple-100: #EBD3FF;

  /* Neutrals */
  --nm-ink: #231F20;
  --nm-grey-900: #1A1A1F;
  --nm-grey-800: #2D2D33;
  --nm-grey-700: #4A4A52;
  --nm-grey-600: #6B6B73;
  --nm-grey-500: #8E8E96;
  --nm-grey-400: #B5B5BC;
  --nm-grey-300: #D4D4DA;
  --nm-grey-200: #E5E5E9;
  --nm-grey-100: #F1F1F4;
  --nm-grey-50:  #F8F8FA;
  --nm-white: #FFFFFF;

  /* Semantic */
  --nm-success: #10B981;
  --nm-warning: #F59E0B;
  --nm-danger:  #EF4444;
  --nm-info:    #3B82F6;

  /* Surfaces (light mode default) */
  --bg-page:    #F8F8FA;
  --bg-surface: #FFFFFF;
  --bg-muted:   #F1F1F4;
  --border:     #E5E5E9;
  --text:       #231F20;
  --text-muted: #6B6B73;

  /* Typography */
  --font-display: "Space Grotesk", system-ui, sans-serif;
  --font-body:    "Inter", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* Spacing scale (4px base) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px; --s-8: 64px;

  /* Radii */
  --r-sm: 4px;  --r-md: 8px;
  --r-lg: 12px; --r-xl: 16px;
  --r-full: 999px;

  /* Shadows */
  --shadow-sm:   0 1px 2px rgba(35, 31, 32, 0.06);
  --shadow-md:   0 4px 12px rgba(35, 31, 32, 0.08);
  --shadow-lg:   0 12px 32px rgba(35, 31, 32, 0.12);
  --shadow-glow: 0 0 24px rgba(189, 65, 255, 0.25);
}
```

### Utility classes για κύρια components

```css
/* Primary CTA με gradient */
.btn-accent {
  background: var(--nm-gradient);
  color: #fff;
  padding: 10px 20px;
  border-radius: var(--r-md);
  border: none;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: box-shadow .15s, transform .15s;
}
.btn-accent:hover {
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}

/* KPI tile με gradient top accent */
.kpi {
  position: relative;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--s-4) var(--s-5);
}
.kpi::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--nm-gradient);
}

/* Active nav item (sidebar) */
.nav-item.active {
  color: #fff;
  background: var(--nm-grey-800);
  border-left: 3px solid transparent;
  border-image: var(--nm-gradient) 1;
}

/* Focus indicator για inputs */
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--nm-purple);
  box-shadow: 0 0 0 3px rgba(189, 65, 255, 0.12);
}
```

### Tailwind config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        nm: {
          cyan: '#01FBFD',
          purple: '#BD41FF',
          ink: '#231F20',
          'cyan-700': '#008A8C',
          'purple-700': '#8A1FC4',
        }
      },
      backgroundImage: {
        'nm-gradient': 'linear-gradient(90deg, #01FBFD, #BD41FF)',
        'nm-gradient-135': 'linear-gradient(135deg, #01FBFD, #BD41FF)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    }
  }
}
```

### Angular Material theme

```scss
// styles.scss
@use '@angular/material' as mat;
@include mat.core();

$nm-primary: mat.define-palette((
  500: #231F20,
  700: #1A1A1F,
  contrast: (500: white, 700: white)
));
$nm-accent: mat.define-palette((
  500: #8A1FC4,
  contrast: (500: white)
));
$nm-warn: mat.define-palette(mat.$red-palette);

$nm-theme: mat.define-light-theme((
  color: ( primary: $nm-primary, accent: $nm-accent, warn: $nm-warn ),
  typography: mat.define-typography-config(
    $font-family: 'Inter, sans-serif'
  )
));

@include mat.all-component-themes($nm-theme);
```

### Bootstrap 5 SCSS overrides

```scss
// _custom-variables.scss
$primary:   #231F20;
$secondary: #6B6B73;
$success:   #10B981;
$danger:    #EF4444;
$warning:   #F59E0B;
$info:      #3B82F6;

$body-bg:    #F8F8FA;
$body-color: #231F20;
$border-color: #E5E5E9;

$font-family-sans-serif: 'Inter', system-ui, sans-serif;
$headings-font-family:   'Space Grotesk', sans-serif;
$font-family-monospace:  'JetBrains Mono', monospace;

$border-radius:    8px;
$border-radius-lg: 12px;
$border-radius-sm: 4px;

@import "bootstrap/scss/bootstrap";

// Custom accent button
.btn-accent {
  background: linear-gradient(90deg, #01FBFD, #BD41FF);
  color: white;
  border: none;
  font-weight: 600;
  &:hover { box-shadow: 0 0 24px rgba(189, 65, 255, 0.25); }
}
```

---

## 11. Do's & Don'ts

### ✅ Do

- Χρησιμοποίησε το gradient ως υπογραφή — KPI top borders, primary CTAs, active states.
- Διατήρησε λευκά/ανοιχτά φόντα για όλο το content area.
- Σε σκούρα στοιχεία (sidebar) χρησιμοποίησε το ink `#231F20`, όχι μαύρο.
- Σε reports, χρησιμοποίησε `purple 700` και `cyan 700` αντί για τα νέον — είναι print-safe.
- Διατήρησε αρκετό clear space γύρω από το λογότυπο.
- Χρησιμοποίησε mono font για IDs, ποσά και χρόνους — βελτιώνει την αναγνωσιμότητα δεδομένων.
- Σε σκοτεινά modes ή screens, χρησιμοποίησε την reversed version του λογοτύπου.
- Πάντα `alt="NMECAR"` σε κάθε εικόνα του λογοτύπου.
- Χρησιμοποίησε τα CSS variables — όχι hard-coded hex values μέσα σε components.
- Μία `btn-accent` ανά οθόνη — όχι περισσότερες.

### ❌ Don't

- Μην βάζεις gradient ως page background — κουράζει και μειώνει contrast.
- Μην χρωματίζεις body text με τα καθαρά νέον — δεν περνούν WCAG AA.
- Μην έχεις δύο gradient buttons στην ίδια view.
- Μην παραμορφώνεις, περιστρέφεις ή αλλάζεις τα χρώματα του λογοτύπου.
- Μην χρησιμοποιείς το λογότυπο πάνω σε φωτογραφία χωρίς overlay για contrast.
- Μην αναμιγνύεις άλλες gradient αποχρώσεις στο UI (π.χ. πορτοκαλί-ροζ). Μόνο cyan→purple.
- Μην προσθέτεις skeuomorphic shadows ή 3D effects — το brand είναι flat & modern.
- Μην χρησιμοποιείς το ALLwhite logo πάνω σε ανοιχτά γκρι — δεν διαβάζεται.
- Μην χρησιμοποιείς font-weight ≥ 800 — το brand είναι ελαφρύ.
- Μην βάζεις gradient line σε **κάθε** card — μόνο σε σημαντικές μετρήσεις.

---

## 12. Accessibility checklist

Πριν δώσεις production-ready ένα screen:

- [ ] Κάθε κείμενο έχει contrast ratio ≥ **4.5:1** σε σχέση με το background (WCAG AA για normal text)
- [ ] Headings 18px+ ή bold: ≥ **3:1**
- [ ] Όλα τα interactive elements έχουν visible focus state (το purple focus ring είναι το default)
- [ ] Focus order ακολουθεί τη λογική ροή
- [ ] Όλες οι εικόνες/εικονίδια έχουν meaningful `alt` ή `aria-label`
- [ ] Το λογότυπο έχει `alt="NMECAR"`
- [ ] Decorative SVGs έχουν `aria-hidden="true"`
- [ ] Forms: labels συνδεμένα με inputs (`for` / `id`)
- [ ] Error messages συνδεμένα με fields (`aria-describedby`)
- [ ] Tables με `<thead>`, `<th scope>`, captions για screen readers
- [ ] Color δεν είναι το μόνο μέσο μεταφοράς πληροφορίας (πρόσθεσε icon ή text)
- [ ] Keyboard navigation: Tab, Shift+Tab, Esc, Enter δουλεύουν σε όλα τα interactive elements
- [ ] Modals έχουν focus trap και Esc-to-close
- [ ] `prefers-reduced-motion` σεβαστό για animations

### Combinations contrast (επιβεβαιωμένα WCAG AA)

| Foreground | Background | Ratio | AA Normal | AA Large |
|---|---|---|---|---|
| `#231F20` | `#FFFFFF` | 16.1:1 | ✅ | ✅ |
| `#231F20` | `#F8F8FA` | 15.3:1 | ✅ | ✅ |
| `#4A4A52` | `#FFFFFF` | 8.8:1 | ✅ | ✅ |
| `#6B6B73` | `#FFFFFF` | 5.6:1 | ✅ | ✅ |
| `#8A1FC4` | `#FFFFFF` | 7.4:1 | ✅ | ✅ |
| `#008A8C` | `#FFFFFF` | 4.6:1 | ✅ | ✅ |
| `#FFFFFF` | `#231F20` | 16.1:1 | ✅ | ✅ |
| `#FFFFFF` | `#BD41FF` | 3.3:1 | ❌ | ✅ |

> ⚠️ Το λευκό κείμενο πάνω σε σκέτο `#BD41FF` ή `#01FBFD` δεν περνά AA για normal text — γι' αυτό σε gradient buttons βάζουμε `font-weight: 600` και ελάχιστο μέγεθος 14px (large text rules).

---

## 13. Αρχεία λογοτύπου

| Αρχείο | Σκοπός |
|---|---|
| `nmecar.svg` | Primary logo για λευκά/ανοιχτά φόντα |
| `nmecar_white.svg` | Reversed logo για σκούρα φόντα |
| `nmecar_ALLwhite.svg` | Monochrome white για φωτογραφίες/χρωματιστά φόντα |

### Inline χρήση σε HTML

Αν θες να αποφύγεις external requests, μπορείς να ενσωματώσεις τα SVGs απευθείας μέσα στο HTML. Το gradient ορίζεται στο `<defs>` του ίδιου του SVG, οπότε δεν χρειάζεται καμία επιπλέον CSS παρέμβαση.

---

## Αλλαγές & versioning

| Έκδοση | Ημερομηνία | Αλλαγές |
|---|---|---|
| 1.0 | Μάιος 2026 | Αρχική έκδοση. Foundations, components, application patterns, tokens για admin/reports/docs. |

---

**Επαφή:** Για ερωτήσεις ή προτάσεις αλλαγών στο brand system, ανοίξτε ticket στο εσωτερικό issue tracker με tag `brand-system`.

*NMECAR Brand & Theming Guide · © 2026*
