/**
 * Advertising Configuration for Bridger Western Wiki
 * 
 * This file manages all advertising settings and placements.
 */

const AdConfig = {
    // Main advertising code (Native Banner) — Adsterra DISABLED
    mainAd: {
        script: '',
        containerId: 'container-85cc155fa0b0e59e62294968d56227a5',
        enabled: false
    },

    // Social Bar — Adsterra DISABLED
    socialBar: {
        script: '',
        enabled: false
    },

    // Popunder — Adsterra DISABLED
    popunder: {
        script: '',
        enabled: false
    },

    // Google AdSense — temporarily disabled to diagnose traffic drop
    adsense: {
        script: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7293351660638119',
        enabled: false
    },
    
    // Ad placements
    placements: {
        main: {
            enabled: false,
            containerId: 'ad-container',
            priority: 'high'
        },
        header: {
            enabled: false,
            containerId: 'ad-header',
            priority: 'high'
        },
        middle: {
            enabled: false,
            containerId: 'ad-middle',
            priority: 'medium'
        },
        sidebar: {
            enabled: false,
            containerId: 'ad-sidebar',
            priority: 'medium'
        },
        footer: {
            enabled: false,
            containerId: 'ad-footer',
            priority: 'low'
        }
    },
    
    // Ad display settings
    settings: {
        loadDelay: 1000,
        respectDNT: true,
        loadAfterContent: true
    }
};

// Export for use in other scripts
window.AdConfig = AdConfig;
