// Mobile Admin Panel Enhancements
// Provides enhanced mobile functionality and navigation improvements

class MobileAdminEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollToTargets();
        this.setupMobileGestures();
        this.setupKeyboardShortcuts();
        this.setupAccessibilityFeatures();
        this.initializeResponsiveFeatures();
    }

    setupScrollToTargets() {
        // Add scroll target IDs to content sections
        this.addScrollTargets();
        
        // Setup intersection observer for active section highlighting
        this.setupSectionObserver();
    }

    addScrollTargets() {
        // This will be called when content is loaded
        setTimeout(() => {
            this.addTargetToSection('add-product', 'Yeni Ürün Ekle');
            this.addTargetToSection('add-category', 'Yeni Kategori Ekle');
            this.addTargetToSection('edit-products', 'Ürün Listesi');
            this.addTargetToSection('edit-categories', 'Kategori Listesi');
            this.addTargetToSection('security-dashboard', 'Güvenlik Dashboard');
        }, 1000);
    }

    addTargetToSection(targetId, sectionTitle) {
        // Look for section headers and add target IDs
        const headers = document.querySelectorAll('h1, h2, h3');
        headers.forEach(header => {
            if (header.textContent.includes(sectionTitle)) {
                header.id = targetId;
                header.classList.add('scroll-target');
                
                // Add a subtle indicator
                const indicator = document.createElement('span');
                indicator.className = 'ml-2 text-yellow-500 opacity-0 transition-opacity';
                indicator.innerHTML = '<i data-lucide="target" class="h-4 w-4 inline"></i>';
                header.appendChild(indicator);
                
                // Show indicator on hover
                header.addEventListener('mouseenter', () => {
                    indicator.classList.remove('opacity-0');
                });
                header.addEventListener('mouseleave', () => {
                    indicator.classList.add('opacity-0');
                });
            }
        });
    }

    setupSectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.highlightActiveSection(entry.target.id);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-100px 0px -100px 0px'
        });

        // Observe scroll targets
        setTimeout(() => {
            document.querySelectorAll('.scroll-target').forEach(target => {
                observer.observe(target);
            });
        }, 1500);
    }

    highlightActiveSection(sectionId) {
        // Remove previous highlights
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-yellow-100', 'text-yellow-700');
        });

        // Highlight current section in navigation
        const sectionMappings = {
            'add-product': 'products',
            'edit-products': 'products',
            'add-category': 'categories',
            'edit-categories': 'categories',
            'security-dashboard': 'security'
        };

        const navSection = sectionMappings[sectionId];
        if (navSection) {
            const navItem = document.querySelector(`[data-section="${navSection}"]`);
            if (navItem) {
                navItem.classList.add('bg-yellow-100', 'text-yellow-700');
            }
        }
    }

    setupMobileGestures() {
        let startX = 0;
        let startY = 0;
        let isSwipeGesture = false;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwipeGesture = true;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isSwipeGesture) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;

            // If vertical scroll is more significant, don't treat as swipe
            if (Math.abs(diffY) > Math.abs(diffX)) {
                isSwipeGesture = false;
                return;
            }
        });

        document.addEventListener('touchend', (e) => {
            if (!isSwipeGesture) return;

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            // Swipe right to open sidebar (only on mobile)
            if (diffX < -100 && window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar.classList.contains('sidebar-collapsed')) {
                    window.toggleSidebar();
                }
            }

            // Swipe left to close sidebar (only on mobile)
            if (diffX > 100 && window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar.classList.contains('sidebar-expanded')) {
                    window.toggleSidebar();
                }
            }

            isSwipeGesture = false;
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Ctrl/Cmd + shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        window.toggleSidebar();
                        break;
                    case 'n':
                        e.preventDefault();
                        window.scrollToSection('add-product');
                        break;
                    case 'k':
                        e.preventDefault();
                        window.scrollToSection('add-category');
                        break;
                    case 's':
                        e.preventDefault();
                        window.scrollToSection('security-dashboard');
                        break;
                }
            }

            // Number shortcuts for quick navigation
            if (e.key >= '1' && e.key <= '9') {
                const sections = ['dashboard', 'products', 'categories', 'tables', 'qr-codes', 'restaurant', 'design', 'security', 'notifications'];
                const sectionIndex = parseInt(e.key) - 1;
                if (sections[sectionIndex]) {
                    window.showSection(sections[sectionIndex]);
                }
            }
        });
    }

    setupAccessibilityFeatures() {
        // Add ARIA labels and roles
        this.enhanceAccessibility();
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Add keyboard navigation for custom elements
        this.setupKeyboardNavigation();
    }

    enhanceAccessibility() {
        // Add ARIA labels to navigation items
        document.querySelectorAll('.nav-item').forEach((item, index) => {
            item.setAttribute('role', 'menuitem');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Navigate to ${item.textContent.trim()}`);
        });

        // Add ARIA labels to quick action buttons
        document.querySelectorAll('.quick-action-item button').forEach(button => {
            const text = button.querySelector('span').textContent;
            button.setAttribute('aria-label', `Quick action: ${text}`);
        });

        // Add landmark roles
        document.getElementById('sidebar')?.setAttribute('role', 'navigation');
        document.getElementById('mainContent')?.setAttribute('role', 'main');
        document.getElementById('quickActions')?.setAttribute('role', 'menu');
    }

    setupFocusManagement() {
        // Focus management for sidebar toggle
        const sidebarToggle = document.querySelector('[onclick="toggleSidebar()"]');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                // Focus first navigation item when sidebar opens
                setTimeout(() => {
                    const firstNavItem = document.querySelector('.nav-item');
                    if (firstNavItem && !document.getElementById('sidebar').classList.contains('sidebar-collapsed')) {
                        firstNavItem.focus();
                    }
                }, 300);
            });
        }

        // Focus management for quick actions
        document.getElementById('fabButton')?.addEventListener('click', () => {
            setTimeout(() => {
                const firstQuickAction = document.querySelector('.quick-action-item button');
                if (firstQuickAction && window.quickActionsVisible) {
                    firstQuickAction.focus();
                }
            }, 300);
        });
    }

    setupKeyboardNavigation() {
        // Navigation items keyboard support
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });

        // Quick action items keyboard support
        document.querySelectorAll('.quick-action-item button').forEach(button => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    window.toggleQuickActions();
                    document.getElementById('fabButton').focus();
                }
            });
        });
    }

    initializeResponsiveFeatures() {
        // Setup responsive breakpoint detection
        this.setupBreakpointDetection();
        
        // Initialize responsive navigation
        this.setupResponsiveNavigation();
        
        // Setup responsive content adjustments
        this.setupResponsiveContent();
    }

    setupBreakpointDetection() {
        const breakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };

        let currentBreakpoint = this.getCurrentBreakpoint(breakpoints);

        window.addEventListener('resize', () => {
            const newBreakpoint = this.getCurrentBreakpoint(breakpoints);
            if (newBreakpoint !== currentBreakpoint) {
                currentBreakpoint = newBreakpoint;
                this.handleBreakpointChange(newBreakpoint);
            }
        });
    }

    getCurrentBreakpoint(breakpoints) {
        const width = window.innerWidth;
        if (width < breakpoints.mobile) return 'mobile';
        if (width < breakpoints.tablet) return 'tablet';
        if (width < breakpoints.desktop) return 'desktop';
        return 'large';
    }

    handleBreakpointChange(breakpoint) {
        // Adjust UI based on breakpoint
        switch (breakpoint) {
            case 'mobile':
                this.optimizeForMobile();
                break;
            case 'tablet':
                this.optimizeForTablet();
                break;
            case 'desktop':
            case 'large':
                this.optimizeForDesktop();
                break;
        }
    }

    optimizeForMobile() {
        // Ensure sidebar is properly handled on mobile
        const sidebar = document.getElementById('sidebar');
        if (sidebar && !sidebar.classList.contains('sidebar-collapsed')) {
            // Close sidebar on mobile by default
            window.toggleSidebar();
        }

        // Adjust quick actions position
        const quickActions = document.getElementById('quickActions');
        if (quickActions) {
            quickActions.style.bottom = '90px';
            quickActions.style.right = '10px';
        }

        // Adjust FAB position
        const fab = document.getElementById('fabButton');
        if (fab) {
            fab.style.bottom = '10px';
            fab.style.right = '10px';
        }
    }

    optimizeForTablet() {
        // Tablet-specific optimizations
        const quickActions = document.getElementById('quickActions');
        if (quickActions) {
            quickActions.style.bottom = '90px';
            quickActions.style.right = '20px';
        }
    }

    optimizeForDesktop() {
        // Desktop-specific optimizations
        const quickActions = document.getElementById('quickActions');
        if (quickActions) {
            quickActions.style.bottom = '90px';
            quickActions.style.right = '20px';
        }

        const fab = document.getElementById('fabButton');
        if (fab) {
            fab.style.bottom = '20px';
            fab.style.right = '20px';
        }
    }

    setupResponsiveNavigation() {
        // Handle navigation state changes
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        window.closeSidebar();
                    }, 300);
                }
            });
        });
    }

    setupResponsiveContent() {
        // Adjust content based on screen size
        const observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const width = entry.contentRect.width;
                
                // Adjust table layouts
                const tables = document.querySelectorAll('table');
                tables.forEach(table => {
                    if (width < 768) {
                        table.classList.add('text-sm');
                    } else {
                        table.classList.remove('text-sm');
                    }
                });

                // Adjust card layouts
                const cards = document.querySelectorAll('.grid');
                cards.forEach(grid => {
                    if (width < 640) {
                        grid.classList.remove('grid-cols-2', 'grid-cols-3', 'grid-cols-4');
                        grid.classList.add('grid-cols-1');
                    }
                });
            });
        });

        observer.observe(document.getElementById('mainContent'));
    }

    // Public methods for external use
    static scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
            
            // Add highlight effect
            element.classList.add('ring-2', 'ring-yellow-400', 'ring-opacity-75');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-yellow-400', 'ring-opacity-75');
            }, 2000);
        }
    }

    static showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl+B', action: 'Toggle Sidebar' },
            { key: 'Ctrl+N', action: 'Add Product' },
            { key: 'Ctrl+K', action: 'Add Category' },
            { key: 'Ctrl+S', action: 'Security Dashboard' },
            { key: '1-9', action: 'Quick Navigation' },
            { key: 'Esc', action: 'Close Menus' }
        ];

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-md w-full p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Klavye Kısayolları</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="h-6 w-6"></i>
                    </button>
                </div>
                <div class="space-y-2">
                    ${shortcuts.map(shortcut => `
                        <div class="flex items-center justify-between py-2 border-b border-gray-100">
                            <span class="text-sm text-gray-600">${shortcut.action}</span>
                            <kbd class="px-2 py-1 bg-gray-100 rounded text-xs font-mono">${shortcut.key}</kbd>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        lucide.createIcons();
    }
}

// Initialize mobile enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.MobileAdminEnhancements = new MobileAdminEnhancements();
    
    // Add global scroll function
    window.scrollToSection = MobileAdminEnhancements.scrollToSection;
});

// Add help button for keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const helpButton = document.createElement('button');
        helpButton.className = 'fixed bottom-4 left-4 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg z-40 transition-all';
        helpButton.innerHTML = '<i data-lucide="help-circle" class="h-5 w-5"></i>';
        helpButton.title = 'Klavye Kısayolları';
        helpButton.onclick = () => MobileAdminEnhancements.showKeyboardShortcuts();
        
        document.getElementById('adminPanel')?.appendChild(helpButton);
        lucide.createIcons();
    }, 2000);
});