/**
 * Ad Manager for Bridger Western Wiki
 * Handles loading and displaying advertisements
 */

class AdManager {
    constructor() {
        this.config = window.AdConfig || {};
        this.adsLoaded = false;
    }
    
    /**
     * Initialize ad manager
     */
    init() {
        // Check if ads should be loaded
        if (this.shouldLoadAds()) {
            this.loadAds();
        }
    }
    
    /**
     * Check if ads should be loaded
     * @returns {boolean} Whether to load ads
     */
    shouldLoadAds() {
        // Respect Do Not Track
        if (this.config.settings?.respectDNT && navigator.doNotTrack === '1') {
            console.log('Ads not loaded: Do Not Track enabled');
            return false;
        }
        
        // Check if any placement is enabled
        const placements = this.config.placements || {};
        const hasEnabledPlacement = Object.values(placements).some(p => p.enabled);
        
        return hasEnabledPlacement;
    }
    
    /**
     * Load all ads based on configuration
     */
    loadAds() {
        if (this.adsLoaded) return;
        
        // Delay loading for performance
        setTimeout(() => {
            this.loadAdScript();
            this.createAdContainers();
            this.adsLoaded = true;
        }, this.config.settings?.loadDelay || 0);
    }
    
    /**
     * Load the main ad script
     */
    loadAdScript() {
        if (!this.config.mainAd?.script) return;
        
        const script = document.createElement('script');
        script.async = true;
        script.dataset.cfasync = 'false';
        script.src = this.config.mainAd.script;
        document.head.appendChild(script);

        // Load Social Bar if enabled (self-positioning, no container needed)
        if (this.config.socialBar?.enabled && this.config.socialBar?.script) {
            const sbScript = document.createElement('script');
            sbScript.async = true;
            sbScript.src = this.config.socialBar.script;
            document.head.appendChild(sbScript);
        }
    }
    
    /**
     * Create ad containers for enabled placements
     */
    createAdContainers() {
        const placements = this.config.placements || {};
        
        Object.entries(placements).forEach(([position, placement]) => {
            if (placement.enabled && placement.containerId) {
                this.createAdContainer(position, placement.containerId);
            }
        });
    }
    
    /**
     * Create a single ad container
     * @param {string} position - Ad position (header, footer, etc.)
     * @param {string} containerId - Container element ID
     */
    createAdContainer(position, containerId) {
        // Check if container already exists
        if (document.getElementById(containerId)) return;
        
        const container = document.createElement('div');
        container.id = containerId;
        container.className = `ad-container ad-${position}`;
        
        // Add the ad display container
        const adDisplay = document.createElement('div');
        adDisplay.id = this.config.mainAd?.containerId || 'ad-display';
        
        container.appendChild(adDisplay);
        
        // Insert at appropriate location
        this.insertAdContainer(container, position);
    }
    
    /**
     * Insert ad container at the right location
     * @param {HTMLElement} container - Ad container element
     * @param {string} position - Ad position
     */
    insertAdContainer(container, position) {
        let targetElement;
        let insertMethod = 'beforebegin'; // default
        
        switch(position) {
            case 'main':
                // Use existing ad-container if it exists
                const existingContainer = document.getElementById('ad-container');
                if (existingContainer) {
                    // Add the ad display div to existing container
                    const adDisplay = document.createElement('div');
                    adDisplay.id = this.config.mainAd?.containerId || 'ad-display';
                    existingContainer.appendChild(adDisplay);
                    return; // Don't insert, just use existing
                }
                // Fallback to header behavior
                targetElement = document.querySelector('main');
                if (targetElement) {
                    insertMethod = 'beforebegin';
                }
                break;
                
            case 'header':
                targetElement = document.querySelector('main');
                if (targetElement) {
                    insertMethod = 'beforebegin';
                }
                break;
                
            case 'middle':
                // Intelligent middle content ad placement
                // Strategy: Find the best place to insert in content
                targetElement = this.findMiddleContentTarget();
                if (targetElement) {
                    insertMethod = 'afterend'; // Insert after the target element
                }
                break;
                
            case 'footer':
                targetElement = document.querySelector('footer') || document.querySelector('#footer-container');
                if (targetElement) {
                    insertMethod = 'beforebegin';
                }
                break;
                
            case 'sidebar':
                // For sidebar ads (future use)
                targetElement = document.querySelector('.sidebar') || document.querySelector('main .container');
                if (targetElement) {
                    insertMethod = 'afterbegin';
                }
                break;
        }
        
        if (targetElement) {
            targetElement.insertAdjacentElement(insertMethod, container);
        } else {
            // Fallback: append to body
            document.body.appendChild(container);
        }
    }
    
    /**
     * Refresh ads (if needed)
     */
    refresh() {
        // Implementation for ad refresh
        console.log('Ad refresh functionality not yet implemented');
    }
    
    /**
     * Find the best target element for middle content ads
     * @returns {HTMLElement|null} The best target element for insertion
     */
    findMiddleContentTarget() {
        // Strategy 1: Find article element with substantial content
        const article = document.querySelector('article');
        if (article) {
            // Find the first H2 or significant section
            const firstH2 = article.querySelector('h2');
            if (firstH2) {
                return firstH2;
            }
            
            // Or find a paragraph after the first heading
            const firstH1 = article.querySelector('h1');
            if (firstH1) {
                const nextElement = firstH1.nextElementSibling;
                if (nextElement && (nextElement.tagName === 'P' || nextElement.tagName === 'DIV')) {
                    return nextElement;
                }
                return firstH1;
            }
            
            // Fallback: the article itself
            return article;
        }
        
        // Strategy 2: Find main content area with sketch cards
        const sketchCards = document.querySelectorAll('.sketch-card');
        if (sketchCards.length >= 2) {
            // Insert after the second sketch card for balanced placement
            return sketchCards[1];
        } else if (sketchCards.length === 1) {
            // Insert after the only sketch card
            return sketchCards[0];
        }
        
        // Strategy 3: Find main container with content
        const mainContent = document.querySelector('main .container, .container main');
        if (mainContent) {
            // Find the first significant content element
            const contentElements = mainContent.querySelectorAll('h1, h2, .sketch-card, .grid-3, section');
            if (contentElements.length > 0) {
                return contentElements[0];
            }
            return mainContent;
        }
        
        // Strategy 4: Last resort - find main tag
        const mainTag = document.querySelector('main');
        if (mainTag) {
            return mainTag;
        }
        
        return null;
    }
    
    /**
     * Remove all ads
     */
    removeAll() {
        const adContainers = document.querySelectorAll('[class*="ad-"]');
        adContainers.forEach(container => container.remove());
        
        const adScripts = document.querySelectorAll('script[src*="profitablecpmratenetwork"]');
        adScripts.forEach(script => script.remove());
        
        this.adsLoaded = false;
    }
}

// Initialize ad manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adManager = new AdManager();
    window.adManager.init();
});