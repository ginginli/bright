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
    <section class="breadcrumb">
        <div class="container">
            <a href="/">Home</a> → <a href="/[section]/">[Section]</a> → <span>[Page]</span>
        </div>
    </section>

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

    <main class="container">
        <!-- page content using CSS classes: section-title, sketch-card, grid-2, grid-3, grid-4, faq-item, article-tag, read-more, etc. -->
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
    <script src="[depth]/js/search.js"></script>
    <script src="[depth]/js/ads-config.js"></script>
    <script src="[depth]/js/ads-manager.js"></script>
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

## Step 5 — Update nav if needed

If the new page should appear in the navigation dropdown, update `components/nav.html` to add the link in the correct section.

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

## Checklist before committing

- [ ] `<title>` ≤ 60 chars
- [ ] `<meta description>` 120–160 chars
- [ ] All OG tags present
- [ ] BreadcrumbList schema present
- [ ] Hero section with `class="hero"` present
- [ ] SEO long-tail keywords section present
- [ ] No invented content (all facts sourced)
- [ ] Correct JS path depth
- [ ] `sitemap.xml` updated
- [ ] `llms.txt` updated
- [ ] `llms-full.txt` updated
- [ ] `search-index.json` updated with H1–H6 headings
- [ ] `components/nav.html` updated if needed
- [ ] Inbound links added from at least 3 related existing pages
- [ ] Clickable cards use `<a class="sketch-card article-card">` pattern
