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
        try {
            // Create search trigger in header
            const header = document.querySelector('header .container');
            const navToggle = document.querySelector('.nav-toggle');
            
            if (!header) {
                console.error('Header container not found!');
                return;
            }
            
            const searchTrigger = document.createElement('div');
            searchTrigger.className = 'search-trigger';
            searchTrigger.innerHTML = `
                <button class="search-trigger-btn" aria-label="Search wiki">
                    <span class="search-icon">🔍</span>
                    <span class="search-placeholder">Search wiki...</span>
                </button>
            `;
            
            // Insert before nav-toggle, or append if nav-toggle doesn't exist
            if (navToggle) {
                header.insertBefore(searchTrigger, navToggle);
            } else {
                console.warn('Nav toggle not found, appending search trigger to header');
                header.appendChild(searchTrigger);
            }

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
                                <kbd>Enter</kbd> Open in New Tab
                                <kbd>ESC</kbd> Close
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(searchModal);
            console.log('Search UI created successfully');
        } catch (error) {
            console.error('Failed to create search UI:', error);
        }
    }

    attachEventListeners() {
        try {
            // Search trigger button
            const triggerBtn = document.querySelector('.search-trigger-btn');
            if (!triggerBtn) {
                console.error('Search trigger button not found!');
                return;
            }
            triggerBtn.addEventListener('click', () => this.openSearch());

            // Search input
            const searchInput = document.querySelector('.search-input');
            if (!searchInput) {
                console.error('Search input not found!');
                return;
            }
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

            // Close buttons
            const closeBtn = document.querySelector('.search-close');
            const overlay = document.querySelector('.search-modal-overlay');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeSearch());
            }
            if (overlay) {
                overlay.addEventListener('click', () => this.closeSearch());
            }

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));

            // Result clicks
            document.addEventListener('click', (e) => {
                if (e.target.closest('.search-result-item')) {
                    const url = e.target.closest('.search-result-item').dataset.url;
                    const query = document.querySelector('.search-input').value;
                    if (url) {
                        const urlWithQuery = query ? `${url}?highlight=${encodeURIComponent(query)}` : url;
                        window.open(urlWithQuery, '_blank');
                    }
                }
            });
            
            console.log('Event listeners attached successfully');
        } catch (error) {
            console.error('Failed to attach event listeners:', error);
        }
    }

    async loadSearchIndex() {
        try {
            // Check if Fuse.js is loaded
            if (typeof Fuse === 'undefined') {
                console.error('Fuse.js is not loaded! Search will not work.');
                alert('Search library failed to load. Please refresh the page.');
                return;
            }
            
            const response = await fetch('/search-index.json');
            const data = await response.json();
            this.searchIndex = data.pages;
            
            // Debug logging
            console.log('Search index loaded:', this.searchIndex.length, 'pages');
            console.log('Sample entries:', this.searchIndex.slice(0, 3).map(p => p.title));
            
            // Find whitesnake specifically
            const whitesnakeEntry = this.searchIndex.find(p => p.title.toLowerCase().includes('whitesnake'));
            console.log('Whitesnake entry found:', whitesnakeEntry);
            
            // Initialize Fuse.js
            this.fuse = new Fuse(this.searchIndex, {
                keys: [
                    { name: 'title', weight: 0.4 },
                    { name: 'keywords', weight: 0.3 },
                    { name: 'description', weight: 0.2 },
                    { name: 'category', weight: 0.1 }
                ],
                threshold: 0.0,
                distance: 100,
                minMatchCharLength: 2,
                includeScore: true,
                includeMatches: true
            });
            
            console.log('Fuse.js initialized successfully');
            
            // Test search immediately
            const testResults = this.fuse.search('whitesnake');
            console.log('Test search for "whitesnake":', testResults.length, 'results');
            if (testResults.length > 0) {
                console.log('First result:', testResults[0]);
            }
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
        
        // Debug logging
        console.log('Search query:', query);
        console.log('Search results count:', results.length);
        console.log('First 3 results:', results.slice(0, 3));
        
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
                const url = this.searchResults[this.selectedIndex].item.url;
                const query = document.querySelector('.search-input').value;
                const urlWithQuery = query ? `${url}?highlight=${encodeURIComponent(query)}` : url;
                window.open(urlWithQuery, '_blank');
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

// Highlight search terms from URL parameter
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const highlight = urlParams.get('highlight');
    
    if (highlight) {
        // Wait for page to fully load
        window.addEventListener('load', () => {
            highlightSearchTerm(highlight);
        });
    }
    
    function highlightSearchTerm(term) {
        const searchTerm = term.toLowerCase();
        const mainContent = document.querySelector('section, main, .container');
        
        if (!mainContent) return;
        
        // Create a TreeWalker to find all text nodes
        const walker = document.createTreeWalker(
            mainContent,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script, style, and search modal elements
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    
                    const tagName = parent.tagName.toLowerCase();
                    if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    if (parent.closest('.search-modal')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    
                    // Only accept nodes with text content
                    if (node.textContent.toLowerCase().includes(searchTerm)) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    
                    return NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        const nodesToHighlight = [];
        let node;
        
        while (node = walker.nextNode()) {
            nodesToHighlight.push(node);
        }
        
        let firstHighlight = null;
        
        // Highlight all matching text nodes
        nodesToHighlight.forEach(textNode => {
            const text = textNode.textContent;
            const lowerText = text.toLowerCase();
            const index = lowerText.indexOf(searchTerm);
            
            if (index !== -1) {
                const parent = textNode.parentElement;
                const before = text.substring(0, index);
                const match = text.substring(index, index + searchTerm.length);
                const after = text.substring(index + searchTerm.length);
                
                const highlightSpan = document.createElement('mark');
                highlightSpan.className = 'search-highlight';
                highlightSpan.textContent = match;
                highlightSpan.style.cssText = 'background: #ffd700; color: #2b1c11; padding: 2px 4px; border-radius: 3px; font-weight: bold;';
                
                const fragment = document.createDocumentFragment();
                if (before) fragment.appendChild(document.createTextNode(before));
                fragment.appendChild(highlightSpan);
                if (after) fragment.appendChild(document.createTextNode(after));
                
                parent.replaceChild(fragment, textNode);
                
                // Store first highlight for scrolling
                if (!firstHighlight) {
                    firstHighlight = highlightSpan;
                }
            }
        });
        
        // Scroll to first highlight with smooth animation
        if (firstHighlight) {
            setTimeout(() => {
                firstHighlight.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add a pulse animation to draw attention
                firstHighlight.style.animation = 'highlightPulse 1s ease-in-out 2';
            }, 300);
        }
    }
    
    // Add CSS animation for highlight pulse
    const style = document.createElement('style');
    style.textContent = `
        @keyframes highlightPulse {
            0%, 100% { 
                background: #ffd700; 
                transform: scale(1);
            }
            50% { 
                background: #ffed4e; 
                transform: scale(1.05);
            }
        }
    `;
    document.head.appendChild(style);
})();
