// Filtrering av nyheter på nyheter.html.
// Knapparna i .filter-bar har data-filter (alla/release/community) och
// varje kort (inkl. featured) har data-category. Vid klick döljs kort som
// inte matchar via hidden-attributet, knapparnas tillstånd uppdateras
// (active + aria-pressed) och antalet träffar annonseras via en status-region.
(function () {
    'use strict';

    var buttons = Array.prototype.slice.call(
        document.querySelectorAll('.filter-btn[data-filter]')
    );
    if (!buttons.length) return;

    var cards = Array.prototype.slice.call(
        document.querySelectorAll('.news-card[data-category]')
    );
    var featuredSection = document.querySelector('.featured');
    var featuredCard = featuredSection
        ? featuredSection.querySelector('[data-category]')
        : null;
    var status = document.getElementById('filter-status');

    function apply(filter) {
        var visible = 0;

        // Utvald nyhet: dölj hela sektionen om den inte matchar.
        if (featuredSection && featuredCard) {
            var featuredMatch =
                filter === 'alla' || featuredCard.getAttribute('data-category') === filter;
            featuredSection.hidden = !featuredMatch;
            if (featuredMatch) visible++;
        }

        cards.forEach(function (card) {
            var match =
                filter === 'alla' || card.getAttribute('data-category') === filter;
            card.hidden = !match;
            if (match) visible++;
        });

        buttons.forEach(function (btn) {
            var active = btn.getAttribute('data-filter') === filter;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (status) {
            status.textContent =
                visible === 1 ? 'Visar 1 nyhet' : 'Visar ' + visible + ' nyheter';
        }
    }

    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            apply(btn.getAttribute('data-filter'));
        });
    });
})();
