/**
 * Roadmap Page - Rendering från data/roadmap.json + versionsfilter
 *
 * Datafilen genereras av .github/workflows/roadmap.yml från den offentliga
 * exporten i eneo-ai/eneo (se ROADMAP_WEBSITE_HANDOFF.md). Sidan gör ingen
 * egen klassificering — grupperna kommer rakt från datans "group"-fält.
 *
 * Säkerhet: all fjärrtext renderas via textContent, aldrig innerHTML.
 */

(function () {
    'use strict';

    var DATA_URL = 'data/roadmap.json';
    var ISSUE_URL_PREFIX = 'https://github.com/eneo-ai/eneo/';

    // Datan uppdateras normalt var 6:e timme. Är den äldre än så här har något
    // stannat (t.ex. utgången GitHub-token, stoppad källexport) — då visas en
    // inaktualitetsnotis. 24h = flera missade cykler, tål cron-jitter utan
    // falsklarm.
    var STALE_THRESHOLD_HOURS = 24;

    /* ── Hjälpare ── */

    // Exporten använder fritext-sentineln "Not assigned." för tomma fält.
    // Behandla den (och tomt/null) som "inget värde" så metadata bara visas när
    // fältet faktiskt har ett innehåll (handoff: "visa metadata endast när
    // fältet har ett värde").
    function hasValue(value) {
        if (typeof value !== 'string') return false;
        var trimmed = value.trim();
        return trimmed !== '' && trimmed.toLowerCase() !== 'not assigned.';
    }

    // Ta alltid bort ledande issue-tracker-prefix som "[Epic]: " i visningen
    // (utöver att byggskriptet redan städar det före översättningen).
    function stripTrackerPrefix(title) {
        return typeof title === 'string' ? title.replace(/^\s*\[[^\]]+\]:\s*/, '') : title;
    }

    function formatDate(isoString, options) {
        var date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return null;
        return new Intl.DateTimeFormat('sv-SE', options).format(date);
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function showError() {
        var error = document.getElementById('roadmap-error');
        var loading = document.getElementById('roadmap-loading');
        var board = document.querySelector('.roadmap-board');
        if (loading) loading.hidden = true;
        if (board) board.hidden = true;
        if (error) error.hidden = false;
    }

    /* ── Kort ── */

    function buildCard(item) {
        var card = el('li', 'epic-card');
        var version = hasValue(item.roadmapVersion) ? item.roadmapVersion : '';
        var sponsor = hasValue(item.sponsor) ? item.sponsor : '';
        card.dataset.version = version;
        card.dataset.sponsor = sponsor;

        var title = stripTrackerPrefix(item.title);
        var heading = el('h3');
        // Länka endast om url:en verkligen pekar på källrepot (försvar på djupet
        // utöver byggskriptets validering)
        if (typeof item.url === 'string' && item.url.indexOf(ISSUE_URL_PREFIX) === 0) {
            var link = el('a', 'epic-link', title);
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.appendChild(el('span', 'sr-only', ' (öppnas i ny flik)'));
            heading.appendChild(link);
        } else {
            heading.textContent = title;
        }
        card.appendChild(heading);

        // Sponsor visas alltid direkt på kortet (även i kollapsat läge) och
        // filtrerar vid klick.
        if (sponsor) {
            var sponsorButton = el('button', 'epic-sponsor', sponsor);
            sponsorButton.type = 'button';
            sponsorButton.dataset.filterDimension = 'sponsor';
            sponsorButton.dataset.filterValue = sponsor;
            sponsorButton.setAttribute('aria-label', 'Filtrera på sponsor ' + sponsor);
            card.appendChild(sponsorButton);
        }

        // Fällbar del: beskrivning + metadata. Bara rubriken (+ sponsor) visas
        // i första läget.
        var details = el('div', 'epic-details');
        details.id = 'epic-details-' + item.number;
        details.hidden = true;

        if (typeof item.summary === 'string' && item.summary.trim() !== '') {
            details.appendChild(el('p', 'epic-summary', item.summary));
        }

        var meta = el('div', 'epic-meta');
        if (version) {
            var versionButton = el('button', 'epic-version', version);
            versionButton.type = 'button';
            versionButton.dataset.filterDimension = 'version';
            versionButton.dataset.filterValue = version;
            versionButton.setAttribute('aria-label', 'Filtrera på version ' + version);
            meta.appendChild(versionButton);
        }
        if (hasValue(item.area)) meta.appendChild(el('span', 'epic-chip', item.area));
        if (hasValue(item.priority)) meta.appendChild(el('span', 'epic-chip', 'Prioritet: ' + item.priority));
        var start = hasValue(item.startDate)
            ? formatDate(item.startDate, { year: 'numeric', month: 'short' }) : null;
        var target = hasValue(item.targetDate)
            ? formatDate(item.targetDate, { year: 'numeric', month: 'short' }) : null;
        if (start) meta.appendChild(el('span', 'epic-chip', 'Start: ' + start));
        if (target) meta.appendChild(el('span', 'epic-chip', 'Mål: ' + target));
        if (meta.childNodes.length > 0) details.appendChild(meta);

        // Visa knappen bara om det faktiskt finns något att fälla ut
        if (details.childNodes.length > 0) {
            var toggle = el('button', 'epic-toggle');
            toggle.type = 'button';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-controls', details.id);
            var toggleLabel = el('span', 'epic-toggle-label', 'Visa mer');
            toggle.appendChild(toggleLabel);
            toggle.appendChild(el('span', 'epic-toggle-icon', ''));
            toggle.setAttribute('aria-label', 'Visa mer om ' + title);

            toggle.addEventListener('click', function () {
                var expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!expanded));
                details.hidden = expanded;
                toggleLabel.textContent = expanded ? 'Visa mer' : 'Visa mindre';
                toggle.setAttribute('aria-label',
                    (expanded ? 'Visa mer om ' : 'Visa mindre om ') + title);
            });

            card.appendChild(toggle);
        }

        card.appendChild(details);

        return card;
    }

    /* ── Tavla ── */

    function renderBoard(data) {
        var itemsByGroup = {};
        data.items.forEach(function (item) {
            (itemsByGroup[item.group] = itemsByGroup[item.group] || []).push(item);
        });

        document.querySelectorAll('.roadmap-column').forEach(function (column) {
            var group = column.dataset.group;
            var items = itemsByGroup[group] || [];
            var list = column.querySelector('.column-cards');

            items.forEach(function (item) {
                list.appendChild(buildCard(item));
            });

            // Tom Levererat-grupp döljs helt (handoff); övriga tomma grupper
            // visar sitt tomtillstånd
            if (items.length === 0 && group === 'delivered') {
                column.hidden = true;
            }
        });
    }

    /* ── Metadata (Senast uppdaterad, unpublished-notis) ── */

    function renderMeta(data) {
        var time = document.getElementById('roadmap-generated-at');
        if (time) {
            var formatted = formatDate(data.generatedAt, {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
            if (formatted) {
                time.dateTime = data.generatedAt;
                time.textContent = formatted;
                var meta = document.getElementById('roadmap-meta');
                if (meta) meta.hidden = false;
            }
        }

        if (data.unpublishedItemCount > 0) {
            var notice = document.getElementById('roadmap-unpublished');
            if (notice) {
                notice.textContent = 'Därutöver finns '
                    + (data.unpublishedItemCount === 1
                        ? '1 planerad punkt som ännu inte har publicerats som ett öppet ärende.'
                        : data.unpublishedItemCount + ' planerade punkter som ännu inte har publicerats som öppna ärenden.');
                notice.hidden = false;
            }
        }
    }

    /* ── Inaktualitetslarm ── */

    function renderStaleness(data) {
        var notice = document.getElementById('roadmap-stale');
        if (!notice) return;

        var generated = new Date(data.generatedAt);
        if (Number.isNaN(generated.getTime())) return;

        var ageHours = (Date.now() - generated.getTime()) / 3600000;
        if (ageHours <= STALE_THRESHOLD_HOURS) return;

        var formatted = formatDate(data.generatedAt, {
            year: 'numeric', month: 'long', day: 'numeric',
        });
        notice.textContent = 'Roadmapen uppdaterades senast ' + formatted
            + ' och kan vara inaktuell just nu.';
        notice.hidden = false;
    }

    /* ── Filter (version + sponsor, oberoende dimensioner, kombineras med AND) ── */

    // Numerisk-medveten sortering; fritextvärden utan inledande siffra sist
    function versionSort(a, b) {
        var aNumeric = /^\d/.test(a);
        var bNumeric = /^\d/.test(b);
        if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
        return a.localeCompare(b, 'sv', { numeric: true });
    }
    function alphaSort(a, b) {
        return a.localeCompare(b, 'sv');
    }

    var FILTER_DIMENSIONS = [
        { key: 'version', field: 'roadmapVersion', label: 'Version:', sort: versionSort },
        { key: 'sponsor', field: 'sponsor', label: 'Sponsor:', sort: alphaSort },
    ];

    var activeFilters = { version: 'alla', sponsor: 'alla' };

    function buildFilters(data) {
        FILTER_DIMENSIONS.forEach(function (dim) {
            var container = document.querySelector('.roadmap-filter[data-dimension="' + dim.key + '"]');
            if (!container) return;

            var values = [];
            data.items.forEach(function (item) {
                var value = item[dim.field];
                if (hasValue(value) && values.indexOf(value) === -1) values.push(value);
            });

            // Dölj hela filterraden om det inte finns fler än ett värde att välja mellan
            if (values.length < 2) {
                container.hidden = true;
                return;
            }
            values.sort(dim.sort);

            var label = el('span', 'filter-label', dim.label);
            label.setAttribute('aria-hidden', 'true');
            container.appendChild(label);

            ['alla'].concat(values).forEach(function (value) {
                var button = el('button', null, value === 'alla' ? 'Alla' : value);
                button.type = 'button';
                button.dataset.filterValue = value;
                button.setAttribute('aria-pressed', value === 'alla' ? 'true' : 'false');
                if (value === 'alla') button.classList.add('active');
                button.addEventListener('click', function () {
                    setFilter(dim.key, value);
                });
                container.appendChild(button);
            });

            container.hidden = false;
        });
    }

    function setFilter(dimension, value) {
        activeFilters[dimension] = value;
        applyFilters();
    }

    function applyFilters() {
        var liveRegion = document.getElementById('roadmap-filter-status');

        // Uppdatera knapparnas tillstånd per dimension
        FILTER_DIMENSIONS.forEach(function (dim) {
            var container = document.querySelector('.roadmap-filter[data-dimension="' + dim.key + '"]');
            if (!container) return;
            container.querySelectorAll('button[data-filter-value]').forEach(function (btn) {
                var isActive = btn.dataset.filterValue === activeFilters[dim.key];
                btn.setAttribute('aria-pressed', String(isActive));
                btn.classList.toggle('active', isActive);
            });
        });

        // Kort visas endast om det matchar ALLA aktiva dimensioner
        var visibleTotal = 0;
        document.querySelectorAll('.epic-card').forEach(function (card) {
            var show = FILTER_DIMENSIONS.every(function (dim) {
                var active = activeFilters[dim.key];
                return active === 'alla' || card.dataset[dim.key] === active;
            });
            card.hidden = !show;
            if (show) visibleTotal++;
        });

        // Antal per kolumn + tomtillstånd
        document.querySelectorAll('.roadmap-column').forEach(function (column) {
            if (column.hidden) return; // dold Levererat-kolumn lämnas orörd
            var visibleInColumn = column.querySelectorAll('.epic-card:not([hidden])').length;
            var count = column.querySelector('.column-count');
            var empty = column.querySelector('.column-empty');
            if (count) count.textContent = visibleInColumn;
            if (empty) empty.hidden = visibleInColumn !== 0;
        });

        // Meddela skärmläsare
        if (liveRegion) {
            var parts = [];
            FILTER_DIMENSIONS.forEach(function (dim) {
                if (activeFilters[dim.key] !== 'alla') {
                    parts.push(dim.label.replace(':', '').toLowerCase() + ' ' + activeFilters[dim.key]);
                }
            });
            liveRegion.textContent = parts.length === 0
                ? 'Visar alla ' + visibleTotal + ' epics.'
                : 'Visar ' + visibleTotal + ' epics (' + parts.join(', ') + ').';
        }
    }

    function bindCardFilterButtons() {
        // Versionsbadge och sponsor-chip på korten filtrerar också
        document.querySelectorAll('[data-filter-dimension][data-filter-value]').forEach(function (badge) {
            badge.addEventListener('click', function () {
                setFilter(this.dataset.filterDimension, this.dataset.filterValue);
            });
        });
    }

    /* ── Init ── */

    async function loadRoadmap() {
        var data;
        try {
            // no-cache = revalidera mot ETag; datan uppdateras var 6:e timme
            var response = await fetch(DATA_URL, { cache: 'no-cache' });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            data = await response.json();
        } catch (error) {
            showError();
            return;
        }

        // Sanity-check av kontraktet — okänt format behandlas som laddningsfel
        if (!data || data.schemaVersion !== 1 || !Array.isArray(data.items)) {
            showError();
            return;
        }

        var loading = document.getElementById('roadmap-loading');
        if (loading) loading.hidden = true;

        renderBoard(data);
        renderMeta(data);
        renderStaleness(data);
        buildFilters(data);
        bindCardFilterButtons();
        applyFilters();
    }

    document.addEventListener('DOMContentLoaded', loadRoadmap);
})();
