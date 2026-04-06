import re
import os

# Find all HTML files
html_files = []
for root, dirs, files in os.walk('.'):
    if '/.git' in root or '/node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html') and file != '404.html':
            html_files.append(os.path.join(root, file))

updated_count = 0

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Check if this file already has Horse Guide in Locations dropdown
    if 'Horse Guide</a>' in content:
        continue
    
    # Check if this file has Locations dropdown
    if 'Locations ▾</a>' not in content:
        continue
    
    # Determine the correct relative path based on file location
    depth = filepath.count('/') - 1  # -1 because we start from current dir
    if depth == 0:
        prefix = './'
    elif depth == 1:
        prefix = '../'
    else:
        prefix = '../../'
    
    # Pattern to find Locations dropdown and add Horse Guide
    # Match the World Map line and add Horse Guide after it
    pattern = r'(<a href="[^"]*locations/map/">World Map</a>)\s*\n(\s*)(<a href="[^"]*locations/faq/">Locations FAQ</a>)'
    
    replacement = r'\1\n\2<a href="' + prefix + 'locations/horses/">Horse Guide</a>\n\2\3'
    
    content = re.sub(pattern, replacement, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_count += 1
        print(f"Updated: {filepath}")

print(f"\nTotal files updated: {updated_count}")
