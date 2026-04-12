# Content Synchronization Guide

## Overview

This system automatically keeps all documentation files in sync when new pages are created. The following files are updated:

1. **llms.txt** - Simplified content summary for AI training
2. **llms-full.txt** - Detailed content index for comprehensive AI training
3. **robots.txt** - Search engine crawler instructions (adds new pages to allow list)
4. **sitemap.xml** - Sitemap for SEO (adds new pages)
5. **CONTENT_ROADMAP.md** - Content planning and progress tracking

## Quick Start

### Method 1: Create New Page (Recommended)

```bash
# Create a new page with automatic synchronization
node scripts/create-page.js --title "Your Page Title" --category "stands"
```

Options:
- `--title` (required): Page title
- `--category`: Category (stands, weapons, cards, items, guides, fishing, locations, other)
- `--slug`: URL slug (auto-generated from title if not provided)
- `--desc`: Meta description
- `--template`: Template file (default: page-template.html)
- `--dry-run`: Preview without creating files

Example:
```bash
node scripts/create-page.js \
  --title "Advanced Fishing Techniques" \
  --category "fishing" \
  --desc "Complete guide to advanced fishing methods in Bridger Western"
```

### Method 2: Manual Content Indexing

```bash
# Index all content and update all files
node scripts/content-indexer.js
```

### Method 3: Using Make Commands

```bash
# Create new page (interactive)
make new-page

# Index all content
make index-content

# Sync everything
make sync-all

# Test the system
make test
```

## How It Works

### 1. **Page Creation Flow**
```
User creates page → Script generates HTML → Content Indexer runs → All files updated
```

### 2. **File Updates**
When a new page is created or content is indexed:

| File | What Gets Updated | Purpose |
|------|-------------------|---------|
| `llms.txt` | New page added to "Available Content" section | AI training data (simplified) |
| `llms-full.txt` | New page with detailed description added | AI training data (comprehensive) |
| `robots.txt` | `Allow: /new-page-url/` line added | Search engine access control |
| `sitemap.xml` | New `<url>` entry added | SEO sitemap |
| `CONTENT_ROADMAP.md` | New page added to roadmap | Content planning |

### 3. **Automated Updates**
The system automatically:
- Extracts metadata from HTML files (title, description)
- Generates proper URLs based on file structure
- Updates modification dates
- Maintains consistent formatting

## Git Hooks (Optional)

To get reminders when new HTML files are committed:

```bash
# Install Git pre-commit hook
make install-hooks
```

This will remind you to run the content indexer when new HTML files are detected.

## File Descriptions

### llms.txt
- **Purpose**: Simplified content summary for AI crawlers
- **Format**: Markdown with bullet points
- **Updated**: When new pages are added
- **Example Use**: Training AI models, search engine understanding

### llms-full.txt
- **Purpose**: Detailed content index for comprehensive AI training
- **Format**: Markdown with sections and detailed descriptions
- **Updated**: When new pages are added
- **Example Use**: Advanced AI training, content analysis

### robots.txt
- **Purpose**: Instructions for search engine crawlers
- **Format**: Standard robots.txt with explicit allow directives
- **Updated**: New `Allow:` lines added for new pages
- **Example Use**: Controlling search engine access

### sitemap.xml
- **Purpose**: XML sitemap for search engines
- **Format**: Standard sitemap XML
- **Updated**: New `<url>` entries added
- **Example Use**: SEO, search engine indexing

### CONTENT_ROADMAP.md
- **Purpose**: Content planning and progress tracking
- **Format**: Markdown with categorized content lists
- **Updated**: New pages added to appropriate categories
- **Example Use**: Planning, progress tracking, content gaps

## Best Practices

### 1. **Always Use the Script**
```bash
# ✅ DO: Use the create-page script
node scripts/create-page.js --title "New Guide" --category "guides"

# ❌ DON'T: Manually create pages without syncing
# (You'll have to run the indexer manually)
```

### 2. **Regular Syncs**
```bash
# Run content indexer regularly to ensure everything is up-to-date
node scripts/content-indexer.js

# Or use the make command
make sync-all
```

### 3. **Verify Updates**
After creating a new page, verify the updates:
- Check `llms.txt` for the new entry
- Check `robots.txt` for the new `Allow:` line
- Check `sitemap.xml` for the new URL

### 4. **Troubleshooting**

**Problem**: New page not showing in llms.txt
**Solution**: Run `node scripts/content-indexer.js`

**Problem**: Robots.txt getting too long
**Solution**: The script maintains the file efficiently, but you can manually clean if needed

**Problem**: Script fails with permissions error
**Solution**: Ensure you have write permissions to the files

## Manual Updates (When Needed)

If you need to manually update specific files:

### Update llms.txt
```bash
# Run the indexer
node scripts/content-indexer.js
```

### Update robots.txt manually
Add:
```
Allow: /your-new-page-url/
```

### Update sitemap.xml manually
Add:
```xml
<url>
  <loc>https://bridgerwestern.cc/your-new-page-url/</loc>
  <lastmod>2026-04-12</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

## Support

For issues or questions:
1. Check the script output for error messages
2. Verify file permissions
3. Ensure Node.js is installed (`node --version`)
4. Check that scripts are executable

Remember: Keeping these files synchronized improves SEO, AI discoverability, and overall site maintenance.