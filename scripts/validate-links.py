#!/usr/bin/env python3
"""Validate all new Related Guides internal links exist on disk."""
import os, re, sys

ROOT = '/Users/gingin/Desktop/1127/bright/bright'

ok = 0
miss = 0
missing_list = []

for cat in ['stands', 'weapons', 'cards', 'locations', 'items']:
    for dirpath, _, filenames in os.walk(os.path.join(ROOT, cat)):
        for fname in filenames:
            if fname != 'index.html': continue
            fpath = os.path.join(dirpath, fname)
            try:
                content = open(fpath).read()
            except: continue

            # Find Related Guides section (up to next </section>)
            m = re.search(r'Related \w+ Guides[\s\S]*?</section>', content)
            if not m: continue

            hrefs = re.findall(r'href="([^"]+)"', m.group())
            for h in hrefs:
                # Skip external, anchors, assets
                if h.startswith(('http', '#', '/style', '/favicon', 'mailto')):
                    ok += 1; continue

                # Resolve
                if h.startswith('/'):
                    target = os.path.join(ROOT, h.lstrip('/'))
                else:
                    target = os.path.normpath(os.path.join(dirpath, h))

                # Strip fragment
                target = target.split('#')[0]
                # Strip trailing slash index.html
                check_dir = target
                check_file = target if os.path.splitext(target)[1] else os.path.join(target, 'index.html')

                if os.path.exists(check_dir) or os.path.exists(check_file):
                    ok += 1
                else:
                    miss += 1
                    rel = os.path.relpath(fpath, ROOT)
                    missing_list.append(f'  ❌ {rel} → {h}  (resolved: {check_file})')

print(f'========== 全站 Related Guides 死链验证 ==========')
print(f'✅ OK:  {ok}')
print(f'❌ MISS: {miss}')
if missing_list:
    print()
    for m in missing_list: print(m)
print()
sys.exit(1 if miss else 0)
