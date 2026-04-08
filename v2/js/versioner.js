/**
 * Versioner Page - Release Notes Accordion Functionality
 */

/**
 * Toggle a release's expanded state
 * @param {HTMLElement} header - The release header element
 */
function toggleRelease(header) {
    const release = header.closest('.release');
    if (!release) return;

    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    release.classList.toggle('collapsed', !isExpanded);
}

/**
 * Initialize accordion keyboard support and ARIA
 */
document.addEventListener('DOMContentLoaded', function() {
    const headers = document.querySelectorAll('.release-header');

    headers.forEach((header, index) => {
        // Make headers focusable and interactive
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'true');

        // Click handler
        header.addEventListener('click', function() {
            toggleRelease(this);
        });

        // Keyboard handler (Enter and Space)
        header.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleRelease(this);
            }
        });
    });
});
