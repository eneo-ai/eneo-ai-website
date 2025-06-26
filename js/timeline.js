// Timeline Page JavaScript - Basic animations only (no hover effects)

document.addEventListener('DOMContentLoaded', function() {
    initializeTimelineAnimations();
    initializeScrollAnimations();
});

// Initialize timeline entrance animations
function initializeTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Reset animation state
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
    });
    
    // Trigger animations with staggered delays
    setTimeout(() => {
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                
                // Add a subtle bounce effect
                setTimeout(() => {
                    item.style.transform = 'translateY(-5px)';
                    setTimeout(() => {
                        item.style.transform = 'translateY(0)';
                    }, 150);
                }, 400);
                
            }, index * 200);
        });
    }, 500);
}

// Initialize scroll-triggered animations
function initializeScrollAnimations() {
    // Create intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special animation for learning items (if they still exist)
                if (entry.target.classList.contains('learning-item')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
                    setTimeout(() => {
                        entry.target.style.transform = 'translateY(0) scale(1)';
                        entry.target.style.opacity = '1';
                    }, delay);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const elementsToAnimate = document.querySelectorAll('.learning-item');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px) scale(0.95)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// Utility function to check if element is in viewport
function isElementInViewport(element, threshold = 0.5) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const verticalVisibility = (rect.top + rect.height * threshold) < windowHeight && 
                              (rect.bottom - rect.height * threshold) > 0;
    const horizontalVisibility = (rect.left + rect.width * threshold) < windowWidth && 
                                (rect.right - rect.width * threshold) > 0;
    
    return verticalVisibility && horizontalVisibility;
}

// Export functions for potential external use (minimal set)
window.TimelineInteractions = {
    isElementInViewport
};
