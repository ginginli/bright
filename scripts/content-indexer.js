#!/usr/bin/env node

/**
 * Content Indexer for Bridger Western Wiki
 * 
 * This script automatically indexes all HTML pages and updates:
 * - llms.txt (simplified content summary for AI)
 * - llms-full.txt (detailed content index)
 * - robots.txt (adds new pages to allow list)
 * - sitemap.xml (updates sitemap with new pages)
 * 
 * Usage: node scripts/content-indexer.js
 */

const fs = require('fs');
const path = require('path');

class ContentIndexer {
    constructor() {
        this.basePath = process.cwd();
        this.siteUrl = 'https://bridgerwestern.cc';
        this.currentDate = new Date().toISOString().split('T')[0];
    }
    
    /**
     * Main indexing function
     */
    async indexAllContent() {
        console.log('🔍 Starting content indexing...');
        
        try {
            // 1. Find all HTML files
            const htmlFiles = this.findHtmlFiles();
            console.log(`📄 Found ${htmlFiles.length} HTML files`);
            
            // 2. Generate content data for each page
            const pagesData = await this.generatePagesData(htmlFiles);
            
            // 3. Update llms.txt (simplified summary)
            this.updateLlmsTxt(pagesData);
            
            // 4. Update llms-full.txt (detailed index)
            this.updateLlmsFullTxt(pagesData);
            
            // 5. Update robots.txt (add new pages to allow list)
            this.updateRobotsTxt(pagesData);
            
            // 6. Update sitemap.xml
            this.updateSitemap(pagesData);
            
            // 7. Generate content roadmap (if requested)
            this.generateRoadmap(pagesData);
            
            console.log('✅ Content indexing completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during content indexing:', error);
            process.exit(1);
        }
    }
    
    /**
     * Find all HTML files in the project
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
                    if (!file.startsWith('.') && file !== 'node_modules' && file !== 'scripts') {
                        walk(filePath);
                    }
                } else if (file.endsWith('.html')) {
                    // Skip certain files
                    if (!file.includes('test-') && !file.includes('backup')) {
                        htmlFiles.push(filePath);
                    }
                }
            }
        }
        
        walk(this.basePath);
        return htmlFiles.sort();
    }
    
    /**
     * Generate page data from HTML files
     */
    async generatePagesData(htmlFiles) {
        const pagesData = [];
        
        for (const filePath of htmlFiles) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const relativePath = path.relative(this.basePath, filePath);
                const urlPath = this.getUrlPath(relativePath);
                
                // Extract metadata from HTML
                const metadata = this.extractMetadata(content, urlPath);
                
                pagesData.push({
                    filePath: relativePath,
                    url: `${this.siteUrl}${urlPath}`,
                    title: metadata.title,
                    description: metadata.description,
                    lastModified: this.getFileModTime(filePath),
                    content: this.extractContentSummary(content),
                    category: this.getCategory(relativePath)
                });
                
            } catch (error) {
                console.warn(`⚠️  Could not process ${filePath}:`, error.message);
            }
        }
        
        return pagesData.sort((a, b) => a.category.localeCompare(b.category));
    }
    
    /**
     * Get URL path from file path
     */
    getUrlPath(filePath) {
        // Convert file path to URL path
        let urlPath = filePath.replace(/\\/g, '/');
        
        // Handle index.html
        if (urlPath.endsWith('/index.html')) {
            urlPath = urlPath.replace('/index.html', '/');
        } else if (urlPath.endsWith('.html')) {
            urlPath = urlPath.replace('.html', '/');
        }
        
        // Ensure leading slash
        if (!urlPath.startsWith('/')) {
            urlPath = '/' + urlPath;
        }
        
        return urlPath;
    }
    
    /**
     * Extract metadata from HTML
     */
    extractMetadata(content, urlPath) {
        // Default values
        let title = this.getPageTitleFromPath(urlPath);
        let description = `Bridger Western wiki page about ${title}`;
        
        // Extract title from <title> tag
        const titleMatch = content.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].replace('–', '-').trim();
        }
        
        // Extract description from meta tag
        const descMatch = content.match(/<meta name="description" content="(.*?)"/i);
        if (descMatch && descMatch[1]) {
            description = descMatch[1].trim();
        }
        
        return { title, description };
    }
    
    /**
     * Get page title from URL path
     */
    getPageTitleFromPath(urlPath) {
        // Remove trailing slash and split
        const parts = urlPath.replace(/\/$/, '').split('/').filter(p => p);
        
        if (parts.length === 0) return 'Home';
        
        // Get the last part and format it
        const lastPart = parts[parts.length - 1];
        return lastPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Extract content summary from HTML
     */
    extractContentSummary(content) {
        // Remove scripts, styles, and HTML tags
        let text = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        // Take first 500 characters for summary
        return text.length > 500 ? text.substring(0, 500) + '...' : text;
    }
    
    /**
     * Get file modification time
     */
    getFileModTime(filePath) {
        const stat = fs.statSync(filePath);
        return stat.mtime.toISOString().split('T')[0];
    }
    
    /**
     * Get category from file path
     */
    getCategory(filePath) {
        const parts = filePath.split(path.sep);
        
        if (parts.includes('stands')) return 'Stands';
        if (parts.includes('weapons')) return 'Weapons';
        if (parts.includes('cards')) return 'Cards';
        if (parts.includes('items')) return 'Items';
        if (parts.includes('guides')) return 'Guides';
        if (parts.includes('fishing')) return 'Fishing';
        if (parts.includes('locations')) return 'Locations';
        
        return 'Other';
    }
    
    /**
     * Update llms.txt (simplified summary)
     */
    updateLlmsTxt(pagesData) {
        console.log('📝 Updating llms.txt...');
        
        let content = `# Bridger Western Wiki\n\n`;
        content += `> Complete wiki and survival guide for Bridger Western, a Roblox survival game set in Ridge B Valley. Covers Stands, Weapons, Cards, acquisition methods, tier rankings, clan coordination, and survival mechanics for the ${new Date().getFullYear()} Alpha version.\n\n`;
        content += `## Site Information\n\n`;
        content += `- **URL**: ${this.siteUrl}/\n`;
        content += `- **Type**: Game Wiki & Guide\n`;
        content += `- **Game**: Bridger Western (Roblox)\n`;
        content += `- **Last Updated**: ${this.currentDate}\n`;
        content += `- **Content**: Stands, Weapons, Cards, Guides, Tier Lists\n\n`;
        content += `## Available Content\n\n`;
        
        // Group pages by category
        const categories = {};
        pagesData.forEach(page => {
            if (!categories[page.category]) {
                categories[page.category] = [];
            }
            categories[page.category].push(page);
        });
        
        // Add content for each category
        Object.keys(categories).sort().forEach(category => {
            categories[category].forEach(page => {
                content += `- [${page.title}](${page.url}): ${page.description}\n`;
            });
        });
        
        content += `\n## Key Game Mechanics\n\n`;
        content += `- **Stand Acquisition**: Arrow Shard fishing (0.05%) or Corpse Part KOTH events (15-20% with holding)\n`;
        content += `- **Card Acquisition**: Mud Witch in Swamp, 150 Moola per roll, choose 1 from 3 random cards, 3-card maximum per character\n`;
        content += `- **Items & Utilities**: Ammo Box (& Silver Ammo for vampires), Tonic (healing), Dogbane Herb (4% chest drop, trade for 2500 moola/age regression/stand removal), Dynamite, Molotov, Silver Dagger, Wooden Stake (anti-vampire), Lasso, Poncho (damage reduction), Cowboy Hat (headshot protection), Lantern, Coin (ricochet), Smoke Bomb, Arrow Pack, Knives, Steel Wireset\n`;
        content += `- **Best Cards**: Archer's Child (bow builds), Desperado (gun builds), Free Runner (universal mobility), EXECUTIONER (headshot kills), Quick Draw (weapon swap)\n`;
        
        fs.writeFileSync(path.join(this.basePath, 'llms.txt'), content);
        console.log(`✅ llms.txt updated with ${pagesData.length} pages`);
    }
    
    /**
     * Update llms-full.txt (detailed index)
     */
    updateLlmsFullTxt(pagesData) {
        console.log('📝 Updating llms-full.txt...');
        
        let content = `# Bridger Western Wiki - Full Content Index\n\n`;
        content += `> Complete wiki for Bridger Western, a Roblox survival game set in Ridge B Valley. ${new Date().getFullYear()} Alpha version. All content is verified from user-provided gameplay data and community analysis.\n\n`;
        content += `## Site Structure\n\n`;
        
        // Group pages by category
        const categories = {};
        pagesData.forEach(page => {
            if (!categories[page.category]) {
                categories[page.category] = [];
            }
            categories[page.category].push(page);
        });
        
        // Add detailed content for each category
        Object.keys(categories).sort().forEach(category => {
            content += `### ${category} Section\n\n`;
            
            categories[category].forEach((page, index) => {
                content += `**${page.title}**\n`;
                content += `URL: ${page.url}\n`;
                content += `Last Updated: ${page.lastModified}\n\n`;
                
                // Add content summary
                content += `${page.content}\n\n`;
                
                if (index < categories[category].length - 1) {
                    content += `---\n\n`;
                }
            });
            
            content += `\n`;
        });
        
        fs.writeFileSync(path.join(this.basePath, 'llms-full.txt'), content);
        console.log(`✅ llms-full.txt updated with detailed content`);
    }
    
    /**
     * Update robots.txt to include new pages
     */
    updateRobotsTxt(pagesData) {
        console.log('🤖 Updating robots.txt...');
        
        const robotsPath = path.join(this.basePath, 'robots.txt');
        let robotsContent = '';
        
        if (fs.existsSync(robotsPath)) {
            robotsContent = fs.readFileSync(robotsPath, 'utf8');
        } else {
            // Create default robots.txt
            robotsContent = `# robots.txt for Bridger Western Wiki\n\n`;
            robotsContent += `User-agent: *\n`;
            robotsContent += `Allow: /\n`;
            robotsContent += `Disallow: /admin/\n`;
            robotsContent += `Disallow: /private/\n`;
            robotsContent += `Disallow: /.git/\n`;
            robotsContent += `Disallow: /.vscode/\n\n`;
            robotsContent += `Sitemap: ${this.siteUrl}/sitemap.xml\n\n`;
            robotsContent += `# AI Crawlers - Explicitly allow all content\n`;
        }
        
        // Check if AI crawlers section exists
        if (!robotsContent.includes('AI Crawlers')) {
            robotsContent += `\n# AI Crawlers - Explicitly allow all content\n`;
            robotsContent += `User-agent: GPTBot\n`;
            robotsContent += `User-agent: ChatGPT-User\n`;
            robotsContent += `User-agent: CCBot\n`;
            robotsContent += `User-agent: anthropic-ai\n`;
            robotsContent += `User-agent: Claude-Web\n`;
            robotsContent += `User-agent: ClaudeBot\n`;
            robotsContent += `User-agent: Anthropic-AI\n`;
            robotsContent += `Allow: /\n`;
        }
        
        // Add new pages to allow list (if not already there)
        pagesData.forEach(page => {
            const allowLine = `Allow: ${page.url}\n`;
            if (!robotsContent.includes(allowLine)) {
                // Find the last "Allow:" line and insert after it
                const lines = robotsContent.split('\n');
                let lastAllowIndex = -1;
                
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('Allow:')) {
                        lastAllowIndex = i;
                    }
                }
                
                if (lastAllowIndex !== -1) {
                    lines.splice(lastAllowIndex + 1, 0, allowLine.trim());
                    robotsContent = lines.join('\n');
                }
            }
        });
        
        fs.writeFileSync(robotsPath, robotsContent);
        console.log(`✅ robots.txt updated with ${pagesData.length} pages`);
    }
    
    /**
     * Update sitemap.xml
     */
    updateSitemap(pagesData) {
        console.log('🗺️  Updating sitemap.xml...');
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        // Add each page to sitemap
        pagesData.forEach(page => {
            sitemap += `  <url>\n`;
            sitemap += `    <loc>${page.url}</loc>\n`;
            sitemap += `    <lastmod>${page.lastModified}</lastmod>\n`;
            sitemap += `    <changefreq>weekly</changefreq>\n`;
            sitemap += `    <priority>${this.getPriority(page.url)}</priority>\n`;
            sitemap += `  </url>\n`;
        });
        
        sitemap += `</urlset>`;
        
        fs.writeFileSync(path.join(this.basePath, 'sitemap.xml'), sitemap);
        console.log(`✅ sitemap.xml updated with ${pagesData.length} URLs`);
    }
    
    /**
     * Get priority for sitemap based on URL
     */
    getPriority(url) {
        if (url === '/') return '1.0';
        if (url.includes('/stands/')) return '0.9';
        if (url.includes('/weapons/')) return '0.8';
        if (url.includes('/guides/')) return '0.8';
        return '0.7';
    }
    
    /**
     * Generate content roadmap
     */
    generateRoadmap(pagesData) {
        console.log('🗺️  Generating content roadmap...');
        
        let roadmap = `# Content Roadmap - Bridger Western Wiki\n\n`;
        roadmap += `Generated: ${this.currentDate}\n`;
        roadmap += `Total Pages: ${pagesData.length}\n\n`;
        
        // Group by category
        const categories = {};
        pagesData.forEach(page => {
            if (!categories[page.category]) {
                categories[page.category] = [];
            }
            categories[page.category].push(page);
        });
        
        // Generate roadmap for each category
        Object.keys(categories).sort().forEach(category => {
            roadmap += `## ${category} (${categories[category].length} pages)\n\n`;
            
            categories[category].forEach(page => {
                roadmap += `### ${page.title}\n`;
                roadmap += `- **URL**: ${page.url}\n`;
                roadmap += `- **Last Updated**: ${page.lastModified}\n`;
                roadmap += `- **Status**: ✅ Published\n`;
                roadmap += `\n`;
            });
        });
        
        // Add suggested new content
        roadmap += `## Suggested New Content\n\n`;
        roadmap += `### High Priority\n`;
        roadmap += `- [ ] Money Farming Guide\n`;
        roadmap += `- [ ] Horse Racing Guide\n`;
        roadmap += `- [ ] PvP Strategy Guide\n\n`;
        
        roadmap += `### Medium Priority\n`;
        roadmap += `- [ ] Item Crafting Guide\n`;
        roadmap += `- [ ] NPC Relationship Guide\n`;
        roadmap += `- [ ] Weather Effects Guide\n\n`;
        
        roadmap += `### Low Priority\n`;
        roadmap += `- [ ] Easter Eggs Guide\n`;
        roadmap += `- [ ] Historical Lore Guide\n`;
        roadmap += `- [ ] Modding Guide\n`;
        
        const roadmapPath = path.join(this.basePath, 'CONTENT_ROADMAP.md');
        fs.writeFileSync(roadmapPath, roadmap);
        console.log(`✅ Content roadmap generated at CONTENT_ROADMAP.md`);
    }
}

// Run the indexer
const indexer = new ContentIndexer();
indexer.indexAllContent();