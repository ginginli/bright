/**
 * Advertising Configuration for Bridger Western Wiki
 * 
 * This file manages all advertising settings and placements.
 */

const AdConfig = {
    // Main advertising code
    mainAd: {
        script: 'https://pl29131932.profitablecpmratenetwork.com/85cc155fa0b0e59e62294968d56227a5/invoke.js',
        containerId: 'container-85cc155fa0b0e59e62294968d56227a5'
    },
    
    // Alternative ads (future use)
    altAds: {
        // Example: {
        //     script: 'https://example.com/ad.js',
        //     containerId: 'ad-container-alt'
        // }
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