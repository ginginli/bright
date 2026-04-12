/**
 * Component Loader for Bridger Western Wiki
 * Dynamically loads navigation and footer components
 */

class ComponentLoader {
    constructor() {
        this.components = {
            'nav': '/components/nav.html',
            'footer': '/components/footer.html'
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
});

// Export for manual usage
window.ComponentLoader = ComponentLoader;