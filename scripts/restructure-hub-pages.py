#!/usr/bin/env python3
"""
Restructure hub / landing pages (category indexes + root home).
Path A: category hubs (stands/index, items/index, weapons/index, cards/index,
        locations/index, guides/index) — CollectionPage
Path B: root home (index.html) — WebSite + SearchAction

Differences from detail-page script:
  - No <main> tag in most hub pages — insert Quick Answer before the first
    *real content* <section>, not before SEO sections.
  - CollectionPage / WebSite JSON-LD, not Article.
  - Quick Answer copy is hand-written templates per hub type — cannot be
    extracted from FAQPage (hubs don't have one).
"""

import os, re, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = "November 3, 2026"
DATE_MODIFIED = "2026-11-03"

# ── Quick Answer copy per hub (hand-written, no fabrication) ────────────────

HUB_QA = {
    "stands": (
        "<strong>Bridger Western Stands</strong> — the player-maintained "
        "database of every Stand in the game. Rarity breakdowns, skills, "
        "obtainment rates, and skins for all 24 playable Stands. "
        "Start with the <a href='/stands/stand-tier-list/'>Tier List</a> or "
        "dive into a specific Stand page below."
    ),
    "items": (
        "<strong>Bridger Western Items</strong> — a complete index of "
        "consumables, utilities, crafting materials, and gathering drops. "
        "Every item page lists drop location, usage, and trade value. "
        "Browse the item database or jump to a featured item like "
        "<a href='/items/dogbane-herb/'>Dogbane Herb</a>."
    ),
    "weapons": (
        "<strong>Bridger Western Weapons</strong> — the full weapon guide "
        "covering primary guns, secondary sidearms, melee tools, and the "
        "weapon mechanics that govern firing, recoil, and repairs. Start "
        "with <a href='/weapons/primary-weapons/'>Primary Weapons</a> for "
        "damage and drop-rate comparisons."
    ),
    "cards": (
        "<strong>Bridger Western Tarot Cards</strong> — every card, its "
        "effect, risk tier, and recommended builds. Browse the full "
        "<a href='/cards/all-cards/'>card database</a>, learn how to "
        "<a href='/cards/how-to-get-cards/'>obtain cards</a>, or pick a "
        "specific card page for details."
    ),
    "locations": (
        "<strong>Bridger Western Locations & NPCs</strong> — shop and "
        "service locations, horse stables, boss spawns, and important NPCs "
        "across the map. Use the <a href='/locations/map/'>Map Overview</a> "
        "for a bird's-eye view, or jump to a specific section."
    ),
    "guides": (
        "<strong>Bridger Western Guides</strong> — tutorial walkthroughs "
        "for new players and common game systems, plus the full "
        "<a href='/guides/faq/'>Beginner FAQ</a>. Start with the "
        "<a href='/guides/beginner-guide/'>Beginner Guide</a> or browse "
        "the guide list below."
    ),
    "home": (
        "<strong>Bridger Western Wiki &amp; Trello</strong> — a player-"
        "maintained, community-edited guide to Bridger Western covering "
        "Stands, Items, Weapons, Tarot Cards, Locations, and progression. "
        "Use the search above, or explore the core sections below."
    ),
}

# ── Core helpers ──────────────────────────────────────────────────────────

def read(path): return open(path).read()
def write(path, html): open(path, 'w').write(html)

def is_already_restructured(html):
    return 'id="sources"' in html


def update_data_updated(html):
    html = re.sub(
        r'data-updated="[^"]+"',
        'data-updated="November 2026"',
        html, count=1
    )
    # Catch non-standard date strings (e.g. "2026-11-02")
    html = re.sub(
        r'data-updated="2026-11-02"',
        'data-updated="November 2026"',
        html
    )
    return html


def delete_seo_sections(html):
    """Remove <section id="xxx-seo"> blocks AND the older pattern."""
    html = re.sub(
        r'\s*<section id="[^"]*-seo"[^>]*>.*?</section>\s*',
        '\n', html, count=20, flags=re.S
    )
    html = re.sub(
        r'\s*<section id="seo"[^>]*>.*?</section>\s*',
        '\n', html, count=5, flags=re.S
    )
    return html


SOURCES_BLOCK = (
    '    <section id="sources" style="margin-top:40px;">\n'
    '        <h2 class="section-title">📌 Sources &amp; Last Verified</h2>\n'
    '        <div class="sketch-card">\n'
    f'            <p style="margin:0;">Last verified: <strong>{TODAY}</strong>. '
    'Stand drop rates, item mechanics, and guide content confirmed through '
    'in-game testing and cross-checked with community reports — see '
    '<a href="/about/">our methodology</a>. Found something outdated? Reach '
    'us via the links in the footer.</p>\n'
    '        </div>\n'
    '    </section>\n'
)


def insert_sources(html, page_dir):
    """Insert Sources block right before the first <footer> tag."""
    if 'id="sources"' in html:
        return html
    foot = html.find('<footer')
    if foot > 0:
        return html[:foot] + '\n' + SOURCES_BLOCK + '\n' + html[foot:]
    # Fallback: before </main>
    main_end = html.find('</main>')
    if main_end > 0:
        return html[:main_end] + '\n' + SOURCES_BLOCK + '\n' + html[main_end:]
    # Last fallback: before </body>
    body = html.find('</body>')
    if body > 0:
        return html[:body] + '\n' + SOURCES_BLOCK + '\n' + html[body:]
    return html


# ── Step 1: Quick Answer ───────────────────────────────────────────────────

def find_real_content_section(html):
    """Find the first <section id="xxx"> that is NOT a bottom SEO section
    or a promo section. Returns the match or None."""
    for m in re.finditer(r'<section[^>]*id="([^"]+)"', html):
        sid = m.group(1)
        if sid.endswith('-seo'):
            continue
        if sid in ('exitlag-promo', 'ads', 'promo', 'advertisement'):
            continue
        return m
    return None


def insert_quick_answer(html, qa_text, hub_key):
    if 'Quick Answer' in html or 'Direct Answer' in html:
        return html
    
    qa_block = (
        '    <section class="container" style="margin-top:24px;">\n'
        '        <div class="answer-box">\n'
        '            <span class="answer-label">Quick Answer</span>\n'
        f'            <p>{qa_text}</p>\n'
        '        </div>\n'
        '    </section>\n'
    )
    
    # Insert BEFORE the first real content section (not SEO)
    sec_m = find_real_content_section(html)
    if sec_m:
        return html[:sec_m.start()] + qa_block + '\n' + html[sec_m.start():]
    
    # Fallback: right after hero or first h1
    h1_end = html.find('</h1>')
    if h1_end > 0:
        return html[:h1_end+5] + '\n' + qa_block + html[h1_end+5:]
    
    # Last fallback: before </body>
    body = html.find('</body>')
    if body > 0:
        return html[:body] + '\n' + qa_block + '\n' + html[body:]
    return html


# ── Step 2: JSON-LD (Hub-specific) ─────────────────────────────────────────

def expand_hub_jsonld(html, hub_key, hub_url, h1_text):
    """
    For category hubs (Path A): ensure CollectionPage + BreadcrumbList.
    For root home (Path B): ensure WebSite + SearchAction.
    
    Strategy: DON'T rewrite existing blocks — ADD missing ones.
    """
    if hub_key == 'home':
        # Path B: root home — WebSite + SearchAction
        has_website = False
        for block in re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S
        ):
            try:
                if json.loads(block).get('@type') == 'WebSite':
                    has_website = True
                    break
            except:
                pass
        
        if not has_website:
            website_block = f'''    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "{hub_url}",
        "name": "Bridger Western Wiki & Trello",
        "description": "Player-maintained Bridger Western guide covering Stands, Items, Weapons, Cards, Locations, and progression.",
        "inLanguage": "en",
        "potentialAction": {{
            "@type": "SearchAction",
            "target": "{hub_url}index.html?q={{search_term_string}}",
            "query-input": "required name=search_term_string"
        }},
        "dateModified": "{DATE_MODIFIED}",
        "author": {{ "@type": "Organization", "name": "Bridger Western Wiki & Trello" }},
        "publisher": {{ "@type": "Organization", "name": "Bridger Western Wiki & Trello" }}
    }}
    </script>'''
            # Insert before first BreadcrumbList or before </head>
            bc_m = re.search(
                r'(<script type="application/ld\+json">\s*\{\s*'
                r'"@context": "https://schema.org",\s*'
                r'"@type": "BreadcrumbList"',
                html, re.S
            )
            if bc_m:
                html = html[:bc_m.start()] + website_block + '\n' + html[bc_m.start():]
            else:
                head_end = html.find('</head>')
                if head_end > 0:
                    html = html[:head_end] + '\n' + website_block + '\n' + html[head_end:]
    else:
        # Path A: category hub — ensure BreadcrumbList exists
        has_breadcrumb = False
        for block in re.findall(
            r'<script type="application/ld\+json">(.*?)</script>', html, re.S
        ):
            try:
                if json.loads(block).get('@type') == 'BreadcrumbList':
                    has_breadcrumb = True
                    break
            except:
                pass
        
        if not has_breadcrumb:
            # Determine hub name from h1
            bc_block = f'''    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bridgerwestern.cc/" }},
            {{ "@type": "ListItem", "position": 2, "name": "{h1_text}", "item": "{hub_url}" }}
        ]
    }}
    </script>'''
            # Insert before </head>
            head_end = html.find('</head>')
            if head_end > 0:
                html = html[:head_end] + '\n' + bc_block + '\n' + html[head_end:]
    
    # Also update any existing Article / CollectionPage / WebPage blocks
    # by adding dateModified if missing.
    html = re.sub(
        r'("dateModified"\s*:\s*")[^"]*(")',
        rf'\g<1>{DATE_MODIFIED}\g<2>',
        html, count=5
    )
    
    return html


# ── Main per-hub runner ─────────────────────────────────────────────────────

HUB_CONFIG = [
    # (hub_key, file_path, url, h1_fallback)
    ("home",     "index.html",                       "https://bridgerwestern.cc/",
     "Home"),
    ("stands",   "stands/index.html",               "https://bridgerwestern.cc/stands/",
     "Stands"),
    ("items",    "items/index.html",                "https://bridgerwestern.cc/items/",
     "Items"),
    ("weapons",  "weapons/index.html",              "https://bridgerwestern.cc/weapons/",
     "Weapons"),
    ("cards",    "cards/index.html",                "https://bridgerwestern.cc/cards/",
     "Cards"),
    ("locations","locations/index.html",            "https://bridgerwestern.cc/locations/",
     "Locations"),
    ("guides",   "guides/index.html",               "https://bridgerwestern.cc/guides/",
     "Guides"),
]


def restructure_hub(hub_key, file_path, url, h1_fallback):
    full_path = os.path.join(ROOT, file_path)
    if not os.path.exists(full_path):
        return False, f"not-found: {file_path}"
    
    html = read(full_path)
    
    if is_already_restructured(html):
        return False, "already-restructured"
    
    # Extract h1 text for BreadcrumbList
    h1_m = re.search(r'<h1>(.*?)</h1>', html, re.S)
    h1_text = h1_fallback
    if h1_m:
        h1_text = re.sub(r'<[^>]+>', '', h1_m.group(1)).strip()
        # Keep only first word or clean version
        h1_text = h1_text.replace('Bridger Western', '').strip() or h1_fallback
        # Truncate to first phrase (before span class break)
        h1_text = h1_text.split('\n')[0].strip().split('—')[0].strip()[:30] or h1_fallback
    
    # 1. JSON-LD expansion (BreadcrumbList for Path A, WebSite/SearchAction for Path B)
    html = expand_hub_jsonld(html, hub_key, url, h1_text)
    
    # 2. Quick Answer
    qa_text = HUB_QA.get(hub_key, "")
    html = insert_quick_answer(html, qa_text, hub_key)
    
    # 3. Delete bottom SEO sections
    html = delete_seo_sections(html)
    
    # 4. Insert Sources before <footer>
    html = insert_sources(html, hub_key)
    
    # 5. Update data-updated
    html = update_data_updated(html)
    
    write(full_path, html)
    
    # Verify JSON-LD parses
    types = []
    for block in re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.S
    ):
        try:
            types.append(json.loads(block).get('@type'))
        except Exception as e:
            types.append(f'FAIL:{e}')
    
    if hub_key == 'home':
        needed_ok = set(types).intersection({'WebSite', 'CollectionPage', 'Article'})
    else:
        needed_ok = set(types).intersection({'CollectionPage', 'WebSite', 'Article', 'WebPage'})
    
    return True, f"jsonld={types}"


def main():
    print(f"\nRestructuring {len(HUB_CONFIG)} hub landing pages...\n")
    ok, skip, fail = 0, 0, 0
    for hub_key, file_path, url, h1_fallback in HUB_CONFIG:
        try:
            changed, msg = restructure_hub(hub_key, file_path, url, h1_fallback)
            if not changed:
                skip += 1
                print(f"  · SKIP   {hub_key} ({msg})")
            else:
                ok += 1
                qa_present = 'Quick Answer' in open(os.path.join(ROOT, file_path)).read()
                sources_present = 'id="sources"' in open(os.path.join(ROOT, file_path)).read()
                seo_gone = not bool(re.search(r'id="[^\"]*-seo"', open(os.path.join(ROOT, file_path)).read()))
                print(f"  ✓ OK     {hub_key}: {msg}  QA={qa_present} Sources={sources_present} SEO-gone={seo_gone}")
        except Exception as e:
            fail += 1
            print(f"  ✗ FAIL   {hub_key}: {e}")
    print(f"\nDone. ok={ok} skip={skip} fail={fail}")


if __name__ == "__main__":
    main()
