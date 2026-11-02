/**
 * Ad Manager for Bridger Western Wiki
 * Loads Google AdSense (Auto Ads) only.
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

        return !!(this.config.adsense?.enabled && this.config.adsense?.script);
    }

    /**
     * Load ads after a short delay for performance
     */
    loadAds() {
        if (this.adsLoaded) return;

        setTimeout(() => {
            this.loadAdSense();
            this.adsLoaded = true;
        }, this.config.settings?.loadDelay || 0);
    }

    /**
     * Load the Google AdSense script
     */
    loadAdSense() {
        const adsense = this.config.adsense || {};
        if (!adsense.enabled || !adsense.script) return;

        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = adsense.script;
        document.head.appendChild(script);
    }
}

// Initialize ad manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adManager = new AdManager();
    window.adManager.init();
});
