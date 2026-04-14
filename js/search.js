/**
 * Bridger Western Wiki - Search Functionality
 * Pure frontend fuzzy search with Fuse.js (lazy loaded)
 */

class WikiSearch {
    constructor() {
        this.searchIndex = null;
        this.fuse = null;
        this.isOpen = false;
        this.selectedIndex = 0;
        this.searchResults = [];
        this.fuseLoaded = false;
        this.indexLoaded = false;
        
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
        // Don't load search index immediately - wait for user interaction
    }

    async loadFuseJS() {
        if (this.fuseLoaded) return;
        
        return new Promise((resolve, reject) => {
            if (typeof Fuse !== 'undefined') {
                this.fuseLoaded = true;
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
            script.onload = () => {
                this.fuseLoaded = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadSearchIndex() {
        if (this.indexLoaded) return;
        
        try {
            // Load Fuse.js first
            await this.loadFuseJS();
            
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
                threshold: 0.0,
                distance: 100,
                minMatchCharLength: 2,
                includeScore: true,
                includeMatches: true
            });
            
            this.indexLoaded = true;
        } catch (error) {
            console.error('Failed to load search:', error);
        }
    }

    createSearchUI() {
        try {
            // Create search trigger in header (for desktop)
            const header = document.querySelector('header .container');
            const navToggle = document.querySelector('.nav-toggle');
            
            if (header) {
                const searchTrigger = document.createElement('div');
                searchTrigger.className = 'search-trigger';
                searchTrigger.innerHTML = `
                    <button class="search-trigger-btn" aria-label="Search wiki">
                        <span class="search-icon">🔍</span>
                        <span class="search-placeholder">Search wiki...</span>
                    </button>
                `;
                
                if (navToggle) {
                    header.insertBefore(searchTrigger, navToggle);
                } else {
                    header.appendChild(searchTrigger);
                }
            }
            
            // Create floating search button (FAB)
            const searchFAB = document.createElement('button');
            searchFAB.className = 'search-fab';
            searchFAB.setAttribute('aria-label', 'Search wiki');
            searchFAB.innerHTML = `
                <span class="search-fab-icon">🔍</span>
            `;
            
            document.body.appendChild(searchFAB);

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
        } catch (error) {
            console.error('Failed to create search UI:', error);
        }
    }

    attachEventListeners() {
        try {
            // Header search trigger button (desktop)
            const triggerBtn = document.querySelector('.search-trigger-btn');
            if (triggerBtn) {
                triggerBtn.addEventListener('click', () => this.openSearch());
            }
            
            // Search FAB button
            const searchFAB = document.querySelector('.search-fab');
            if (searchFAB) {
                searchFAB.addEventListener('click', () => this.openSearch());
            }

            // Search input
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            }

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
                        let urlWithQuery = url;
                        if (query) {
                            // Split URL by hash to insert query parameter before anchor
                            const [basePath, hash] = url.split('#');
                            urlWithQuery = hash 
                                ? `${basePath}?highlight=${encodeURIComponent(query)}#${hash}`
                                : `${basePath}?highlight=${encodeURIComponent(query)}`;
                        }
                        window.open(urlWithQuery, '_blank');
                    }
                }
            });
        } catch (error) {
            console.error('Failed to attach event listeners:', error);
        }
    }

    async openSearch() {
        // Lazy load search functionality on first open
        if (!this.indexLoaded) {
            await this.loadSearchIndex();
        }
        
        const modal = document.querySelector('.search-modal');
        const input = document.querySelector('.search-input');
        
        modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
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
        this.searchResults = results.slice(0, 20);
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
                let urlWithQuery = url;
                if (query) {
                    // Split URL by hash to insert query parameter before anchor
                    const [basePath, hash] = url.split('#');
                    urlWithQuery = hash 
                        ? `${basePath}?highlight=${encodeURIComponent(query)}#${hash}`
                        : `${basePath}?highlight=${encodeURIComponent(query)}`;
                }
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
window.wikiSearch = new WikiSearch();

// Highlight search terms from URL parameter
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const highlight = urlParams.get('highlight');
    
    if (highlight) {
        const tryHighlight = () => highlightSearchTerm(highlight);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryHighlight);
        }
        
        window.addEventListener('load', tryHighlight);
        
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            setTimeout(tryHighlight, 100);
        }
    }
    
    function highlightSearchTerm(term) {
        const searchTerm = term.toLowerCase();
        // Use body instead of first section to search entire page
        const mainContent = document.body;
        
        if (!mainContent) return;
        
        // Get all text nodes
        const allTextNodes = [];
        const treeWalker = document.createTreeWalker(
            mainContent,
            NodeFilter.SHOW_TEXT,
            null
        );
        
        let currentNode;
        while (currentNode = treeWalker.nextNode()) {
            allTextNodes.push(currentNode);
        }
        
        // Filter nodes - exclude header, nav, footer, scripts
        const nodesToHighlight = allTextNodes.filter(node => {
            const parent = node.parentElement;
            if (!parent) return false;
            
            const tagName = parent.tagName.toLowerCase();
            if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                return false;
            }
            
            // Exclude header, nav, footer, breadcrumb
            if (parent.closest('header, nav, footer, .breadcrumb, .search-modal, .search-fab')) {
                return false;
            }
            
            return node.textContent.toLowerCase().includes(searchTerm);
        });
        
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
                
                const fragment = document.createDocumentFragment();
                if (before) fragment.appendChild(document.createTextNode(before));
                fragment.appendChild(highlightSpan);
                if (after) fragment.appendChild(document.createTextNode(after));
                
                parent.replaceChild(fragment, textNode);
                
                if (!firstHighlight) {
                    firstHighlight = highlightSpan;
                }
            }
        });
        
        // Create navigation UI (if there are multiple highlights)
        if (nodesToHighlight.length > 1) {
            HighlightNavigation.init(term);
        } else if (firstHighlight) {
            // Single highlight: just scroll to it
            setTimeout(() => {
                try {
                    firstHighlight.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    firstHighlight.classList.add('active');
                    
                    // Remove active class after animation
                    setTimeout(() => {
                        firstHighlight.classList.remove('active');
                    }, 1500);
                } catch (error) {
                    try {
                        firstHighlight.scrollIntoView({ block: 'center' });
                    } catch (e) {
                        // Silently fail
                    }
                }
            }, 800);
        }
    }
    
})();

// Highlight navigation controller
const HighlightNavigation = {
    highlights: [],
    currentIndex: 0,
    searchTerm: '',
    navigationPanel: null,
    toggleButton: null,
    isVisible: false,
    
    init(searchTerm) {
        this.searchTerm = searchTerm;
        this.highlights = Array.from(document.querySelectorAll('.search-highlight'));
        
        // If there's only one highlight, no navigation needed
        if (this.highlights.length <= 1) return;
        
        this.createUI();
        this.setupKeyboardNavigation();
    },
    
    createUI() {
        // Remove existing navigation if any
        this.removeUI();
        
        // Create navigation panel
        this.navigationPanel = document.createElement('div');
        this.navigationPanel.className = 'search-highlight-navigation active';
        this.navigationPanel.innerHTML = `
            <div class="highlight-nav-header">
                <h3>Search Navigation</h3>
                <button class="close-highlight-nav" aria-label="Close navigation">✕</button>
            </div>
            <div class="highlight-stats">
                <strong>${this.highlights.length}</strong> matches found for "<strong>${this.searchTerm}</strong>"
            </div>
            <div class="highlight-nav-controls">
                <button class="highlight-nav-btn prev-highlight" ${this.currentIndex === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <button class="highlight-nav-btn next-highlight" ${this.currentIndex === this.highlights.length - 1 ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        `;
        
        document.body.appendChild(this.navigationPanel);
        
        // Create toggle button
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'highlight-toggle-btn';
        this.toggleButton.setAttribute('aria-label', 'Show highlight navigation');
        this.toggleButton.innerHTML = '🔍';
        document.body.appendChild(this.toggleButton);
        
        this.setupEventListeners();
        this.selectHighlight(0);
    },
    
    removeUI() {
        if (this.navigationPanel?.parentNode) {
            this.navigationPanel.parentNode.removeChild(this.navigationPanel);
            this.navigationPanel = null;
        }
        if (this.toggleButton?.parentNode) {
            this.toggleButton.parentNode.removeChild(this.toggleButton);
            this.toggleButton = null;
        }
    },
    
    setupEventListeners() {
        // Close button
        this.navigationPanel.querySelector('.close-highlight-nav').addEventListener('click', () => {
            this.hide();
        });
        
        // Navigation buttons
        this.navigationPanel.querySelector('.prev-highlight').addEventListener('click', () => {
            this.prev();
        });
        
        this.navigationPanel.querySelector('.next-highlight').addEventListener('click', () => {
            this.next();
        });
        

        
        // Toggle button
        this.toggleButton.addEventListener('click', () => {
            this.toggle();
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    },
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                e.preventDefault();
                this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                this.prev();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.selectHighlight(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.selectHighlight(this.highlights.length - 1);
            }
        });
    },
    
    prev() {
        if (this.currentIndex > 0) {
            this.selectHighlight(this.currentIndex - 1);
        }
    },
    
    next() {
        if (this.currentIndex < this.highlights.length - 1) {
            this.selectHighlight(this.currentIndex + 1);
        }
    },
    
    selectHighlight(index) {
        // If selecting the same index, do nothing
        if (index === this.currentIndex) {
            return;
        }
        
        // Remove only the previous highlight active state
        if (this.highlights[this.currentIndex]) {
            this.highlights[this.currentIndex].classList.remove('active');
        }
        
        // Update current index
        this.currentIndex = index;
        
        // Activate current highlight
        const highlight = this.highlights[index];
        highlight.classList.add('active');
        
        // Scroll to view
        highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Update button states
        this.updateButtonStates();
    },
    
    updateButtonStates() {
        const prevBtn = this.navigationPanel?.querySelector('.prev-highlight');
        const nextBtn = this.navigationPanel?.querySelector('.next-highlight');
        
        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentIndex === this.highlights.length - 1;
    },
    
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    },
    
    show() {
        if (this.navigationPanel) {
            this.navigationPanel.classList.add('active');
            this.isVisible = true;
            this.toggleButton.innerHTML = '✕';
        }
    },
    
    hide() {
        if (this.navigationPanel) {
            this.navigationPanel.classList.remove('active');
            this.isVisible = false;
            this.toggleButton.innerHTML = '🔍';
        }
    }
};