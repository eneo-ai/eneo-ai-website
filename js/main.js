// Main JavaScript functionality for Eneo.ai website

// Mobile menu functionality
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuBtn = document.getElementById('mobile-menu-btn');
    
    if (mobileNav && menuBtn) {
        const isActive = mobileNav.classList.contains('active');
        
        if (isActive) {
            mobileNav.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        } else {
            mobileNav.classList.add('active');
            menuBtn.setAttribute('aria-expanded', 'true');
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
            const headerOffset = 100; // Account for fixed header
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Add entrance animation for trust indicators only
document.addEventListener('DOMContentLoaded', function() {
    // Animate trust indicators on load
    const trustIndicators = document.querySelectorAll('.trust-indicator');
    trustIndicators.forEach((indicator, index) => {
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            indicator.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            indicator.style.opacity = '1';
            indicator.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });

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
    isInViewport,
    createIntersectionObserver
};
