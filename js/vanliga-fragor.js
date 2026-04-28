// Vanliga frågor (FAQ) — interaktion: sök, filter, deep-linking

(function () {
    'use strict';

    const searchInput = document.getElementById('faq-search-input');
    const searchWrap = document.querySelector('.faq-search');
    const clearBtn = document.querySelector('.faq-search-clear');
    const filterBtns = Array.from(document.querySelectorAll('.faq-filter'));
    const items = Array.from(document.querySelectorAll('.faq-item'));
    const groups = Array.from(document.querySelectorAll('.faq-group'));
    const emptyState = document.getElementById('faq-empty');

    if (!searchInput || items.length === 0) return;

    // Pre-compute searchable text (question + answer) for each item
    const itemIndex = items.map(item => {
        const question = item.querySelector('.faq-q-text');
        const answer = item.querySelector('.faq-answer');
        const text = [
            question ? question.textContent : '',
            answer ? answer.textContent : ''
        ].join(' ').toLowerCase();
        return { item, text, category: item.dataset.category || '' };
    });

    let activeFilter = 'all';
    let currentQuery = '';

    function normalize(s) {
        return (s || '').toLowerCase().trim();
    }

    function applyFilters() {
        const query = normalize(currentQuery);
        let visibleCount = 0;
        const visibleByCategory = {};

        itemIndex.forEach(({ item, text, category }) => {
            const matchesCategory = activeFilter === 'all' || category === activeFilter;
            const matchesQuery = !query || text.indexOf(query) !== -1;
            const visible = matchesCategory && matchesQuery;
            item.hidden = !visible;
            if (visible) {
                visibleCount += 1;
                visibleByCategory[category] = (visibleByCategory[category] || 0) + 1;
            }
        });

        // Hide group headers when no items in that group are visible
        groups.forEach(group => {
            const cat = group.dataset.category;
            const has = (visibleByCategory[cat] || 0) > 0;
            group.hidden = !has;
        });

        // Empty state
        if (emptyState) {
            emptyState.dataset.visible = visibleCount === 0 ? 'true' : 'false';
        }
    }

    function setActiveFilter(filter) {
        activeFilter = filter;
        filterBtns.forEach(btn => {
            const isActive = btn.dataset.filter === filter;
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        applyFilters();
    }

    // Filter button counts
    function updateFilterCounts() {
        const totals = { all: items.length };
        itemIndex.forEach(({ category }) => {
            totals[category] = (totals[category] || 0) + 1;
        });
        filterBtns.forEach(btn => {
            const filter = btn.dataset.filter;
            const countEl = btn.querySelector('.faq-filter-count');
            if (countEl && totals[filter] != null) {
                countEl.textContent = totals[filter];
            }
        });
    }

    // Search input
    searchInput.addEventListener('input', () => {
        currentQuery = searchInput.value;
        if (searchWrap) {
            searchWrap.classList.toggle('has-value', currentQuery.length > 0);
        }
        applyFilters();
    });

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentQuery = '';
            if (searchWrap) searchWrap.classList.remove('has-value');
            applyFilters();
            searchInput.focus();
        });
    }

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveFilter(btn.dataset.filter);
        });
    });

    // Deep linking: open and scroll to anchored question
    function openFromHash() {
        const hash = window.location.hash;
        if (!hash || hash.length < 2) return;
        const target = document.querySelector(hash);
        if (target && target.classList.contains('faq-item')) {
            target.open = true;
            // Wait for layout, then scroll
            requestAnimationFrame(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    }

    // Keep hash in URL when opening an item (without scroll-jump)
    items.forEach(item => {
        if (!item.id) return;
        item.addEventListener('toggle', () => {
            if (item.open && history.replaceState) {
                history.replaceState(null, '', '#' + item.id);
            }
        });
    });

    // Init
    updateFilterCounts();
    applyFilters();
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
})();
