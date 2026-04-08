// Main JavaScript functionality for Eneo.ai website

// Reduced motion preference helper
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Theme toggle functionality
function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
    updateThemeIcon();
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let next;
    if (current === 'light') {
        next = 'dark';
    } else if (current === 'dark') {
        next = 'light';
    } else {
        // No manual override — toggle away from system preference
        next = prefersDark ? 'light' : 'dark';
    }

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon();
}

function updateThemeIcon() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const theme = document.documentElement.getAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (!theme && prefersDark);

    btn.setAttribute('aria-label', isDark ? 'Byt till ljust tema' : 'Byt till mörkt tema');
    btn.innerHTML = isDark
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

// Apply theme immediately (before DOMContentLoaded to avoid flash)
initTheme();

// Mobile menu functionality
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');

    if (mobileNav && menuBtn) {
        const isActive = mobileNav.classList.contains('active');

        if (isActive) {
            closeMobileMenu();
        } else {
            mobileNav.classList.add('active');
            menuBtn.setAttribute('aria-expanded', 'true');
            // Focus first link in mobile nav
            const firstLink = mobileNav.querySelector('a');
            if (firstLink) firstLink.focus();
        }
    }
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');

    if (mobileNav && menuBtn) {
        mobileNav.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileNav = document.getElementById('mobile-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');

    if (mobileNav && menuBtn && !menuBtn.contains(event.target) && !mobileNav.contains(event.target)) {
        closeMobileMenu();
    }
});

// Escape key closes mobile menu
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const mobileNav = document.getElementById('mobile-nav');
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (mobileNav && mobileNav.classList.contains('active')) {
            closeMobileMenu();
            if (menuBtn) menuBtn.focus();
        }
    }
});

// Focus trap for mobile menu
document.addEventListener('keydown', function(event) {
    if (event.key !== 'Tab') return;
    const mobileNav = document.getElementById('mobile-nav');
    if (!mobileNav || !mobileNav.classList.contains('active')) return;

    const menuBtn = document.getElementById('mobile-menu-btn');
    const focusable = [menuBtn, ...mobileNav.querySelectorAll('a, button')].filter(Boolean);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});

// Close mobile menu on window resize
window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
        closeMobileMenu();
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            const headerOffset = 100;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
            });
        }
    });
});

// Add entrance animation for trust indicators only
document.addEventListener('DOMContentLoaded', function() {
    const trustIndicators = document.querySelectorAll('.trust-indicator');

    if (prefersReducedMotion.matches) {
        // Show immediately without animation
        trustIndicators.forEach(indicator => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'none';
        });
    } else {
        trustIndicators.forEach((indicator, index) => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(30px)';

            setTimeout(() => {
                indicator.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                indicator.style.opacity = '1';
                indicator.style.transform = 'translateY(0)';
            }, 200 + (index * 150));
        });
    }

    // Set initial aria attributes
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', 'false');
    }
});

// Utility function to detect if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Utility function for intersection observer (for future animations)
function createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerOptions = { ...defaultOptions, ...options };

    return new IntersectionObserver(callback, observerOptions);
}

// Export functions for potential use in other scripts
window.Eneo = {
    toggleMobileMenu,
    closeMobileMenu,
    toggleTheme,
    isInViewport,
    createIntersectionObserver
};
