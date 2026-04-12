#!/usr/bin/env node

/**
 * Enable Dynamic Ads for Existing Pages
 * 
 * This script adds dynamic advertising system support to all existing HTML pages.
 * Instead of inserting static ad code, it adds references to the dynamic ad system.
 */

const fs = require('fs');
const path = require('path');

class DynamicAdsEnabler {
    constructor() {
        this.basePath = process.cwd();
        
        // Script references to add
        this.requiredScripts = {
            adsConfig: '<script src="/js/ads-config.js"></script>',
            adsManager: '<script src="/js/ads-manager.js"></script>'
        };
        
        // Script loading order (in reverse order to insert correctly)
        this.scriptOrder = [
            'adsConfig',  // Config first
            'adsManager'  // Manager last (after other scripts)
        ];
        
        // Search for these scripts to know what's missing
        this.scriptPatterns = {
            adsConfig: /ads-config\.js/,
            adsManager: /ads-manager\.js/,
            searchJs: /search\.js/,  // Reference point for insertion
            componentsJs: /components\.js/  // Another reference point
        };
        
        this.stats = {
            totalPages: 0,
            pagesProcessed: 0,
            pagesSkipped: 0,
            pagesAlreadyHave: 0,
            errors: 0
        };
    }
    
    /**
     * Main function
     */
    async enableDynamicAds() {
        console.log('🚀 Starting to enable dynamic ads for existing pages...\n');
        
        try {
            // 1. Find all HTML files
            const htmlFiles = this.findHtmlFiles();
            this.stats.totalPages = htmlFiles.length;
            console.log(`📄 Found ${htmlFiles.length} HTML files`);
            
            // 2. Process each file
            for (const filePath of htmlFiles) {
                await this.processFile(filePath);
            }
            
            // 3. Show summary
            this.showSummary();
            
        } catch (error) {
            console.error('❌ Error enabling dynamic ads:', error);
            process.exit(1);
        }
    }
    
    /**
     * Find all HTML files
     */
    findHtmlFiles() {
        const htmlFiles = [];
        
        function walk(dir) {
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    // Skip certain directories
                    if (!file.startsWith('.') && 
                        file !== 'node_modules' && 
                        file !== 'scripts' &&
                        file !== 'templates' &&
                        file !== 'components') {
                        walk(filePath);
                    }
                } else if (file.endsWith('.html')) {
                    // Skip certain files
                    if (!file.includes('test-') && 
                        !file.includes('backup') &&
                        file !== 'test-components.html' &&
                        file !== 'yandex_96e3ecf3668e813b.html' &&
                        !file.includes('template')) {
                        htmlFiles.push(filePath);
                    }
                }
            }
        }
        
        walk(this.basePath);
        return htmlFiles.sort();
    }
    
    /**
     * Process a single HTML file
     */
    async processFile(filePath) {
        const relativePath = path.relative(this.basePath, filePath);
        
        console.log(`🔧 Processing: ${relativePath}`);
        
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Check if page already has dynamic ads
            const hasDynamicAds = this.hasDynamicAds(content);
            
            if (hasDynamicAds) {
                console.log(`   ⏭️  Skipping: Already has dynamic ads`);
                this.stats.pagesAlreadyHave++;
                return;
            }
            
            // Add dynamic ad system support
            content = this.addDynamicAdsSupport(content, relativePath);
            
            // Write back to file
            fs.writeFileSync(filePath, content);
            
            console.log(`   ✅ Enabled dynamic ads successfully`);
            this.stats.pagesProcessed++;
            
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            this.stats.errors++;
        }
    }
    
    /**
     * Check if page already has dynamic ads
     */
    hasDynamicAds(content) {
        // Check for both script references
        const hasAdsConfig = this.scriptPatterns.adsConfig.test(content);
        const hasAdsManager = this.scriptPatterns.adsManager.test(content);
        
        return hasAdsConfig && hasAdsManager;
    }
    
    /**
     * Add dynamic ads support to content
     */
    addDynamicAdsSupport(content, filePath) {
        let modifiedContent = content;
        
        // Strategy: Find where to insert the ads scripts
        // We want to insert them in the right order and location
        
        // 1. First, ensure ads-config.js is added (should be before search.js)
        modifiedContent = this.ensureScriptAdded(modifiedContent, 'adsConfig');
        
        // 2. Then ensure ads-manager.js is added (should be after other scripts)
        modifiedContent = this.ensureScriptAdded(modifiedContent, 'adsManager');
        
        return modifiedContent;
    }
    
    /**
     * Ensure a specific script is added to the content
     */
    ensureScriptAdded(content, scriptName) {
        const scriptTag = this.requiredScripts[scriptName];
        const pattern = this.scriptPatterns[scriptName];
        
        // If script already exists, return original content
        if (pattern.test(content)) {
            return content;
        }
        
        // Determine where to insert based on script type
        if (scriptName === 'adsConfig') {
            // Insert ads-config.js before other scripts (like search.js)
            return this.insertBeforeOtherScripts(content, scriptTag, ['search.js', 'components.js']);
        } else if (scriptName === 'adsManager') {
            // Insert ads-manager.js after other scripts (should be last)
            return this.insertAfterOtherScripts(content, scriptTag);
        }
        
        return content;
    }
    
    /**
     * Insert script tag before other reference scripts
     */
    insertBeforeOtherScripts(content, scriptTag, referenceScripts) {
        // Look for reference scripts
        for (const refScript of referenceScripts) {
            const refPattern = new RegExp(`<script[^>]*${refScript}[^>]*></script>`, 'i');
            const match = refPattern.exec(content);
            
            if (match) {
                // Insert before this script
                const position = match.index;
                const before = content.substring(0, position);
                const after = content.substring(position);
                
                // Add comment for clarity
                const scriptWithComment = `\n    <!-- Advertising configuration -->\n    ${scriptTag}\n    \n`;
                
                return before + scriptWithComment + after;
            }
        }
        
        // If no reference scripts found, insert before closing </body>
        return this.insertBeforeBodyEnd(content, scriptTag);
    }
    
    /**
     * Insert script tag after other scripts
     */
    insertAfterOtherScripts(content, scriptTag) {
        // Look for the last script tag before </body>
        const scriptPattern = /<script[^>]*><\/script>/gi;
        let lastScriptIndex = -1;
        let lastScriptMatch = null;
        
        // Find the last script tag before </body>
        const bodyEndIndex = content.lastIndexOf('</body>');
        if (bodyEndIndex === -1) return content;
        
        let match;
        while ((match = scriptPattern.exec(content)) !== null) {
            if (match.index < bodyEndIndex) {
                lastScriptIndex = match.index;
                lastScriptMatch = match;
            }
        }
        
        if (lastScriptMatch) {
            // Insert after the last script
            const position = lastScriptIndex + lastScriptMatch[0].length;
            const before = content.substring(0, position);
            const after = content.substring(position);
            
            // Add comment for clarity
            const scriptWithComment = `\n    \n    <!-- Ad manager (loads after other scripts) -->\n    ${scriptTag}`;
            
            return before + scriptWithComment + after;
        }
        
        // If no scripts found, insert before closing </body>
        return this.insertBeforeBodyEnd(content, scriptTag);
    }
    
    /**
     * Insert script tag before closing </body>
     */
    insertBeforeBodyEnd(content, scriptTag) {
        const bodyEndIndex = content.lastIndexOf('</body>');
        if (bodyEndIndex === -1) return content;
        
        const before = content.substring(0, bodyEndIndex);
        const after = content.substring(bodyEndIndex);
        
        // Add comment for clarity
        const scriptWithComment = `\n    \n    <!-- Dynamic Advertising -->\n    ${scriptTag}`;
        
        return before + scriptWithComment + after;
    }
    
    /**
     * Show summary of changes
     */
    showSummary() {
        console.log('\n📊 Summary:');
        console.log('='.repeat(60));
        console.log(`Total pages found: ${this.stats.totalPages}`);
        console.log(`Pages processed (added dynamic ads): ${this.stats.pagesProcessed}`);
        console.log(`Pages already had dynamic ads: ${this.stats.pagesAlreadyHave}`);
        console.log(`Pages skipped: ${this.stats.pagesSkipped}`);
        console.log(`Errors: ${this.stats.errors}`);
        console.log('='.repeat(60));
        
        if (this.stats.pagesProcessed > 0) {
            console.log('\n✅ Successfully enabled dynamic ads for existing pages!');
            console.log('\n🔧 What was added:');
            console.log('  1. Reference to /js/ads-config.js (advertising configuration)');
            console.log('  2. Reference to /js/ads-manager.js (dynamic ad loading)');
            console.log('\n🎯 Benefits of dynamic ads:');
            console.log('  • ✅ Centralized configuration (edit once in ads-config.js)');
            console.log('  • ✅ Flexible ad placements (header, middle, footer)');
            console.log('  • ✅ Easy to enable/disable ads (change enabled: true/false)');
            console.log('  • ✅ Clean HTML (no ad code in page files)');
            console.log('  • ✅ Better performance (ads load after content)');
            console.log('\n⚙️  Current ad placements (configured in ads-config.js):');
            console.log('  • Header ads: ✅ Enabled');
            console.log('  • Middle content ads: ✅ Enabled (recently added)');
            console.log('  • Footer ads: ✅ Enabled');
            console.log('  • Sidebar ads: ⚠️  Configured but disabled');
            console.log('\n💡 To modify ad settings, edit: /js/ads-config.js');
        } else if (this.stats.pagesAlreadyHave > 0) {
            console.log('\nℹ️  All pages already have dynamic ads enabled!');
            console.log('   You can modify ad settings in /js/ads-config.js');
        } else {
            console.log('\n⚠️  No pages were modified.');
        }
    }
}

// Run the script
const enabler = new DynamicAdsEnabler();

// Check for dry-run mode
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--dryrun');

if (isDryRun) {
    console.log('🔍 DRY RUN MODE: Showing what would be done without making changes\n');
    
    // Create a test version that doesn't write files
    const originalWriteFileSync = fs.writeFileSync;
    fs.writeFileSync = function(filePath, content) {
        console.log(`   📝 Would write to: ${path.relative(process.cwd(), filePath)}`);
        
        // Show what scripts would be added
        const relativePath = path.relative(process.cwd(), filePath);
        const currentContent = fs.readFileSync(filePath, 'utf8');
        
        // Check what's missing
        const missingScripts = [];
        if (!/ads-config\.js/.test(currentContent)) missingScripts.push('ads-config.js');
        if (!/ads-manager\.js/.test(currentContent)) missingScripts.push('ads-manager.js');
        
        if (missingScripts.length > 0) {
            console.log(`     Would add: ${missingScripts.join(', ')}`);
        } else {
            console.log(`     Already has dynamic ads`);
        }
        
        return;
    };
    
    enabler.enableDynamicAds().then(() => {
        fs.writeFileSync = originalWriteFileSync; // Restore
        console.log('\n💡 To actually make changes, run without --dry-run flag');
    });
} else {
    console.log('⚠️  WARNING: This will modify HTML files.');
    console.log('   It will add references to the dynamic ad system.');
    console.log('   Recommended: Run with --dry-run first to see what will be changed.\n');
    
    // Ask for confirmation (in real scenario, but here we'll proceed)
    enabler.enableDynamicAds();
}