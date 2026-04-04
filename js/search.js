/**
 * Bridger Western Wiki - Search Functionality
 * Pure frontend fuzzy search with Fuse.js
 */

class WikiSearch {
    constructor() {
        this.searchIndex = null;
        this.fuse = null;
        this.isOpen = false;
        this.selectedIndex = 0;
        this.searchResults = [];
        
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.createSearchUI();
        this.attachEventListeners();
        this.loadSearchIndex();
    }

    createSearchUI() {
        // Create search trigger in header
        const header = document.querySelector('header .container');
        const navToggle = document.querySelector('.nav-toggle');
        
        const searchTrigger = document.createElement('div');
        searchTrigger.className = 'search-trigger';
        searchTrigger.innerHTML = `
            <button class="search-trigger-btn" aria-label="Search wiki">
                <span class="search-icon">🔍</span>
                <span class="search-placeholder">Search wiki...</span>
            </button>
        `;
        
        // Insert before nav-toggle
        header.insertBefore(searchTrigger, navToggle);

        // Create search modal
        const searchModal = document.createElement('div');
        searchModal.className = 'search-modal';
        searchModal.innerHTML = `
            <div class="search-modal-overlay"></div>
            <div class="search-modal-content">
                <div class="search-input-wrapper">
                    <span class="search-input-icon">🔍</span>
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="Search Bridger Western Wiki..."
                        autocomplete="off"
                        spellcheck="false"
                    >
                    <button class="search-close" aria-label="Close search">✕</button>
                </div>
                <div class="search-results-wrapper">
                    <div class="search-results"></div>
                    <div class="search-footer">
                        <span class="search-hint">
                            <kbd>↑</kbd><kbd>↓</kbd> Navigate
                            <kbd>Enter</kbd> Select
                            <kbd>ESC</kbd> Close
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchModal);
    }

    attachEventListeners() {
        // Search trigger button
        const triggerBtn = document.querySelector('.search-trigger-btn');
        triggerBtn.addEventListener('click', () => this.openSearch());

        // Search input
        const searchInput = document.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Close buttons
        const closeBtn = document.querySelector('.search-close');
        const overlay = document.querySelector('.search-modal-overlay');
        closeBtn.addEventListener('click', () => this.closeSearch());
        overlay.addEventListener('click', () => this.closeSearch());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Result clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.search-result-item')) {
                const url = e.target.closest('.search-result-item').dataset.url;
                if (url) window.location.href = url;
            }
        });
    }

    async loadSearchIndex() {
        try {
            const response = await fetch('/search-index.json');
            const data = await response.json();
            this.searchIndex = data.pages;
            
            // Initialize Fuse.js
            this.fuse = new Fuse(this.searchIndex, {
                keys: [
                    { name: 'title', weight: 0.4 },
                    { name: 'keywords', weight: 0.3 },
                    { name: 'description', weight: 0.2 },
                    { name: 'category', weight: 0.1 }
                ],
                threshold: 0.4,
                distance: 100,
                minMatchCharLength: 2,
                includeScore: true,
                includeMatches: true
            });
        } catch (error) {
            console.error('Failed to load search index:', error);
        }
    }

    openSearch() {
        const modal = document.querySelector('.search-modal');
        const input = document.querySelector('.search-input');
        
        modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Focus input after animation
        setTimeout(() => input.focus(), 100);
    }

    closeSearch() {
        const modal = document.querySelector('.search-modal');
        const input = document.querySelector('.search-input');
        
        modal.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        // Clear search
        input.value = '';
        this.searchResults = [];
        this.selectedIndex = 0;
        this.renderResults([]);
    }

    handleSearch(query) {
        if (!this.fuse || query.length < 2) {
            this.renderResults([]);
            return;
        }

        const results = this.fuse.search(query);
        this.searchResults = results.slice(0, 20); // Limit to 20 results
        this.selectedIndex = 0;
        this.renderResults(this.searchResults);
    }

    renderResults(results) {
        const container = document.querySelector('.search-results');
        
        if (results.length === 0) {
            const query = document.querySelector('.search-input').value;
            if (query.length >= 2) {
                container.innerHTML = `
                    <div class="search-empty">
                        <div class="search-empty-icon">🔍</div>
                        <p>No results found for "<strong>${this.escapeHtml(query)}</strong>"</p>
                        <p class="search-empty-hint">Try different keywords or check spelling</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="search-empty">
                        <div class="search-empty-icon">💡</div>
                        <p>Start typing to search...</p>
                        <div class="search-suggestions">
                            <p><strong>Popular searches:</strong></p>
                            <div class="search-suggestion-tags">
                                <span>The World</span>
                                <span>How to get Stand</span>
                                <span>Corpse Part</span>
                                <span>D4C</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add click handlers for suggestions
                container.querySelectorAll('.search-suggestion-tags span').forEach(tag => {
                    tag.addEventListener('click', () => {
                        document.querySelector('.search-input').value = tag.textContent;
                        this.handleSearch(tag.textContent);
                    });
                });
            }
            return;
        }

        // Group results by category
        const grouped = this.groupByCategory(results);
        
        let html = '';
        for (const [category, items] of Object.entries(grouped)) {
            html += `
                <div class="search-category">
                    <div class="search-category-header">
                        ${this.getCategoryIcon(category)} ${category} 
                        <span class="search-category-count">(${items.length})</span>
                    </div>
                    <div class="search-category-items">
                        ${items.map((result, index) => this.renderResultItem(result, index)).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    renderResultItem(result, index) {
        const item = result.item;
        const isSelected = index === this.selectedIndex;
        
        return `
            <div class="search-result-item ${isSelected ? 'selected' : ''}" data-url="${item.url}" data-index="${index}">
                <div class="search-result-icon">${item.icon || '📄'}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${this.highlightMatches(item.title, result.matches)}</div>
                    <div class="search-result-description">${this.escapeHtml(item.description)}</div>
                </div>
                <div class="search-result-arrow">→</div>
            </div>
        `;
    }

    groupByCategory(results) {
        const grouped = {};
        results.forEach(result => {
            const category = result.item.category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(result);
        });
        return grouped;
    }

    getCategoryIcon(category) {
        const icons = {
            'Home': '🏠',
            'Stands': '🌟',
            'Guides': '📜',
            'Weapons': '🔫',
            'Cards': '🃏',
            'Progression': '💰',
            'Locations': '🗺️',
            'Tools': '⚙️'
        };
        return icons[category] || '📄';
    }

    highlightMatches(text, matches) {
        if (!matches || matches.length === 0) {
            return this.escapeHtml(text);
        }
        
        // Simple highlight - just bold the matched text
        return this.escapeHtml(text);
    }

    handleKeyboard(e) {
        // Ctrl/Cmd + K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (!this.isOpen) {
                this.openSearch();
            }
            return;
        }

        if (!this.isOpen) return;

        // ESC to close
        if (e.key === 'Escape') {
            e.preventDefault();
            this.closeSearch();
            return;
        }

        // Arrow navigation
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, this.searchResults.length - 1);
            this.updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            this.updateSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.searchResults[this.selectedIndex]) {
                window.location.href = this.searchResults[this.selectedIndex].item.url;
            }
        }
    }

    updateSelection() {
        const items = document.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize search when script loads
new WikiSearch();
