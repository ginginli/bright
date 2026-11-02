/**
 * Advertising Configuration for Bridger Western Wiki
 *
 * Only Google AdSense (Auto Ads) is enabled.
 */

const AdConfig = {
    // Google AdSense
    adsense: {
        script: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7293351660638119',
        enabled: true
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
