#!/usr/bin/env node

/**
 * Page Creator for Bridger Western Wiki
 * 
 * This script creates new pages using the template and automatically
 * updates all related files (llms.txt, llms-full.txt, robots.txt, sitemap.xml)
 * 
 * Usage: node scripts/create-page.js [options]
 * 
 * Options:
 *   --title "Page Title"      Page title (required)
 *   --category "category"     Category (stands, weapons, cards, etc.)
 *   --slug "url-slug"         URL slug (auto-generated from title if not provided)
 *   --desc "Description"      Meta description
 *   --template "template"     Template to use (default: page-template.html)
 */

const fs = require('fs');
const path = require('path');

class PageCreator {
    constructor() {
        this.basePath = process.cwd();
        this.templatesPath = path.join(this.basePath, 'templates');
        this.siteUrl = 'https://bridgerwestern.cc';
    }
    
    /**
     * Parse command line arguments
     */
    parseArguments() {
        // Simple argument parsing without external dependencies
        const args = process.argv.slice(2);
        const options = {
            title: '',
            category: 'other',
            slug: '',
            desc: '',
            template: 'page-template.html',
            dryRun: false
        };
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            if (arg === '--title' || arg === '-t') {
                options.title = args[++i] || '';
            } else if (arg === '--category' || arg === '-c') {
                options.category = args[++i] || 'other';
            } else if (arg === '--slug' || arg === '-s') {
                options.slug = args[++i] || '';
            } else if (arg === '--desc' || arg === '-d') {
                options.desc = args[++i] || '';
            } else if (arg === '--template') {
                options.template = args[++i] || 'page-template.html';
            } else if (arg === '--dry-run') {
                options.dryRun = true;
            } else if (arg.startsWith('--help') || arg === '-h') {
                this.showHelp();
                process.exit(0);
            }
        }
        
        // Validate required arguments
        if (!options.title) {
            console.error('❌ Error: Title is required');
            console.error('   Usage: node scripts/create-page.js --title "Page Title" [options]');
            console.error('   Use --help for more information');
            process.exit(1);
        }
        
        return options;
    }
    
    /**
     * Show help message
     */
    showHelp() {
        console.log('🛠️  Page Creator for Bridger Western Wiki');
        console.log('');
        console.log('Usage: node scripts/create-page.js [options]');
        console.log('');
        console.log('Options:');
        console.log('  -t, --title <title>      Page title (required)');
        console.log('  -c, --category <category> Category (stands, weapons, cards, items, guides, fishing, locations, other)');
        console.log('  -s, --slug <slug>        URL slug (auto-generated from title)');
        console.log('  -d, --desc <description> Meta description');
        console.log('  --template <template>    Template file to use');
        console.log('  --dry-run                Show preview without creating');
        console.log('  -h, --help               Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/create-page.js --title "Advanced Fishing" --category fishing');
        console.log('  node scripts/create-page.js -t "New Weapon Guide" -c weapons --dry-run');
    }
    
    /**
     * Main function
     */
    async createPage() {
        const options = this.parseArguments();
        
        console.log('🛠️  Creating new page...\n');
        console.log('Options:', options);
        
        // Generate slug from title if not provided
        const slug = options.slug || this.generateSlug(options.title);
        
        // Generate description if not provided
        const description = options.desc || `Complete guide about ${options.title} in Bridger Western Roblox game. Covers mechanics, strategies, and tips.`;
        
        // Create page data
        const pageData = {
            title: options.title,
            category: options.category.toLowerCase(),
            slug: slug,
            description: description,
            url: this.generateUrl(options.category, slug),
            path: this.generatePath(options.category, slug)
        };
        
        console.log('\n📋 Page Details:');
        console.log(`  Title: ${pageData.title}`);
        console.log(`  Category: ${pageData.category}`);
        console.log(`  Slug: ${pageData.slug}`);
        console.log(`  URL: ${pageData.url}`);
        console.log(`  Path: ${pageData.path}`);
        
        if (options.dryRun) {
            console.log('\n✅ Dry run complete - no files were created');
            return;
        }
        
        try {
            // 1. Create directory if needed
            this.createDirectory(pageData.path);
            
            // 2. Create HTML file from template
            this.createHtmlFile(pageData);
            
            // 3. Run content indexer to update all files
            this.runContentIndexer();
            
            console.log('\n✅ Page created successfully!');
            console.log(`📄 File: ${pageData.path}/index.html`);
            console.log(`🌐 URL: ${pageData.url}`);
            console.log('\n📝 Updated files:');
            console.log('  - llms.txt');
            console.log('  - llms-full.txt');
            console.log('  - robots.txt');
            console.log('  - sitemap.xml');
            console.log('  - CONTENT_ROADMAP.md');
            
        } catch (error) {
            console.error('\n❌ Error creating page:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * Generate slug from title
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')         // Replace spaces with hyphens
            .replace(/-+/g, '-')          // Replace multiple hyphens with single
            .trim();
    }
    
    /**
     * Generate URL
     */
    generateUrl(category, slug) {
        const categoryPath = category === 'other' ? '' : `${category}/`;
        return `${this.siteUrl}/${categoryPath}${slug}/`;
    }
    
    /**
     * Generate file path
     */
    generatePath(category, slug) {
        const categoryDir = category === 'other' ? '' : `${category}/`;
        return path.join(this.basePath, categoryDir, slug);
    }
    
    /**
     * Create directory for the new page
     */
    createDirectory(pagePath) {
        const dirPath = path.dirname(pagePath + '/index.html');
        
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dirPath}`);
        }
    }
    
    /**
     * Create HTML file from template
     */
    createHtmlFile(pageData) {
        const templatePath = path.join(this.templatesPath, 'page-template.html');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found: ${templatePath}`);
        }
        
        let template = fs.readFileSync(templatePath, 'utf8');
        
        // Replace template variables
        const replacements = {
            'Page Title - Bridger Western Wiki & Trello': `${pageData.title} - Bridger Western Wiki & Trello`,
            'Page title': pageData.title,
            'Page description...': pageData.description,
            'page-url': `${pageData.category}/${pageData.slug}`,
            'Your content goes here...': this.generateDefaultContent(pageData),
            'Page Title': pageData.title
        };
        
        // Apply replacements
        Object.entries(replacements).forEach(([search, replace]) => {
            template = template.replace(new RegExp(search, 'g'), replace);
        });
        
        // Write the file
        const outputPath = path.join(pageData.path, 'index.html');
        fs.writeFileSync(outputPath, template);
        console.log(`📄 Created HTML file: ${outputPath}`);
    }
    
    /**
     * Generate default content for new pages
     */
    generateDefaultContent(pageData) {
        let content = `<h2>About ${pageData.title}</h2>\n`;
        content += `<p>${pageData.description}</p>\n\n`;
        
        content += `<h2>Key Features</h2>\n`;
        content += `<ul>\n`;
        content += `  <li>Complete guide for ${pageData.title}</li>\n`;
        content += `  <li>Step-by-step instructions</li>\n`;
        content += `  <li>Verified gameplay data</li>\n`;
        content += `  <li>Updated for ${new Date().getFullYear()} Alpha</li>\n`;
        content += `</ul>\n\n`;
        
        content += `<h2>Getting Started</h2>\n`;
        content += `<p>This guide covers everything you need to know about ${pageData.title} in Bridger Western. Check the sections below for detailed information.</p>\n`;
        
        content += `<div class="sketch-card">\n`;
        content += `  <h3>📝 Note to Contributors</h3>\n`;
        content += `  <p>This page was automatically generated. Please update with actual content, gameplay data, and community insights.</p>\n`;
        content += `</div>`;
        
        return content;
    }
    
    /**
     * Run content indexer to update all files
     */
    runContentIndexer() {
        const indexerPath = path.join(this.basePath, 'scripts', 'content-indexer.js');
        
        if (!fs.existsSync(indexerPath)) {
            console.warn('⚠️  Content indexer not found, skipping automatic updates');
            return;
        }
        
        console.log('\n🔍 Running content indexer...');
        
        try {
            // Use child process to run the indexer
            const { execSync } = require('child_process');
            execSync(`node ${indexerPath}`, { stdio: 'inherit' });
        } catch (error) {
            console.warn('⚠️  Content indexer encountered an error:', error.message);
            console.warn('   You may need to run it manually: node scripts/content-indexer.js');
        }
    }
}

// Create and run the page creator
const creator = new PageCreator();
creator.createPage();