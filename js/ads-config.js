/**
 * Advertising Configuration for Bridger Western Wiki
 * 
 * This file manages all advertising settings and placements.
 */

const AdConfig = {
    // Main advertising code (Native Banner)
    mainAd: {
        script: 'https://pl29131932.profitablecpmratenetwork.com/85cc155fa0b0e59e62294968d56227a5/invoke.js',
        containerId: 'container-85cc155fa0b0e59e62294968d56227a5'
    },

    // Social Bar (auto-positioned by Adsterra, no container needed)
    socialBar: {
        script: 'https://pl29165194.profitablecpmratenetwork.com/15/83/db/1583dbcab238dce3dbe6eb01c06e3f48.js',
        enabled: true
    },
    
    // Ad placements - positions where ads should appear
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
            enabled: true,
            containerId: 'ad-middle',
            priority: 'medium'
        },
        sidebar: {
            enabled: false,
            containerId: 'ad-sidebar',
            priority: 'medium'
        },
        footer: {
            enabled: true,
            containerId: 'ad-footer',
            priority: 'low'
        }
    },
    
    // Ad display settings
    settings: {
        // Delay ad loading for better performance
        loadDelay: 1000,
        // Respect "Do Not Track" headers
        respectDNT: true,
        // Show ads only after content is loaded
        loadAfterContent: true
    }
};

// Export for use in other scripts
window.AdConfig = AdConfig;