---
inclusion: auto
description: Standard workflow and checklist for creating new pages on the Bridger Western Wiki. Enforces SEO structure, analytics, ads, content rules, and post-creation file updates.
---

# Bridger Western Wiki — New Page Standard

Every time a new HTML page is created for this wiki, follow ALL steps below in order without skipping.

---

## Step 1 — Page Structure

Use these exact boilerplate elements. No exceptions.

### Head (required elements in order)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Primary SEO -->
<title>[Page Title – max 60 chars] – Bridger Western [Year]</title>
<meta name="description" content="[120-160 chars]">
<meta name="keywords" content="[comma separated keywords]">
<link rel="canonical" href="https://bridgerwestern.cc/[path]/">

<!-- AI Crawlers -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="googlebot" content="index, follow">
<link rel="alternate" type="text/plain" href="https://bridgerwestern.cc/llms-full.txt">

<!-- Open Graph (required for Discord rich cards) -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://bridgerwestern.cc/[path]/">
<meta property="og:title" content="[emoji] [Title]">
<meta property="og:description" content="[emoji keywords] | [emoji keywords] | ...">
<meta property="og:image" content="https://bridgerwestern.cc/background.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="[description]">
<meta property="og:site_name" content="Bridger Western Wiki & Trello">
<meta property="og:locale" content="en_US">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@bridgerwestern">
<meta name="twitter:creator" content="@bridgerwestern">
<meta name="twitter:title" content="[emoji] [Title]">
<meta name="twitter:description" content="[short description]">
<meta name="twitter:image" content="https://bridgerwestern.cc/background.png">
<meta name="twitter:image:alt" content="[description]">

<!-- Schema.org: choose the most appropriate type -->
<!-- FAQPage for FAQ pages, Guide for guides, CollectionPage for index pages, TechArticle for item/weapon pages -->
<script type="application/ld+json">{ ... }</script>

<!-- BreadcrumbList Schema (always required) -->
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bridgerwestern.cc/" },
        { "@type": "ListItem", "position": 2, "name": "[Section]", "item": "https://bridgerwestern.cc/[section]/" },
        { "@type": "ListItem", "position": 3, "name": "[Page]", "item": "https://bridgerwestern.cc/[path]/" }
    ]
}
</script>

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Rye&family=Caveat:wght@600&family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="/favicon.png">

<!-- Ahrefs Analytics -->
<script src="https://analytics.ahrefs.com/analytics.js" data-key="nTbRFoNsJOu5uckpUk+qlg" async></script>

<!-- Fuse.js -->
<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js"></script>

<link rel="stylesheet" href="/style.css">

<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FQ74EMR38G"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-FQ74EMR38G');
</script>

<!-- Load components (dynamic nav) — path depends on directory depth -->
<!-- Root:       /js/components.js  -->
<!-- 1-level:    ../js/components.js  (e.g. /stands/) -->
<!-- 2-level:    ../../js/components.js  (e.g. /stands/faq/) -->
<script src="[correct-depth]/js/components.js"></script>
```

### Body structure (required)

```html
<body>
    <!-- Dynamic nav — NO static header/nav block -->
    <div id="nav-container"></div>

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <div class="container">
            <a href="/">Home</a> <span aria-hidden="true">→</span> <a href="/[section]/">[Section]</a> <span aria-hidden="true">→</span> <span>[Page]</span>
        </div>
    </nav>

    <!-- Hero (required on every page) -->
    <section class="hero">
        <div class="container">
            <span class="handwritten handwritten-note">[flavour text...]</span>
            <p class="hero-label">[Section label]</p>
            <h1>[Main Title]<br><span class="hero-sub">[Subtitle]</span></h1>
            <p class="subtitle">[1-2 sentence description]</p>
            <!-- optional hero-cta buttons -->
        </div>
    </section>

    <main id="main-content">

    <!-- Mobile TOC (required) -->
    <div class="container" style="padding-top: 16px;">
        <div class="sidebar-mobile-toc">
            <button class="sidebar-mobile-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                On This Page <span>▾</span>
            </button>
            <div class="sidebar-mobile-dropdown" id="page-toc-mobile"></div>
        </div>
    </div>

    <!-- TOC sidebar layout (required) -->
    <div class="page-toc-layout">
        <aside class="page-toc-sidebar">
            <div class="sidebar-section sidebar-toc">
                <div class="sidebar-section-title">On This Page</div>
                <div id="page-toc"></div>
            </div>
        </aside>
        <div class="page-toc-main">

            <!-- Each section needs: id on H2, section-title class, container div -->
            <section id="[section-id]">
            <div class="container">
                <h2 class="section-title" id="[anchor-id]">[Section Title]</h2>
                <!-- content using CSS classes: sketch-card, grid-2, grid-3, grid-4, faq-item, article-tag, read-more, etc. -->
            </div>
            </section>

        </div><!-- end page-toc-main -->
    </div><!-- end page-toc-layout -->

    </main>

    <!-- SEO Long-tail Keywords Section (required) -->
    <section id="[page-id]-seo" style="background: rgba(43,28,17,0.04); padding: 40px 0;">
        <div class="container seo-block">
            <h2>Bridger Western [Topic] Wiki & Trello – Complete [Year] [Type]</h2>
            <p><!-- 3 paragraphs, each 3-5 sentences, dense with long-tail keyword variations --></p>
            <p><!-- include internal links to related pages --></p>
            <p><!-- cover all keyword variations a player might search --></p>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container footer-grid">
            <!-- 4 footer columns with relevant links -->
        </div>
        <div class="footer-bottom">
            <p>© 2026 Bridger Western Wiki & Trello. An unofficial community resource.</p>
            <p>Not affiliated with BRIDGER INC. or Roblox Corporation.</p>
        </div>
    </footer>

    <!-- Scripts — path depends on directory depth -->
    <script src="[depth]/js/search.js" defer></script>
    <!-- Advertising (required on every page) -->
    <script src="[depth]/js/ads-config.js" defer></script>
    <script src="[depth]/js/ads-manager.js" defer></script>
    <!-- Components (nav + footer + exit-intent popup) -->
    <script src="[depth]/js/components.js" defer></script>
</body>
```

### JS path rules by directory depth

| Page location | components.js | search.js / ads | 
|---|---|---|
| `/index.html` | `/js/components.js` | `js/search.js` |
| `/stands/index.html` | `../js/components.js` | `../js/search.js` |
| `/stands/faq/index.html` | `../../js/components.js` | `../../js/search.js` |

---

## Step 2 — Content Rules (CRITICAL)

- **Only use content from**: existing site pages, the user's provided text, or the official game Trello
- **Never invent**: damage numbers, drop rates, mechanic descriptions, NPC names, locations, or any game data
- **If uncertain**: leave a `<!-- TODO: verify -->` comment rather than guessing
- **No AI filler**: no generic "this is a great game" sentences, no invented lore, no placeholder stats

---

## Step 3 — After creating the page, update these 4 files

### sitemap.xml
Add a new `<url>` entry:
```xml
<url>
    <loc>https://bridgerwestern.cc/[path]/</loc>
    <lastmod>[YYYY-MM-DD]</lastmod>
    <changefreq>weekly</changefreq>
    <priority>[0.8 for main pages, 0.7 for sub-pages, 0.6 for FAQ]</priority>
</url>
```

### robots.txt
No changes needed unless the page should be excluded.

### llms.txt
Add a line under the appropriate section:
```
- [Page Title]: https://bridgerwestern.cc/[path]/
```

### llms-full.txt
Add a full entry:
```
## [Page Title]
URL: https://bridgerwestern.cc/[path]/
[2-3 sentence summary of page content]
```

### IndexNow (GitHub Actions)
Add the new page URL to `.github/workflows/indexnow.yml` in the appropriate `urlList` array:
```yaml
"https://bridgerwestern.cc/[path]/"
```
This ensures Bing, Yandex and other IndexNow partners are notified immediately on next push.

---

## Step 4 — Update search-index.json

Extract all H1–H6 headings from the new page and add entries to `search-index.json`:

```json
{
    "title": "[H1/H2/H3 text]",
    "url": "/[path]/",
    "section": "[section name]",
    "type": "[guide|faq|database|item|weapon|stand|location]",
    "keywords": "[relevant search terms]"
}
```

---

## Step 5 — Update nav (REQUIRED for all new pages)

Every new page MUST be added to `components/nav.html` under the correct dropdown section. The nav is dynamically loaded on all pages, so one edit covers the whole site.

**Which dropdown to add to:**
- `/stands/[page]/` → Stands dropdown
- `/items/[page]/` → Items dropdown
- `/weapons/[page]/` → Weapons dropdown
- `/cards/[page]/` → Cards dropdown
- `/guides/[page]/` → Guides dropdown
- `/fishing/[page]/` → Fishing dropdown
- `/locations/[page]/` → Locations dropdown

**Format:**
```html
<a href="/[section]/[page]/">[Page Title]</a>
```

Add it in a logical position within the dropdown (e.g. after related pages, before FAQ).

---

## Step 6 — Add internal links (bidirectional)

After creating the page, add internal links in **both directions**:

### Outbound links (new page → existing pages)
The new page should already link to related pages via:
- Hero CTA buttons
- "Related Guides" section at the bottom
- In-text links within content

### Inbound links (existing pages → new page)
Search for existing pages that mention the same topic and add links pointing to the new page:

1. **Find related pages**: Search for keywords related to the new page topic
2. **Add links in context**: Where the topic is mentioned, wrap it in an `<a>` tag
3. **Make cards clickable**: If a `sketch-card` covers the same topic, convert it to `<a class="sketch-card article-card">` with a `read-more` span
4. **Add "Read Guide →" links**: At the end of relevant sections, add a `<span class="read-more">` link

**Minimum inbound links to add:**
- Parent section index page (e.g. `/stands/` for a stands sub-page)
- Most closely related existing page (e.g. fishing guide for Arrow Shard page)
- FAQ page of the same section if it mentions the topic

**Card link pattern** (makes the whole card clickable with hover effect):
```html
<a href="/path/to/new-page/" class="sketch-card article-card" style="display: block; text-decoration: none; color: inherit;">
    <h3>Card Title</h3>
    <p>Card content...</p>
    <span class="read-more">Read Guide →</span>
</a>
```

---

## Step 7 — SEO Deep Analysis (per Google Search Central best practices)

After the page is created and internal links are in place, perform a full SEO audit covering all dimensions below. Reference: [Google Search Central Docs](https://developers.google.com/search/docs)

### 7.1 Technical SEO
- `<link rel="canonical">` present and pointing to the correct URL
- `<meta name="robots">` set to `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- Page is listed in `sitemap.xml` with correct `<lastmod>` and `<priority>`
- No broken links (404) on the page
- HTTPS enforced (all internal links use `/` relative paths or `https://bridgerwestern.cc/`)
- No `noindex` on pages that should be indexed

### 7.2 HTML Structure & H-tag Hierarchy
- **One and only one `<h1>`** per page — must be the main topic title
- H-tags follow strict hierarchy: H1 → H2 → H3 (never skip levels, e.g. H1 → H3)
- H2 tags used for major sections; H3 for sub-items within those sections
- No heading used purely for visual styling (use CSS classes instead)
- `<main>` landmark wraps the primary content
- `<section>`, `<article>`, `<nav>`, `<footer>` used semantically

### 7.3 Meta Tags Quality
- `<title>` is 50–60 chars, includes primary keyword near the front, ends with `– Bridger Western [Year]`
- `<meta description>` is 120–160 chars, includes a clear value proposition and primary keyword
- No emoji in `<title>` or `<meta description>` (emojis belong in OG/Twitter tags only)
- OG `og:description` uses emoji-separated keyword clusters for social sharing

### 7.4 Image Optimisation
- Every `<img>` has a descriptive `alt` attribute (not empty, not "image", not filename)
- `alt` text describes the image content and includes a relevant keyword where natural
- Images use `loading="lazy"` except above-the-fold hero images
- `width` and `height` attributes set on all images to prevent CLS

### 7.5 Structured Data (Schema.org)
- Page-type schema chosen correctly:
  - FAQ pages → `FAQPage` with all Q&A pairs in `mainEntity`
  - Guide/article pages → `TechArticle` or `Article`
  - Index/collection pages → `CollectionPage` with `ItemList`
  - Homepage → `WebSite` with `SearchAction`
- `BreadcrumbList` always present and matches the visible breadcrumb
- Validate with [Google Rich Results Test](https://search.google.com/test/rich-results) after publishing

### 7.6 Content Quality & E-E-A-T
- Content is based on verified game data only (no invented stats)
- Page demonstrates **Experience**: first-person gameplay observations where relevant
- Page demonstrates **Expertise**: specific mechanics, numbers, and strategies
- Page demonstrates **Authoritativeness**: links to related authoritative pages on the wiki
- Page demonstrates **Trustworthiness**: disclaimer "unofficial community resource" in footer
- Content fully answers the user's search intent (informational, navigational, or transactional)
- Minimum 300 words of substantive content per page (excluding nav/footer)

### 7.7 Keyword Optimisation
- Primary keyword appears in: `<title>`, `<meta description>`, `<h1>`, first paragraph of body
- Secondary keywords distributed naturally across H2/H3 headings and body text
- No keyword stuffing — keyword density should feel natural when read aloud
- Long-tail keyword section at the bottom covers all search intent variations

### 7.8 Internal Linking Quality
- Anchor text is descriptive (e.g. "Arrow Shard fishing guide" not "click here")
- No orphan pages — every page reachable within 3 clicks from homepage
- Parent section index page links to the new page (inbound)
- New page links back to parent section and at least 2 sibling pages (outbound)
- Footer includes the new page in the relevant column

### 7.9 Page Experience & Core Web Vitals
- No render-blocking scripts in `<head>` (all JS uses `defer` or `async`)
- Google Fonts loaded with `preconnect` hints
- No inline `style` attributes that cause layout shifts on load
- Touch targets (buttons, links) are at least 48×48px on mobile
- No horizontal scroll on mobile (test at 375px viewport width)

### 7.10 Accessibility (a11y)
- Interactive elements (`<button>`, `<a>`) have visible focus styles
- Navigation toggle has `aria-label="Toggle menu"`
- Search button has `aria-label="Search wiki"`
- Social links have `aria-label` describing the platform
- Colour contrast ratio ≥ 4.5:1 for body text (dark ink on parchment background passes)
- Page is navigable by keyboard (Tab order logical)

---

## Checklist before committing

- [ ] `<title>` 50–60 chars, primary keyword near front, no emoji
- [ ] `<meta description>` 120–160 chars, includes keyword and value proposition, no emoji
- [ ] All OG tags present (emoji allowed in OG title/description)
- [ ] BreadcrumbList schema present and matches visible breadcrumb
- [ ] Page-type schema correct (FAQPage / TechArticle / CollectionPage)
- [ ] **One H1 only**, H-tag hierarchy is H1→H2→H3 (no skipped levels)
- [ ] All `<img>` have descriptive `alt` text + `loading="lazy"` + `width`/`height`
- [ ] Hero section with `class="hero"` present
- [ ] `page-toc-layout` + `page-toc-sidebar` + `#page-toc` + `#page-toc-mobile` structure present
- [ ] Every H2 has `class="section-title"` and a unique `id` attribute
- [ ] Every `<section>` inside `page-toc-main` has a `<div class="container">` wrapper
- [ ] SEO long-tail keywords section present (3 paragraphs, 300+ words)
- [ ] No invented content (all facts sourced)
- [ ] Correct JS path depth; all scripts use `defer` or `async`
- [ ] `ads-config.js` and `ads-manager.js` loaded before `components.js`
- [ ] `sitemap.xml` updated
- [ ] `llms.txt` updated
- [ ] `llms-full.txt` updated
- [ ] `search-index.json` updated with H1–H6 headings
- [ ] `.github/workflows/indexnow.yml` updated with new page URL
- [ ] `components/nav.html` updated (REQUIRED — add to correct dropdown)
- [ ] Inbound links added from at least 3 related existing pages
- [ ] Clickable cards use `<a class="sketch-card article-card">` pattern
- [ ] Anchor text is descriptive (no "click here" or "read more" as sole text)
- [ ] No render-blocking scripts in `<head>`
- [ ] `rel="canonical"` present and correct
