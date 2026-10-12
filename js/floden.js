// Flöden and Tal till text: staggered reveal of the diagrams and step cards.
// Progressive enhancement: without JavaScript or IntersectionObserver nothing is
// hidden. With reduced motion every block is shown at once, without transitions.
(function () {
    if (!('IntersectionObserver' in window)) return;

    const blocks = document.querySelectorAll('.t-stagger');
    if (!blocks.length) return;

    document.documentElement.classList.add('js-reveal');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
        blocks.forEach((block) => block.classList.add('is-shown'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-shown');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    blocks.forEach((block) => observer.observe(block));
})();
