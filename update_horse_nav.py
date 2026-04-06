import re
import os

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    # Skip hidden directories and node_modules
    if '/.git' in root or '/node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html') and file != '404.html':
            html_files.append(os.path.join(root, file))

print(f"Found {len(html_files)} HTML files")

updated_count = 0

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: Locations dropdown with World Map but no Horse Guide
    # This pattern matches the dropdown that has "World Map" but not "Horse Guide"
    pattern1 = r'(<a href="[^"]*locations/"[^>]*>Locations ▾</a>\s*<div class="nav-dropdown">\s*<a href="[^"]*locations/">Locations Guide</a>\s*<a href="[^"]*locations/map/">World Map</a>\s*)(<a href="[^"]*locations/faq/">Locations FAQ</a>)'
    
    if re.search(pattern1, content):
        # Insert Horse Guide between World Map and Locations FAQ
        content = re.sub(
            pattern1,
            r'\1<a href="\g<2>".replace("faq/", "horses/")>Horse Guide</a>\n                        \2',
            content
        )
        # Fix the replacement - need to do it properly
        content = re.sub(
            r'(<a href="[^"]*locations/"[^>]*>Locations ▾</a>\s*<div class="nav-dropdown">\s*<a href="[^"]*locations/">Locations Guide</a>\s*<a href="[^"]*locations/map/">World Map</a>\s*)(<a href="[^"]*locations/faq/">Locations FAQ</a>)',
            lambda m: m.group(1) + '<a href="' + m.group(2).split('href="')[1].split('"')[0].replace('faq/', 'horses/') + '">Horse Guide</a>\n                        ' + m.group(2),
            original_content
        )
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_count += 1
        print(f"Updated: {filepath}")

print(f"\nTotal files updated: {updated_count}")
