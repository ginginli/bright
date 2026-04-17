/**
 * Component Loader for Bridger Western Wiki
 * Dynamically loads navigation and footer components
 */

class ComponentLoader {
    constructor() {
        this.components = {
            'nav': '/components/nav.html',
            'footer': '/components/footer.html',
            'ad-header': '/components/ad-header.html'
        };
    }

    /**
     * Load a component into a container
     * @param {string} componentName - 'nav' or 'footer'
     * @param {string} containerId - HTML element id to load into
     */
    async loadComponent(componentName, containerId) {
        const url = this.components[componentName];
        if (!url) {
            console.error(`Component ${componentName} not defined`);
            return;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load ${componentName}: ${response.status}`);
            }
            
            const html = await response.text();
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = html;
                
                // Re-execute any script tags in the loaded component
                container.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    newScript.textContent = oldScript.textContent;
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });

                // After loading nav, set active state based on current URL
                if (componentName === 'nav') {
                    this.setActiveNavItem();
                }
            } else {
                console.error(`Container ${containerId} not found`);
            }
        } catch (error) {
            console.error(`Error loading ${componentName}:`, error);
            
            // Fallback: Show error message
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `<div style="color: #666; padding: 20px; text-align: center;">
                    Navigation component could not be loaded.
                </div>`;
            }
        }
    }

    /**
     * Set active state on navigation items based on current URL
     */
    setActiveNavItem() {
        const currentPath = window.location.pathname;
        
        // Remove all active classes first
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Find matching nav item
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href === '/') {
                // Home page - only active on root
                if (currentPath === '/' || currentPath === '/index.html') {
                    link.classList.add('active');
                }
            } else if (href && currentPath.startsWith(href)) {
                // Section pages - active when in that section
                link.classList.add('active');
            }
        });
    }

    /**
     * Initialize and load all components
     */
    async init() {
        // Load navigation if container exists
        if (document.getElementById('nav-container')) {
            await this.loadComponent('nav', 'nav-container');
            this.setupMobileNav();
        }
        
        // Load footer if container exists
        if (document.getElementById('footer-container')) {
            await this.loadComponent('footer', 'footer-container');
        }

        // Load ad if container exists
        if (document.getElementById('ad-container')) {
            await this.loadComponent('ad-header', 'ad-container');
        }
    }

    /**
     * Setup mobile navigation functionality
     */
    setupMobileNav() {
        // Wait a bit for the nav to be fully loaded
        setTimeout(() => {
            const toggle = document.querySelector('.nav-toggle');
            const nav = document.querySelector('.main-nav');
            
            if (toggle && nav) {
                toggle.addEventListener('click', () => nav.classList.toggle('open'));
            }
            
            // Dropdown on mobile tap
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', e => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        link.closest('.nav-item').classList.toggle('active');
                    }
                });
            });
        }, 100);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.init();

    // ── Global TOC (On This Page) ──────────────────────────────
    // Runs on all pages. If a #page-toc container exists, populate it.
    // Otherwise, if the page has enough H2s, create a floating TOC FAB.
    (function initTOC() {
        // Find content area: prefer .page-sidebar-main, fallback to <main>
        var contentArea = document.querySelector('.page-sidebar-main') || document.querySelector('main');
        if (!contentArea) return;

        // Collect H2s with section-title class first, then all H2s (skip first/last)
        var h2s = Array.from(contentArea.querySelectorAll('h2.section-title'));
        if (h2s.length === 0) {
            var all = Array.from(contentArea.querySelectorAll('h2'));
            h2s = all.length > 2 ? all.slice(1, all.length - 1) : all;
        }
        if (h2s.length < 2) return; // not enough sections to warrant a TOC

        // Assign IDs
        h2s.forEach(function(h, i) {
            if (!h.id) h.id = 'sec-' + i;
        });

        function buildLinks(container) {
            if (!container) return;
            h2s.forEach(function(h) {
                var a = document.createElement('a');
                a.href = '#' + h.id;
                var text = h.textContent.trim().replace(/^[^a-zA-Z0-9]+/, '').trim();
                a.textContent = text || h.textContent.trim();
                container.appendChild(a);
            });
        }

        // Populate existing #page-toc and #page-toc-mobile if present
        buildLinks(document.getElementById('page-toc'));
        buildLinks(document.getElementById('page-toc-mobile'));

        // Scroll highlight via IntersectionObserver
        var allTocContainers = [
            document.getElementById('page-toc'),
            document.getElementById('page-toc-mobile')
        ].filter(Boolean);

        if (allTocContainers.length > 0 && 'IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(e) {
                    allTocContainers.forEach(function(container) {
                        var link = container.querySelector('a[href="#' + e.target.id + '"]');
                        if (link) link.classList.toggle('toc-active', e.isIntersecting);
                    });
                });
            }, { rootMargin: '-5% 0px -80% 0px' });
            h2s.forEach(function(h) { observer.observe(h); });
        }
    })();
});

// Export for manual usage
window.ComponentLoader = ComponentLoader;