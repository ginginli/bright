#!/usr/bin/env node

/**
 * Pre-commit Hook for Bridger Western Wiki
 * 
 * Checks if new HTML files have been added and reminds to run content indexer
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PreCommitHook {
    constructor() {
        this.basePath = process.cwd();
    }
    
    /**
     * Main function
     */
    run() {
        console.log('🔍 Checking for new pages...');
        
        try {
            // Get list of HTML files that are staged for commit
            const stagedFiles = this.getStagedFiles();
            const newHtmlFiles = this.filterNewHtmlFiles(stagedFiles);
            
            if (newHtmlFiles.length > 0) {
                this.showReminder(newHtmlFiles);
            }
            
        } catch (error) {
            console.warn('⚠️  Could not check for new pages:', error.message);
        }
    }
    
    /**
     * Get staged files from git
     */
    getStagedFiles() {
        try {
            const output = execSync('git diff --cached --name-only --diff-filter=A', { encoding: 'utf8' });
            return output.split('\n').filter(Boolean);
        } catch (error) {
            return [];
        }
    }
    
    /**
     * Filter new HTML files
     */
    filterNewHtmlFiles(files) {
        return files.filter(file => {
            return file.endsWith('.html') && 
                   !file.includes('test-') && 
                   !file.includes('backup') &&
                   !file.includes('templates/');
        });
    }
    
    /**
     * Show reminder if new HTML files found
     */
    showReminder(newHtmlFiles) {
        console.log('\n⚠️  REMINDER: New HTML files detected!\n');
        console.log('The following new pages have been added:');
        newHtmlFiles.forEach(file => console.log(`  - ${file}`));
        
        console.log('\n📝 Please ensure content is synchronized by:');
        console.log('\n   1. Running the content indexer:');
        console.log('      node scripts/content-indexer.js\n');
        
        console.log('   2. Or using the page creator for new pages:');
        console.log('      node scripts/create-page.js --title "Page Title" --category "category"\n');
        
        console.log('This will update:');
        console.log('  - llms.txt           (AI training data)');
        console.log('  - llms-full.txt      (detailed content index)');
        console.log('  - robots.txt         (search engine access)');
        console.log('  - sitemap.xml        (sitemap for SEO)');
        console.log('  - CONTENT_ROADMAP.md (content planning)\n');
        
        console.log('💡 You can continue with the commit, but remember to sync content later.');
        console.log('   To skip this check in the future, remove or disable this hook.\n');
    }
}

// Run the hook
const hook = new PreCommitHook();
hook.run();