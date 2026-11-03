---
name: detail-page-restructure
description: AI-friendly restructure of pages across this static HTML wiki — single-entity detail pages and category hub/landing pages. Use when the user asks to add Quick Answer, Sources & Last Verified, remove bottom keyword-seo sections, or generally improve AI/搜索引擎 可读性.
---

# Page Restructure

Apply an AI-friendly, source-of-truth-preserving structure layer to pages in this static HTML wiki. The page under modification is always the sole source of truth — we **never invent DOM, class names, resource paths, or copy that isn't already present on the page**.

Two paths, one skill. Pick the path that matches the page type.

---

## Path A — Single-entity detail pages

### What qualifies

A page that represents **one thing** (one Stand, one Item, one Weapon, one Card, one Location). It typically has: intro/hero, mechanics/stats section, and a bottom keyword-stuffing SEO block (`id="xxx-seo"` + `.seo-block` or similar).

**Examples**: `stands/the-world/`, `items/dogbane-herb/`, `weapons/mares-leg/`, `cards/high-noon/`, `locations/horses/`

**Does NOT qualify (→ Path B or skip)**:
- Category hub pages listing many entities (e.g. `weapons/primary-weapons/`, `stands/skins/`)
- Long-form guides (`guides/beginner-guide/`, `stands/how-to-get-stand/`)
- Pure FAQ pages (these are already fine — only need Quick Answer + Sources)
- Root hub index pages (Path B)

### Five mandatory changes

Run these in order. Each step reads the original HTML first; never reorder the existing section tree.

**1. Update Article JSON-LD**

Locate the existing Article (or TechArticle) block, expand it with `mainEntityOfPage`, `dateModified` (today's date `2026-11-03`), `author`, and `publisher`. Then insert a new FAQPage block right after it.

FAQPage questions: read them from the existing FAQPage schema if the page already has one — **never invent FAQ copy**. If the page has a visible FAQ section but no FAQPage schema, extract questions and answers from the DOM (`<h3>` + `.faq-answer`) into the schema.

**2. Insert Quick Answer box**

Place `<section class="container"><div class="answer-box">…</div></section>` **directly after `<main>`**. The answer must be 3–4 sentences. Build from page-internal facts only:

- If the page has an existing FAQPage schema, use the **first acceptedAnswer** text verbatim as the opening fact.
- Otherwise extract from `<meta property="og:description">`, the hero subtitle, or the first paragraph of the mechanics section.
- Add one "where to find more" sentence pointing at How to Obtain / Uses / Stats.

**3. Delete the bottom keyword-seo section**

Match `section id="xxx-seo"` with a sibling `div.container.seo-block`. Remove the entire block. If the page has two SEO blocks, remove both.

**4. Insert Sources & Last Verified**

Add a `<section id="sources">📌 Sources &amp; Last Verified</section>` **right before the first Related section** and **after** the existing FAQ section. Date is November 3, 2026; link to `/about/` for methodology.

**5. Update `data-updated` in hero-label**

Change `data-updated="April 2026"` (or older) to `"November 2026"`.

### Optional changes (when the page fits)

Only apply when the existing section names match — if the page uses different names, skip rather than rename.

- When the page has an ability list and wants tabular presentation, convert it to `data-table-wrapper > data-table` (Key / Move / Effect).
- When the page has no existing TOC, optionally insert a "Contents" anchor card near the top of the main column.

---

## Path B — Category hub + landing pages

### What qualifies

- **Category hubs**: `stands/index.html`, `items/index.html`, `weapons/index.html`, `cards/index.html`, `locations/index.html`, `guides/index.html`
- **Root home**: `index.html`

These pages index many child pages. No single entity — they're directory indexes.

### Six mandatory changes

**1. Fix JSON-LD type**

Category hubs should have `@type: CollectionPage` + `BreadcrumbList`. Root home should have `@type: WebSite` + optional `SearchAction`. If the type is missing or wrong, add/insert — **don't delete existing blocks**.

- Category hubs missing BreadcrumbList → insert before `</head>`
- Root home missing WebSite → insert before `</head>` with `potentialAction` for search

**2. Insert Quick Answer — before the first real content section**

Hub pages usually don't have a `<main>` tag or the main wrapper starts before the hero. Find the first `<section id="xxx">` where `xxx` is NOT `*-seo`, NOT `exitlag-promo`, NOT `ads`, and insert the QA block there (right before the opening `<section>`).

QA copy is **hand-written per hub type** — cannot be auto-extracted from FAQs because hubs don't have FAQPage schemas. The existing QA templates are defined in `restructure-hub-pages.py` (`HUB_QA` dict).

**3. Delete bottom SEO sections**

Same as Path A. Remove every `<section id="xxx-seo">` block. Some hubs (`stands/index.html`, `guides/index.html`) have SEO sections that appear *before* the real content — these also get deleted (the script matches `*-seo` IDs regardless of position).

**4. Insert Sources & Last Verified — before `<footer>`**

Hub pages don't always have a Related section. Insert Sources right before the first `<footer` tag. Fallback order: before `</main>`, then before `</body>`.

**5. Update `data-updated`**

Same as Path A: `"November 2026"`.

**6. Bump `sitemap.xml` lastmod**

All hub URLs need lastmod updated to today. Run the script's sitemap step or patch manually.

---

## Deliverable checklist

Run these checks for **every page** after restructuring:

- [ ] **JSON-LD parses** — no `PARSE_FAIL` in any `ld+json` block
- [ ] **Required schema types present**:
  - Detail pages: Article + FAQPage + BreadcrumbList
  - Hub pages: CollectionPage (+ BreadcrumbList if not root)
  - Root home: WebSite
- [ ] **Bottom SEO section removed** — no `id="xxx-seo"` remaining
- [ ] **Quick Answer present** — `class="answer-box"` on the page
- [ ] **Sources present** — `id="sources"` on the page
- [ ] **`data-updated` reflects current month** — `"November 2026"` or whatever month suffix
- [ ] **No fabrication** — every sentence, number, and link was already somewhere on the page before we touched it
- [ ] **`sitemap.xml` lastmod bumped** for the page URL

---

## Scripts

Two deterministic Python scripts live under `scripts/`. Run from the repo root.

### `scripts/restructure-detail-pages.py` — Path A driver

```bash
# Restructure specific pages
python3 scripts/restructure-detail-pages.py stands/the-world items/pickaxe

# Auto-discover ALL remaining detail pages across stands/ items/ weapons/ cards/ locations/ guides/
python3 scripts/restructure-detail-pages.py --discover
```

**What it does**: reads each target, applies the five mandatory Path A changes, writes back. Skips pages already restructured (presence of `id="sources"` is the idempotency flag). Supports TechArticle JSON-LD variants.

**Edge cases handled**:
- Pages without `<main>` → inserts QA before first real `<section>`
- Pages without existing Article block → appends Article + FAQPage before BreadcrumbList
- Pages with multiple SEO blocks → removes all

### `scripts/restructure-hub-pages.py` — Path B driver

```bash
# Restructure ALL hub + landing pages (7 pages total)
python3 scripts/restructure-hub-pages.py
```

**What it does**: runs all six mandatory Path B changes on every hub defined in `HUB_CONFIG` at the bottom of the file (currently 7 entries). Same idempotency flag: presence of `id="sources"` means skip.

**QA copy**: hand-written templates per hub type, stored in the `HUB_QA` dict inside the script. Templates are facts-only — each sentence was verified against the existing content of the target page before being added.

**Edge cases handled**:
- `cards/index.html` and `guides/index.html` — first `<section id>` is a SEO section; script skips `*-seo` IDs when locating the insertion point for QA
- `locations/index.html` — original type is `WebPage`, NOT `CollectionPage`; script preserves original type and only adds BreadcrumbList
- `weapons/index.html` — uses two-column `page-toc-main` layout; if script fails to match, do an `Edit` to the exact anchor

### Running order when both paths apply

1. Run Path A on all detail pages (`--discover`) — ~27 pages, mostly leaf pages
2. Run Path B on all hubs — 7 pages, category indexes and root home
3. Run the final verification checklist above on every page

### What NOT to do

- Don't run either script on `ru/` directories (multi-language mirrors)
- Don't invent FAQ copy — extract from existing DOM or leave it out
- Don't replace the entire HTML file — every edit is targeted block-level replacement
- Don't use these scripts for new-page creation (they're restructure-only, not bootstrap)
