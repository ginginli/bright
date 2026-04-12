# Makefile for Bridger Western Wiki

.PHONY: help new-page index-content sync-all test clean enable-dynamic-ads

# Default target
help:
	@echo "📚 Bridger Western Wiki Management Commands"
	@echo ""
	@echo "  make new-page         Create a new page interactively"
	@echo "  make index-content    Index all content and update documentation"
	@echo "  make sync-all         Sync all content (index + update files)"
	@echo "  make enable-dynamic-ads Enable dynamic ads for existing pages"
	@echo "  make test             Test the scripts"
	@echo "  make clean            Remove temporary files"
	@echo ""

# Interactive new page creation
new-page:
	@echo "🛠️  Creating a new page..."
	@node scripts/create-page.js

# Index all content
index-content:
	@echo "🔍 Indexing all content..."
	@node scripts/content-indexer.js

# Sync everything (run all sync tasks)
sync-all: index-content
	@echo "✅ All content synchronized!"

# Enable dynamic ads for existing pages
enable-dynamic-ads:
	@echo "🚀 Enabling dynamic ads for existing pages..."
	@node scripts/enable-dynamic-ads.js

# Enable dynamic ads (dry run - preview only)
enable-dynamic-ads-dry:
	@echo "🔍 Previewing dynamic ads changes (dry run)..."
	@node scripts/enable-dynamic-ads.js --dry-run

# Test scripts
test:
	@echo "🧪 Testing scripts..."
	@echo "Checking if scripts exist..."
	@test -f scripts/content-indexer.js && echo "✅ content-indexer.js found" || echo "❌ content-indexer.js missing"
	@test -f scripts/create-page.js && echo "✅ create-page.js found" || echo "❌ create-page.js missing"
	@test -f scripts/enable-dynamic-ads.js && echo "✅ enable-dynamic-ads.js found" || echo "❌ enable-dynamic-ads.js missing"
	@test -f scripts/pre-commit-hook.js && echo "✅ pre-commit-hook.js found" || echo "❌ pre-commit-hook.js missing"
	@echo ""
	@echo "Testing content indexer (dry run)..."
	@node scripts/content-indexer.js 2>/dev/null && echo "✅ Content indexer works" || echo "❌ Content indexer failed"

# Clean temporary files
clean:
	@echo "🧹 Cleaning temporary files..."
	@find . -name "*.tmp" -delete
	@find . -name "*.log" -delete
	@echo "✅ Cleaned!"

# Install Git hooks (optional)
install-hooks:
	@echo "🔗 Installing Git hooks..."
	@if [ -f scripts/pre-commit-hook.js ]; then \
		echo '#!/bin/sh' > .git/hooks/pre-commit; \
		echo 'node scripts/pre-commit-hook.js' >> .git/hooks/pre-commit; \
		chmod +x .git/hooks/pre-commit; \
		echo "✅ Pre-commit hook installed"; \
	else \
		echo "❌ pre-commit-hook.js not found"; \
	fi