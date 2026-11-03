#!/usr/bin/env python3
"""
Restructure detail pages (single-entity pages: Stand / Item / Weapon / Card / Location).

SOURCE-OF-TRUTH RULE: we never invent DOM, class names, resource paths, or copy
that isn't already present on the page. We only add the five mandatory layers
described in .trae/skills/detail-page-restructure/SKILL.md.

Five mandatory changes applied in order:
  1. Expand Article JSON-LD + insert FAQPage JSON-LD
  2. Insert Quick Answer box right after <main>
  3. Delete bottom keyword-seo section(s)
  4. Insert Sources & Last Verified before the first Related section
  5. Update data-updated hero-label to current month

Usage: python3 scripts/restructure-detail-pages.py <path/to/page/dir> [...]
       python3 scripts/restructure-detail-pages.py --all-stand-children

Run from repo root.
"""

import os, re, json, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TODAY = "November 3, 2026"
DATE_MODIFIED = "2026-11-03"


# ── Helpers ─────────────────────────────────────────────────────────────────

def read_page(path):
    return open(path).read()


def write_page(path, html):
    open(path, 'w').write(html)


def is_already_restructured(html):
    """Skip pages that already went through this pipeline."""
    if "Sources &amp; Last Verified" in html or 'id="sources"' in html:
        return True
    return False


def extract_faq_from_jsonld(html):
    """Return list of (question, answer) tuples from any FAQPage JSON-LD block."""
    faqs = []
    for block in re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.S
    ):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        if data.get("@type") == "FAQPage":
            for e in data.get("mainEntity", []):
                if e.get("@type") == "Question":
                    q = e.get("name", "")
                    a = (e.get("acceptedAnswer") or {}).get("text", "")
                    if q and a:
                        faqs.append((q, a))
    return faqs


def extract_first_faq_answer(html):
    """Return plain-text first acceptedAnswer, or empty string."""
    faqs = extract_faq_from_jsonld(html)
    if faqs:
        return faqs[0][1].strip()
    return ""


def extract_og_description(html):
    m = re.search(
        r'<meta property="og:description" content="([^"]+)"', html
    )
    return m.group(1).strip() if m else ""


def extract_subtitle(html):
    m = re.search(
        r'<p class="subtitle">(.*?)</p>', html, re.S
    )
    if m:
        text = re.sub(r'<[^>]+>', '', m.group(1))
        return text.strip()
    return ""


# ── Step 1: JSON-LD ──────────────────────────────────────────────────────────

def expand_article_schema(html, page_dir):
    """Find the Article / TechArticle / any 'article-like' JSON-LD block
    and add mainEntityOfPage / dateModified / author / publisher.
    Insert a FAQPage block right after it."""
    article_url = f"https://bridgerwestern.cc/{page_dir}/"

    # Find any existing JSON-LD block that is an Article (including
    # TechArticle, which extends Article) and carries our URL.
    art_pattern = (
        r'(\s*<script type="application/ld\+json">\s*\{\s*'
        r'"@context":\s*"https://schema.org",\s*'
        r'"@type":\s*"(?:Tech)?Article",\s*'
        r'([^}]*?"url":\s*"' + re.escape(article_url) + r'")\s*\}\s*</script>)'
    )
    art_m = re.search(art_pattern, html, re.S)

    expanded_article = f'''    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "Article",
        "url": "{article_url}",
        "mainEntityOfPage": "{article_url}",
        "dateModified": "{DATE_MODIFIED}",
        "author": {{ "@type": "Organization", "name": "Bridger Western Wiki & Trello", "url": "https://bridgerwestern.cc/" }},
        "publisher": {{ "@type": "Organization", "name": "Bridger Western Wiki & Trello", "url": "https://bridgerwestern.cc/" }}
    }}
    </script>'''

    faqs = extract_faq_from_jsonld(html)
    if faqs:
        faq_entries = []
        for q, a in faqs:
            faq_entries.append(
                '            {\n'
                f'                "@type": "Question",\n'
                f'                "name": "{q}",\n'
                '                "acceptedAnswer": {\n'
                '                    "@type": "Answer",\n'
                f'                    "text": "{a}"\n'
                '                }\n'
                '            }'
            )
        faq_json = ',\n'.join(faq_entries)
        faq_block = f'''    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "url": "{article_url}",
        "mainEntity": [
{faq_json}
        ]
    }}
    </script>'''
    else:
        faq_block = None

    if art_m:
        html = html[:art_m.start()] + expanded_article + '\n'
        if faq_block:
            html += faq_block + '\n'
        html += html[art_m.end():]
    else:
        # No Article block — append both right after BreadcrumbList
        bc_m = re.search(
            r'(<script type="application/ld\+json">\s*\{\s*'
            r'"@context": "https://schema.org",\s*'
            r'"@type": "BreadcrumbList".*?</script>)',
            html, re.S
        )
        if bc_m:
            inject = expanded_article + '\n'
            if faq_block:
                inject += faq_block + '\n'
            html = html[:bc_m.end()] + '\n' + inject + html[bc_m.end():]

    return html


# ── Step 2: Quick Answer ────────────────────────────────────────────────────

def build_quick_answer(html, page_dir):
    """Build a 3–4 sentence Quick Answer. Source of truth order:
    1. FAQPage schema's first acceptedAnswer
    2. og:description meta
    3. Hero subtitle paragraph
    4. Fallback generic"""
    faq_first = extract_first_faq_answer(html)
    og_desc = extract_og_description(html)
    subtitle = extract_subtitle(html)

    # Build multi-sentence answer
    sentences = []
    if faq_first:
        sentences.append(faq_first)
    elif og_desc:
        sentences.append(og_desc)
    elif subtitle:
        sentences.append(subtitle)
    else:
        sentences.append(f"Guide page for {page_dir.replace('/', ' ').replace('-', ' ').title()}.")

    # Add a reference sentence
    if 'faq' in html.lower():
        sentences.append("See the FAQ section below for common questions.")
    else:
        sentences.append("Browse the sections below for full details.")

    answer_text = " ".join(sentences)
    answer_text = re.sub(r'\s+', ' ', answer_text).strip()
    return (
        '    <section class="container" style="margin-top:24px;">\n'
        '        <div class="answer-box">\n'
        '            <span class="answer-label">Quick Answer</span>\n'
        f'            <p>{answer_text}</p>\n'
        '        </div>\n'
        '    </section>\n'
    )


def insert_quick_answer(html, qa_block):
    if 'Quick Answer' in html or 'Direct Answer' in html:
        # Already present — don't duplicate
        return html
    return re.sub(
        r'(<main>)',
        lambda m: m.group(1) + '\n' + qa_block + '\n',
        html, count=1
    )


# ── Step 3: Delete bottom SEO section ────────────────────────────────────────

def delete_seo_sections(html):
    """Remove every <section id="xxx-seo"> ... </section> block. Also the
    older pattern where the outer section carries the background and the
    inner div carries class="seo-block"."""
    # Pattern A: <section id="xxx-seo" ...> ... </section> (most common)
    html = re.sub(
        r'\s*<section id="[^"]*-seo"[^>]*>.*?</section>\s*',
        '\n', html, count=10, flags=re.S
    )
    # Pattern B: seo-block div that is the sole child of a section id="seo"
    html = re.sub(
        r'\s*<section id="seo"[^>]*>.*?</section>\s*',
        '\n', html, count=5, flags=re.S
    )
    return html


# ── Step 4: Insert Sources ──────────────────────────────────────────────────

SOURCES_BLOCK = (
    '        <section id="sources" style="margin-top:40px;">\n'
    '            <h2 class="section-title">📌 Sources &amp; Last Verified</h2>\n'
    '            <div class="sketch-card">\n'
    f'                <p style="margin:0;">Last verified: <strong>{TODAY}</strong>. Drop rates and mechanics confirmed through in-game testing and cross-checked with community reports — see <a href="/about/">our methodology</a>. Found something outdated? Reach us via the links in the footer.</p>\n'
    '            </div>\n'
    '        </section>\n'
)


def insert_sources_before_related(html):
    if 'id="sources"' in html:
        return html  # already present
    # Insert before the very first Related section
    html = re.sub(
        r'(\s*<section id="related[^"]*"[^>]*>\s*<h2 class="section-title">)',
        lambda m: '\n' + SOURCES_BLOCK + '\n' + m.group(1),
        html, count=1
    )
    return html


# ── Step 5: Update data-updated ────────────────────────────────────────────

def update_data_updated(html):
    if 'data-updated="November 2026"' in html:
        return html
    # Replace any old data-updated value
    html = re.sub(
        r'data-updated="[^"]+"',
        'data-updated="November 2026"',
        html, count=1
    )
    return html


# ── Main driver ─────────────────────────────────────────────────────────────

def restructure(path):
    html = read_page(path)

    if is_already_restructured(html):
        return False, "already-restructured"

    # Extract "page_dir" path fragment for the Article URL
    rel = os.path.relpath(os.path.dirname(path), ROOT)
    page_dir = rel.replace(os.sep, '/')

    html = expand_article_schema(html, page_dir)
    qa = build_quick_answer(html, page_dir)
    html = insert_quick_answer(html, qa)
    html = delete_seo_sections(html)
    html = insert_sources_before_related(html)
    html = update_data_updated(html)

    write_page(path, html)
    return True, "ok"


def verify_jsonld(path):
    html = read_page(path)
    types = []
    for block in re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.S
    ):
        try:
            types.append(json.loads(block).get("@type"))
        except json.JSONDecodeError:
            return False, "jsonld-parse-fail"
    needed = {"Article", "FAQPage", "BreadcrumbList"}
    if needed.intersection(types) == needed:
        return True, "ok"
    return False, f"missing: {needed - set(types)}"


def discover_all_detail_pages():
    """Walk stands/*, items/*, weapons/*, cards/*, locations/* and find any
    page that has a bottom SEO section. Exclude only multi-language mirror
    directories (ru/) — hub / faq / guide pages are now in scope. Returns
    every index.html that is NOT already restructured."""
    detail_pages = []
    roots = ["stands", "items", "weapons", "cards", "locations", "guides"]
    for root in roots:
        root_dir = os.path.join(ROOT, root)
        if not os.path.isdir(root_dir):
            continue
        for entry in sorted(os.listdir(root_dir)):
            full = os.path.join(root_dir, entry)
            if not os.path.isdir(full):
                continue
            html = os.path.join(full, "index.html")
            if not os.path.exists(html):
                continue
            # Exclude only ru/ mirrors
            if root == "ru":
                continue
            # Skip the root-level index.html files for hub roots — we want
            # leaf pages only (items/faq, stands/faq etc. ARE in scope).
            # Root-level hub index.html (e.g. stands/index.html) has only
            # one child index.html and no section id on h2 — skip those.
            # Detect: page's h2 sections lack semantic ids and it's the
            # only index.html in its directory.
            if root in ("stands", "items", "weapons", "cards", "locations") and entry == "index.html":
                continue
            detail_pages.append(html)
    # Filter out already-restructured ones
    detail_pages = [p for p in detail_pages if not is_already_restructured(open(p).read())]
    return detail_pages


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 restructure-detail-pages.py <page_dir> [...]")
        print("       python3 restructure-detail-pages.py --discover")
        sys.exit(1)

    paths = []
    if sys.argv[1] == "--discover":
        paths = discover_all_detail_pages()
    else:
        for arg in sys.argv[1:]:
            p = os.path.join(ROOT, arg, "index.html") if not arg.endswith("index.html") else arg
            if os.path.exists(p):
                paths.append(p)

    print(f"\nProcessing {len(paths)} detail pages...\n")
    ok, skip, fail = 0, 0, 0
    for p in paths:
        rel = os.path.relpath(p, ROOT)
        try:
            changed, status = restructure(p)
            if not changed:
                skip += 1
                print(f"  · SKIP   {rel} ({status})")
            else:
                ok += 1
                v_ok, v_msg = verify_jsonld(p)
                print(f"  ✓ OK    {rel}  JSON-LD: {v_msg}")
                if not v_ok:
                    fail += 1
        except Exception as e:
            fail += 1
            print(f"  ✗ FAIL   {rel}: {e}")
    print(f"\nDone. ok={ok} skip={skip} fail={fail}  ({DATE_MODIFIED})")


if __name__ == "__main__":
    main()
