/**
 * Versioner Page - Release Notes Accordion Functionality
 */

/**
 * Toggle a release item's expanded state
 * @param {HTMLElement} header - The release header element that was clicked
 */
function toggleRelease(header) {
    const releaseItem = header.closest('.release-item');

    if (releaseItem) {
        // Toggle the expanded class
        releaseItem.classList.toggle('expanded');
    }
}

/**
 * Initialize the page - ensure the latest version is expanded by default
 */
document.addEventListener('DOMContentLoaded', function() {
    // The first release item (latest version) should already have the "expanded" class in HTML
    // This code ensures it's set even if it was missed
    const firstRelease = document.querySelector('.release-item');
    if (firstRelease && !firstRelease.classList.contains('future')) {
        firstRelease.classList.add('expanded');
    }
});
