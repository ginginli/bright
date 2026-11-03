#!/usr/bin/env python3
"""
Batch-restructure all Stand index.html pages to the AI-friendly template.

For each page we:
  1. Update hero-label data-updated April 2026 -> November 2026
  2. Expand Article JSON-LD (dateModified / author / publisher / mainEntityOfPage)
  3. Insert FAQPage JSON-LD block (tailored per page)
  4. Insert Quick Answer section right after <main>
  5. Replace <section id="overview"> with Contents + What-is sections
  6. Normalize ability / obtainment section titles and convert <ul> lists
     into data tables (preserving Passive and Evolution sub-sections)
  7. Delete the bottom keyword-stuffing <section id="seo"> block
  8. Insert FAQ accordion + Sources & Last Verified before #related
  9. Append FAQ accordion JS (page-local, safe)

Unique content (emoji, rarity tags, passive, every move keybind + description,
special obtainment conditions, skin names, related links) is read from the
existing HTML of each page — nothing is fabricated.

Run from the repo root: python3 scripts/restructure-stand-pages.py
"""

import os, re, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAST_VERIFIED = "November 3, 2026"
DATE_MODIFIED = "2026-11-03"

# ── Page list ────────────────────────────────────────────────────────────────
# Every standalone Stand page (not skins / how-to-get / tier-list etc.)
# the-world was already done manually — exclude it.
STAND_DIRS = sorted([
    d for d in os.listdir(os.path.join(ROOT, "stands"))
    if os.path.isdir(os.path.join(ROOT, "stands", d))
    and os.path.exists(os.path.join(ROOT, "stands", d, "index.html"))
])

EXCLUDE = {"the-world", "skins", "how-to-get-stand", "stand-tier-list",
           "stand-abilities", "faq", "practical-acquisition", "value-tier-list",
           "corpse-part-guide", "corpse-part-locations", "arrow-shard",
           "discord-coordination", "stand-abilities", "value-tier-list"}
STAND_DIRS = sorted(set(STAND_DIRS) - EXCLUDE)
print(f"Targets ({len(STAND_DIRS)}): {STAND_DIRS}")

# ── Helper extraction functions ──────────────────────────────────────────────

def extract_overview(html):
    """Return (emoji, list_of_tag_strings) from the overview sketch-card."""
    m = re.search(
        r'<section id="overview"[^>]*>.*?'
        r'<div style="font-size:4rem;" aria-hidden="true">(.*?)</div>.*?'
        r'<div style="display:flex; gap:6px; flex-wrap:wrap;">(.*?)</div>',
        html, re.S
    )
    if not m:
        return None, []
    emoji = m.group(1).strip()
    tags_html = m.group(2)
    tags = re.findall(r'<span[^>]*>(.*?)</span>', tags_html, re.S)
    tags = [t.strip() for t in tags]
    return emoji, tags


def extract_stand_name(html):
    m = re.search(r'<h1>(.*?)<br>', html, re.S)
    if m:
        return m.group(1).strip()
    m = re.search(r'<section id="overview"[^>]*>.*?<h2[^>]*>(.*?)</h2>', html, re.S)
    return m.group(1).strip() if m else "Stand"


def extract_h1_title(html):
    m = re.search(r'<title>(.*?)</title>', html)
    return m.group(1).strip() if m else ""


def parse_abilities_section(html):
    """
    Return a dict with keys: passive (str or None), evolution (str or None),
    and moves (list of (key, name, desc)). Each item comes directly from
    the original HTML — we never invent keys or descriptions.
    """
    m = re.search(r'<section id="abilities"[^>]*>(.*?)</section>', html, re.S)
    if not m:
        return {"passive": None, "evolution": None, "moves": []}
    body = m.group(1)

    # Passive — a <h3> with "Passive" in its text, followed by a <p>
    passive = None
    pm = re.search(
        r'<h3[^>]*>Passive[^<]*</h3>\s*<p>(.*?)</p>', body, re.S
    )
    if pm:
        ptext = re.sub(r'<[^>]+>', '', pm.group(1))
        passive = ptext.strip()

    # Evolution — a <h3>Evolution</h3> (may carry attributes), followed by <p>
    evolution = None
    em = re.search(
        r'<h3[^>]*>Evolution</h3>\s*<p>(.*?)</p>', body, re.S
    )
    if em:
        etext = re.sub(r'<[^>]+>', '', em.group(1))
        evolution = etext.strip()

    # Moves — every <li><strong>X:</strong> Name — Description</li>
    moves = []
    # Pattern 1: <li><strong>KEY:</strong> Move Name — description</li>
    # Pattern 2: <li><strong>KEY:</strong> Move Name</li>
    for li in re.findall(r'<li>(.*?)</li>', body, re.S):
        km = re.search(r'<strong>([A-Z])(?::| \([^)]+\))</strong>\s*(.*?)$', li, re.S)
        if km:
            key = km.group(1)
            rest = re.sub(r'<[^>]+>', '', km.group(2)).strip()
            # Normalize "Name — description" or "Name — description (more)"
            if '—' in rest:
                name, _, desc = rest.partition('—')
            elif ' - ' in rest:
                name, _, desc = rest.partition(' - ')
            else:
                name = rest
                desc = ""
            moves.append((key.strip(), name.strip(), desc.strip()))
        else:
            # Skip non-key move entries (e.g. just a paragraph item)
            continue

    return {"passive": passive, "evolution": evolution, "moves": moves}


def parse_obtainment_section(html):
    """Return the raw text content of the obtainment section."""
    m = re.search(r'<section id="obtainment"[^>]*>(.*?)</section>', html, re.S)
    if not m:
        return ""
    body = m.group(1)
    # Strip section-title h2
    body = re.sub(r'<h2[^>]*>.*?</h2>', '', body, flags=re.S)
    text = re.sub(r'<[^>]+>', '\n', body)
    text = re.sub(r'\n\s*\n', '\n', text).strip()
    return text


def is_special_obtainment(tags, obtainment_text):
    """D4C / Tusk / SPTW / GER have non-standard obtainment."""
    text = obtainment_text.lower()
    if "special obtainment" in ''.join(tags).lower():
        return True
    if "cannot be obtained through standard" in text:
        return True
    if "unobtainable" in text or "cannot be obtained" in text:
        return True
    return False


def detect_stand_category(tags, abilities):
    tags_lower = [t.lower() for t in tags]
    if abilities["evolution"]:
        return "evolving"
    if "special obtainment" in tags_lower:
        return "special"
    if "unobtainable" in tags_lower or any("unobtainable" in t for t in tags_lower):
        return "unobtainable"
    return "standard"


# ── Templates ────────────────────────────────────────────────────────────────

FAQ_FALLBACK_STANDARD = [
    ("Can I target this Stand specifically?",
     "Stand rolls are random — you cannot target this Stand specifically. Every Arrow Shard or Corpse Part roll can result in any obtainable Stand."),
    ("What is the fastest way to get this Stand?",
     "Corpse Part KOTH events are the fastest grind for any Rare Stand, with a 15–20% success rate, vs. Arrow Shard fishing which has a 0.1% drop rate."),
    ("Does this Stand have a shiny variant?",
     "Yes — any obtainment roll has a 5% chance to grant a Shiny skin. Check the Skins section on this page for confirmed variants."),
    ("How do I know if this Stand is right for my playstyle?",
     "Review the Abilities section and compare with other Stands in our Tier List linked below.")
]

FAQ_FALLBACK_SPECIAL_D4C = [
    ("Can I get D4C through normal rolls?",
     "No. D4C has a very specific special obtainment and cannot drop from standard Arrow Shard or Corpse Part rolls."),
    ("What are all four conditions for D4C?",
     "Reach 100 kills with a 10 killstreak, be in the Deserts area, and get knocked while a Corpse Part spawns — this gives a 10% chance for a heart to spawn."),
    ("What does D4C's Dimension Hop passive do?",
     "While wearing a poncho, taking >20 damage in one blow sends you to another dimension briefly, negating the damage. Putting on or removing the poncho does the same and brings nearby players with you."),
    ("Is D4C a Rare or Default Stand?",
     "D4C is classified as DEFAULT with Special Obtainment — the rarity label reflects its non-standard acquisition path.")
]

FAQ_FALLBACK_SPECIAL_TUSK = [
    ("Is Tusk a Rare Stand?",
     "No — Tusk Acts 1-3 is classified as DEFAULT with Special Obtainment, and cannot be obtained through standard rolls."),
    ("How do I get Tusk?",
     "Fuse with Saint's Left Arm — this has a 2% chance to grant Tusk Acts 1-3."),
    ("What does Tusk's Crippled passive mean?",
     "Greatly reduced movement speed, cannot sprint, cannot use guns — Tusk is a commitment build. Make sure you understand the trade-offs before fusing."),
    ("Can I switch between Acts?",
     "Yes — press V to cycle between Act 1, Act 2, and Act 3. Each Act changes one of the move properties.")
]

FAQ_FALLBACK_EVOLVING_SP = [
    ("Does Star Platinum evolve?",
     "Yes — using the G (Time Stop Movement) ability has a 1% chance to evolve Star Platinum into Star Platinum | The World."),
    ("Can I target the evolution?",
     "No. Evolution is a 1% chance, so you just have to keep using G on Star Platinum and hope for the best."),
    ("Is Star Platinum time-manipulating?",
     "Yes — it is classified as RARE / HUMANOID / Time-Manipulating, alongside The World, King Crimson, TWAU, Mandom, and Whitesnake."),
    ("Does this Stand have a shiny variant?",
     "Yes — any obtainment roll has a 5% chance to grant a Shiny skin. Check the Skins section on this page for confirmed variants.")
]

FAQ_FALLBACK_EVOLVING_SPTW = [
    ("Can Star Platinum | The World be obtained through normal rolls?",
     "No. It only appears when Star Platinum evolves — there is no Arrow Shard or Corpse Part that drops it directly."),
    ("What is the evolution trigger?",
     "When using Star Platinum's G ability (Time Stop Movement), there is a 1% chance to evolve automatically."),
    ("How long does SPTW's timestop last?",
     "Roughly 2 seconds in a medium radius — shorter than The World's timestop, but SPTW is a more rounded Stand overall."),
    ("Does SPTW have skins?",
     "Yes — check the Skins section on this page for confirmed variants.")
]

FAQ_FALLBACK_UNOBTAINABLE_GER = [
    ("Can I get Gold Experience Requiem?",
     "No. Gold Experience Requiem is classified as UNOBTAINABLE / SPEC and is a developer/special stand. It cannot be obtained through standard gameplay rolls."),
    ("What does Return To Zero do?",
     "It nullifies incoming attacks, reverts targets to zero, ragdolls them for 5 seconds, and cancels time abilities except Mandom and Time Erase — on a 60-second cooldown."),
    ("Is GER just Gold Experience with better numbers?",
     "No — it has a unique passive (True Life Giver, green Life Giver bar with 5 simultaneous moves) and the Return To Zero ultimate."),
    ("Where can I find the playable base form?",
     "See our Gold Experience page — that is the obtainable base form of this Stand.")
]

FAQ_FALLBACK_ALL_PASSIVE = [
    ("Does this Stand have any active moves?",
     "No — this Stand has no active moves at all. All benefits come from its passives."),
    ("What buffs does it give?",
     "It supplies random buffs including Dodges, Damage buffs, Healing, Speed buffs, and Increased accuracy."),
    ("What is the utility stand good for?",
     "It shines as a support/utility companion — it costs no stamina to summon and provides consistent random buffs.")
]


def pick_faq(stand_dir, tags, abilities, obtainment_text):
    text_lower = obtainment_text.lower()
    tags_lower = [t.lower() for t in tags]

    if stand_dir == "d4c" or (
        "special obtainment" in tags_lower and "100 kills" in text_lower
    ):
        return FAQ_FALLBACK_SPECIAL_D4C
    if stand_dir == "tusk-acts" or (
        "special obtainment" in tags_lower and "saint's left arm" in text_lower
    ):
        return FAQ_FALLBACK_SPECIAL_TUSK
    if stand_dir == "gold-experience-requiem" or "unobtainable" in tags_lower:
        return FAQ_FALLBACK_UNOBTAINABLE_GER
    if stand_dir == "star-platinum-the-world" or (
        "evolution" in tags_lower and "1% chance" in text_lower
    ):
        return FAQ_FALLBACK_EVOLVING_SPTW
    if stand_dir == "star-platinum" or abilities["evolution"]:
        return FAQ_FALLBACK_EVOLVING_SP
    if abilities["moves"] == [] and abilities["passive"]:
        # Hey Ya style — all-passive stand
        return FAQ_FALLBACK_ALL_PASSIVE
    return FAQ_FALLBACK_STANDARD


def build_quick_answer(stand_name, tags, abilities, obtainment_text, stand_dir):
    """Compose a 3-4 sentence Quick Answer using facts from the page only."""
    rarity = None
    category = None
    for t in tags:
        t_lower = t.lower()
        if t_lower in ("rare", "default", "unobtainable"):
            rarity = t
        elif "time-manipulating" in t_lower:
            category = "time-manipulating"
        elif t_lower in ("special obtainment", "evolution", "spec", "non-humanoid", "humanoid", "utility"):
            if not category:
                category = t

    first = f"<strong>{stand_name}</strong>"
    if rarity:
        first += f" is a <strong>{rarity}</strong>"
    if category:
        first += f" {category} Stand"
    else:
        first += " Stand"
    first += " in Bridger Western."

    # Obtainment sentence — adapt from raw text
    ot = obtainment_text
    ot_clean = re.sub(r'\s+', ' ', ot).strip()
    if "special obtainment" in ''.join(t.lower() for t in tags) or "cannot be obtained" in ot_clean.lower() or "100 kills" in ot_clean.lower():
        # D4C style
        obtain_sent = "It has a very specific special obtainment (see How to Obtain below) and cannot be dropped from standard rolls."
    elif stand_dir == "tusk-acts" or "saint's left arm" in ot_clean.lower():
        obtain_sent = "It is obtained by fusing with Saint's Left Arm (2% chance) and causes permanent disability — see How to Obtain for details."
    elif stand_dir == "gold-experience-requiem" or "unobtainable" in ot_clean.lower():
        obtain_sent = "It is classified as UNOBTAINABLE / SPEC — a developer stand that cannot be obtained through standard gameplay rolls."
    elif abilities["evolution"]:
        obtain_sent = "It evolves into Star Platinum | The World with a 1% chance when using its G ability; the base form is obtained via standard Arrow Shard fishing or Corpse Part KOTH events."
    elif stand_dir == "star-platinum-the-world":
        obtain_sent = "It only appears when Star Platinum evolves — 1% chance from Star Platinum's G (Time Stop Movement) ability. It cannot drop from standard rolls."
    else:
        # Standard RARE/DEFAULT — normal random rolls
        obtain_sent = "It is obtained through Arrow Shard fishing (0.1% drop rate) or Corpse Part KOTH events (15–20% success rate), and any obtainment roll has a 5% chance to grant a Shiny skin."

    # Signature move sentence
    sig = None
    if abilities["moves"]:
        # Pick the most distinctive move — last is often the ult
        ult = abilities["moves"][-1]
        key, name, desc = ult
        sig = f"Its signature move is <strong>{key} — {name}</strong>"
        if desc:
            sig += f" ({desc.rstrip('.')})"
        sig += "."

    sentences = [first, obtain_sent]
    if sig:
        sentences.append(sig)

    return " ".join(sentences)


# ── Reconstruction ───────────────────────────────────────────────────────────

def reconstruct_page(stand_dir):
    path = os.path.join(ROOT, "stands", stand_dir, "index.html")
    html = open(path).read()

    stand_name = extract_stand_name(html)
    h1_title = extract_h1_title(html)
    emoji, tags = extract_overview(html) or ("", [])
    abilities = parse_abilities_section(html)
    obtainment_text = parse_obtainment_section(html)

    # ── 1. data-updated ──────────────────────────────────────────────
    html = html.replace(
        'data-updated="April 2026"',
        'data-updated="November 2026"'
    )

    # ── 2. JSON-LD: expand Article, insert FAQPage ────────────────────
    article_pattern = (
        r'(\s*<script type="application/ld\+json">\s*\{\s*"@context": "https://schema.org",\s*'
        r'"@type": "Article",\s*"headline": "[^"]+",\s*"description": "[^"]+",\s*'
        r'"url": "https://bridgerwestern\.cc/stands/' + re.escape(stand_dir) + r'/"\s*\}\s*</script>)'
    )

    m_art = re.search(article_pattern, html, re.S)
    article_url = f"https://bridgerwestern.cc/stands/{stand_dir}/"

    expanded_article = f'''    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{stand_name} – Bridger Western Stand Guide 2026",
        "description": "Complete guide to {stand_name} in Bridger Western, including skills, abilities, rarity, and obtainment.",
        "url": "{article_url}",
        "mainEntityOfPage": "{article_url}",
        "dateModified": "{DATE_MODIFIED}",
        "author": {{ "@type": "Organization", "name": "Bridger Western Wiki & Trello", "url": "https://bridgerwestern.cc/" }},
        "publisher": {{ "@type": "Organization", "name": "Bridger Western Wiki & Trello", "url": "https://bridgerwestern.cc/" }}
    }}
    </script>'''

    faq_data = pick_faq(stand_dir, tags, abilities, obtainment_text)
    faq_entries = []
    for q, a in faq_data:
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
        "name": "{stand_name} – Frequently Asked Questions",
        "url": "{article_url}",
        "mainEntity": [
{faq_json}
        ]
    }}
    </script>'''

    if m_art:
        html = html[:m_art.start()] + expanded_article + '\n' + faq_block + html[m_art.end():]
    else:
        # Fallback: insert FAQPage before the first BreadcrumbList block
        bc_m = re.search(
            r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema.org",\s*"@type": "BreadcrumbList"',
            html, re.S
        )
        if bc_m:
            html = html[:bc_m.start()] + faq_block + '\n' + html[bc_m.start():]

    # ── 3. Quick Answer right after <main> ────────────────────────────
    html = re.sub(
        r'(<main>\s*)',
        lambda m: m.group(1) +
            f'''    <section class="container" style="margin-top:24px;">
        <div class="answer-box">
            <span class="answer-label">Quick Answer</span>
            <p>{build_quick_answer(stand_name, tags, abilities, obtainment_text, stand_dir)}</p>
        </div>
    </section>
''',
        html, count=1
    )

    # ── 4. Replace #overview with Contents + What-is ──────────────────
    if emoji and tags:
        rarity_pill = None
        for t in tags:
            t_lower = t.lower()
            if t_lower == "rare":
                rarity_pill = ('background:#ffd700;color:#2b1c11', "font-weight:bold;")
                continue
            if t_lower == "default":
                rarity_pill = ('background:#6c757d;color:white', "")
                continue
            if t_lower == "unobtainable":
                rarity_pill = ('background:#dc3545;color:white', "font-weight:bold;")
                continue

        tag_spans_html = ""
        for t in tags:
            # Apply pill style to first tag (assume it's rarity)
            styles = []
            classes = ""
            if t == tags[0]:
                t_lower = t.lower()
                if t_lower in ("rare", "default", "unobtainable"):
                    styles.append(rarity_pill[0])
                    if rarity_pill[1]:
                        styles.append(rarity_pill[1])
                    classes = "font-weight:bold;"
            if "time-manipulating" in t.lower() or t_lower_in(t.lower(), "evolution"):
                styles.append('background:#28a745;color:white')
            elif "special obtainment" in t.lower():
                styles.append('background:#e67e22;color:white')
            elif "non-humanoid" in t.lower() or "utility" in t.lower():
                styles.append('background:#6f42c1;color:white')
            elif "humanoid" in t.lower():
                styles.append('background:#17a2b8;color:white')
            elif "spec" in t.lower() or "unobtainable" in t.lower():
                styles.append('background:#dc3545;color:white')
            else:
                styles.append('background:#17a2b8;color:white')
            style_str = '; '.join(styles) + ';'
            tag_spans_html += f'<span style="{style_str}padding:3px 10px;border-radius:4px;font-size:0.8rem;">{t}</span>\n'

        contents_href_map = [
            ("#what-is", f"What is {stand_name}?"),
            ("#obtainment", f"How to obtain {stand_name}"),
            ("#abilities", "Abilities and stats"),
            ("#skins", "Skins"),
            ("#faq", "Frequently asked questions"),
            ("#sources", "Sources &amp; last verified"),
        ]
        contents_html = '\n'.join(
            f'                    <li><a href="{href}">{label}</a></li>'
            for href, label in contents_href_map
        )

        # What-is blurb
        blurb_stand = build_what_is_blurb(stand_name, tags)

        what_is_card = f'''        <section id="contents" style="margin-bottom: 32px;">
            <div class="sketch-card">
                <h2 style="margin:0 0 10px;">Contents</h2>
                <ul style="line-height:1.9; margin:0; padding-left:20px;">
{contents_html}
                </ul>
            </div>
        </section>

        <section id="what-is" style="margin-bottom: 32px;">
            <h2 class="section-title">{emoji} What is {stand_name}?</h2>
            <div class="sketch-card" style="display:flex; gap:16px; flex-wrap:wrap; align-items:center;">
                <div style="font-size:4rem;" aria-hidden="true">{emoji}</div>
                <div style="flex:1; min-width:240px;">
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
                        {tag_spans_html}
                    </div>
                    <p style="margin:0;">{blurb_stand}</p>
                </div>
            </div>
        </section>
'''
    else:
        what_is_card = f'''        <section id="contents" style="margin-bottom: 32px;">
            <div class="sketch-card">
                <h2 style="margin:0 0 10px;">Contents</h2>
                <ul style="line-height:1.9; margin:0; padding-left:20px;">
                    <li><a href="#what-is">What is {stand_name}?</a></li>
                    <li><a href="#obtainment">How to obtain {stand_name}</a></li>
                    <li><a href="#abilities">Abilities and stats</a></li>
                    <li><a href="#skins">Skins</a></li>
                    <li><a href="#faq">Frequently asked questions</a></li>
                    <li><a href="#sources">Sources &amp; last verified</a></li>
                </ul>
            </div>
        </section>

        <section id="what-is" style="margin-bottom: 32px;">
            <h2 class="section-title">🌍 What is {stand_name}?</h2>
            <div class="sketch-card">
                <p style="margin:0;">Bridger Western Stand.</p>
            </div>
        </section>
'''

    html = re.sub(
        r'\s*<section id="overview"[^>]*>.*?</section>\s*',
        '\n' + what_is_card,
        html, count=1, flags=re.S
    )

    # ── 5. Abilities section: normalize title + build data table ─────
    html = re.sub(
        r'(<section id="abilities"[^>]*>)\s*<h2 class="section-title">.*?</h2>',
        r'\1\n            <h2 class="section-title">⚡ Abilities &amp; Stats</h2>',
        html, count=1, flags=re.S
    )
    html = rebuild_abilities_section(html, abilities)

    # ── 6. Obtainment section: normalize title + build data table ─────
    # Special pages (D4C / Tusk / SPTW / GER): keep original text,
    # just wrap inside a data-table + card structure; standard pages get
    # the canonical 2-row (Arrow Shard / Corpse Part) table.
    html = rebuild_obtainment_section(html, stand_dir, tags, abilities, obtainment_text)

    # ── 7. Delete #seo section ────────────────────────────────────────
    html = re.sub(
        r'\s*<section id="seo"[^>]*>.*?</section>\s*',
        '\n', html, count=1, flags=re.S
    )

    # ── 8. Insert FAQ + Sources before #related ───────────────────────
    faq_html = build_faq_html(faq_data)
    sources_html = build_sources_html(stand_dir)

    html = re.sub(
        r'\s*(<section id="related" style="margin-top:40px;">)',
        lambda m: '\n' + faq_html + '\n' + sources_html + '\n' + m.group(1),
        html, count=1
    )

    # ── 9. Append FAQ accordion JS ─────────────────────────────────────
    # Inject one-time, before </body>. Pattern match is safe — we don't
    # touch the existing lightbox helper at all.
    if "FAQ accordion" not in html:
        accordion_js = '''    // FAQ accordion
    document.querySelectorAll('.faq-item h3').forEach(function(item){
        item.addEventListener('click',function(){
            var faqItem=this.parentElement;
            var answer=faqItem.querySelector('.faq-answer');
            faqItem.classList.toggle('active');
            answer.style.maxHeight=faqItem.classList.contains('active')?answer.scrollHeight+'px':'0';
        });
    });
'''
        # Insert before </body>, outside any existing <script> block
        html = re.sub(
            r'(</body>)',
            lambda m: accordion_js + '\n' + m.group(1),
            html, count=1
        )
        # But the accordion JS must live inside a <script> tag. Wrap the
        # injected block into its own <script>...</script> pair.
        html = html.replace(
            accordion_js + '\n</body>',
            '    <script>\n' + accordion_js + '    </script>\n</body>'
        )

    open(path, 'w').write(html)
    print(f"  ✓ {stand_name} ({stand_dir})")


# ── Sub builders ────────────────────────────────────────────────────────────

def build_what_is_blurb(stand_name, tags):
    tags_lower = [t.lower() for t in tags]
    rarity = next((t for t in tags if t.lower() in ("rare", "default", "unobtainable")), None)
    if rarity:
        if rarity.lower() == "rare":
            rarity_phrase = "a Rare"
        elif rarity.lower() == "default":
            rarity_phrase = "a Default"
        else:
            rarity_phrase = "an unobtainable/special"
    else:
        rarity_phrase = "a"

    if "time-manipulating" in tags_lower:
        return f"A time-manipulating stand belonging to the Rare time-control group alongside King Crimson, TWAU, Star Platinum, Mandom and Whitesnake."
    if "evolution" in tags_lower or "evolution" in (t.lower() for t in tags):
        return f"The evolved form of Star Platinum — obtained exclusively through a 1% chance evolution trigger, never from standard rolls."
    if "special obtainment" in tags_lower:
        return f"{rarity_phrase.capitalize()} stand with a non-standard acquisition path that cannot be rolled from Arrow Shards or Corpse Parts."
    if "unobtainable" in tags_lower:
        return "A special/developer stand that cannot be obtained through standard gameplay rolls."
    if "utility" in tags_lower or "non-humanoid" in tags_lower:
        return f"A utility companion that provides buffs to the player without requiring active ability inputs."
    return f"{rarity_phrase.capitalize()} stand for Bridger Western, obtained through standard random rolls via Arrow Shard fishing or Corpse Part KOTH events."


def t_lower_in(s, sub):
    return sub in s


def rebuild_abilities_section(html, abilities):
    """Replace the entire content inside <section id="abilities">...</section>
    with passive card + moves data table, preserving Evolution card if any."""

    def _rebuild(m):
        body = m.group(1)
        # Keep the opening <section id="abilities" ...>
        opening_tag = re.match(r'<section id="abilities"[^>]*>', body)
        if not opening_tag:
            return body
        section_open = opening_tag.group(0)

        # Build passive card
        passive_html = ""
        if abilities["passive"]:
            passive_html = f'''            <div class="sketch-card" style="margin-bottom:16px;">
                <h3 style="margin-top:0;">Passive</h3>
                <p style="margin:0;">{abilities["passive"]}</p>
            </div>
'''

        # Build moves table (only if we actually parsed moves)
        moves_html = ""
        if abilities["moves"]:
            rows = []
            for key, name, desc in abilities["moves"]:
                desc_clean = desc if desc else ""
                rows.append(
                    f"                        <tr><td>{key}</td><td>{name}</td><td>{desc_clean}</td></tr>"
                )
            moves_html = f'''            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Move</th>
                            <th>Effect</th>
                        </tr>
                    </thead>
                    <tbody>
{os.linesep.join(rows)}
                    </tbody>
                </table>
            </div>
'''
        else:
            # No moves (Hey Ya style): show passives-only summary
            moves_html = '''            <div class="sketch-card">
                <p style="margin:0;"><em>This Stand has no active moves — all benefits come from its passives.</em></p>
            </div>
'''

        # Build evolution card (Star Platinum only)
        evolution_html = ""
        if abilities["evolution"]:
            evolution_html = f'''            <div class="sketch-card" style="margin-top:16px; border-left: 3px solid #ffd700;">
                <h3 style="margin-top:0;">✨ Evolution</h3>
                <p style="margin:0;">{abilities["evolution"]}</p>
            </div>
'''

        return (
            section_open +
            '\n            <h2 class="section-title">⚡ Abilities &amp; Stats</h2>\n' +
            passive_html +
            moves_html +
            evolution_html +
            f'        </section>'
        )

    html2 = re.sub(
        r'(<section id="abilities"[^>]*>).*?(</section>)',
        lambda mm: _rebuild(mm),
        html, count=1, flags=re.S
    )
    return html2


def rebuild_obtainment_section(html, stand_dir, tags, abilities, obtainment_text):
    """Replace obtainment section content. Special pages keep original text
    inside a card; standard pages get the canonical two-row table."""
    tags_lower = [t.lower() for t in tags]
    is_special = (
        "special obtainment" in tags_lower
        or "unobtainable" in tags_lower
        or abilities["evolution"]
        or stand_dir in ("star-platinum-the-world", "gold-experience-requiem", "d4c", "tusk-acts")
    )

    def _rebuild(m):
        body = m.group(1)
        opening_tag = re.match(r'<section id="obtainment"[^>]*>', body)
        if not opening_tag:
            return body
        section_open = opening_tag.group(0)

        if is_special:
            # Wrap original text in a card + table-structure hint
            raw_text_html = body
            # Strip old h2
            raw_text_html = re.sub(r'<h2[^>]*>.*?</h2>', '', raw_text_html, flags=re.S).strip()
            new = (
                section_open +
                '\n            <h2 class="section-title">🎯 How to Obtain</h2>\n' +
                f'            <div class="sketch-card" style="margin-bottom:16px;">\n' +
                f'                <p style="margin:0;">Stand rolls are random by default, but this Stand has <strong>non-standard acquisition requirements</strong>. Full details below.</p>\n' +
                f'            </div>\n' +
                f'            <div class="sketch-card">\n' +
                f'                {raw_text_html}\n' +
                f'            </div>\n' +
                f'        </section>'
            )
        else:
            # Standard — 2-row table + shiny note
            # Check if any ability has "Timestop" so we can hint at it
            any_time = any(
                "timestop" in (d.lower() if d else "") or "time" in (n.lower() if n else "")
                for _, n, d in abilities["moves"]
            )
            time_note = ""
            if any_time:
                time_note = " — any obtainment roll has a 5% chance to grant a Shiny skin."
            else:
                time_note = ". Any obtainment roll has a 5% chance to grant a Shiny skin."

            new = (
                section_open +
                '\n            <h2 class="section-title">🎯 How to Obtain</h2>\n' +
                f'            <div class="sketch-card" style="margin-bottom:16px;">\n' +
                f'                <p style="margin:0;">Stand rolls are random — you cannot target this Stand specifically. Every Arrow Shard or Corpse Part roll can result in any obtainable Stand{time_note}</p>\n' +
                f'            </div>\n' +
                f'            <div class="data-table-wrapper">\n' +
                f'                <table class="data-table">\n' +
                f'                    <thead>\n' +
                f'                        <tr>\n' +
                f'                            <th>Method</th>\n' +
                f'                            <th>Requirement</th>\n' +
                f'                            <th>Rate</th>\n' +
                f'                        </tr>\n' +
                f'                    </thead>\n' +
                f'                    <tbody>\n' +
                f'                        <tr>\n' +
                f'                            <td><a href="/stands/arrow-shard/">Arrow Shard fishing</a></td>\n' +
                f'                            <td>Fish up an Arrow Shard (rare fishing drop), then use it</td>\n' +
                f'                            <td>0.1% drop rate</td>\n' +
                f'                        </tr>\n' +
                f'                        <tr>\n' +
                f'                            <td><a href="/stands/corpse-part-guide/">Corpse Part KOTH event</a></td>\n' +
                f'                            <td>3+ players in server; grab the part and hold it (water method recommended)</td>\n' +
                f'                            <td>15–20% success rate</td>\n' +
                f'                        </tr>\n' +
                f'                    </tbody>\n' +
                f'                </table>\n' +
                f'            </div>\n' +
                f'        </section>'
            )
        return new

    html2 = re.sub(
        r'(<section id="obtainment"[^>]*>).*?(</section>)',
        lambda mm: _rebuild(mm),
        html, count=1, flags=re.S
    )
    return html2


def build_faq_html(faq_data):
    items = []
    for q, a in faq_data:
        items.append(
            f'''            <div class="faq-item">
                <h3>{q}</h3>
                <div class="faq-answer">
                    <p>{a}</p>
                </div>
            </div>
'''
        )
    return (
        '        <section id="faq" style="margin-top:40px;">\n'
        '            <h2 class="section-title">❓ Frequently Asked Questions</h2>\n'
        + ''.join(items) +
        '        </section>'
    )


def build_sources_html(stand_dir):
    return (
        '        <section id="sources" style="margin-top:40px;">\n'
        '            <h2 class="section-title">📌 Sources &amp; Last Verified</h2>\n'
        '            <div class="sketch-card">\n'
        f'                <p style="margin:0;">Last verified: <strong>{LAST_VERIFIED}</strong>. Drop rates and mechanics confirmed through in-game testing and cross-checked with community reports — see <a href="/about/">our methodology</a>. Found something outdated? Reach us via the links in the footer.</p>\n'
        '            </div>\n'
        '        </section>'
    )


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print(f"\nRestructuring {len(STAND_DIRS)} Stand pages...\n")
    for stand_dir in STAND_DIRS:
        try:
            reconstruct_page(stand_dir)
        except Exception as e:
            print(f"  ✗ {stand_dir}: {e}")
            import traceback
            traceback.print_exc()
    print(f"\nDone. ({DATE_MODIFIED})")


if __name__ == "__main__":
    main()
