// Presentationsläge för samarbete-presentation.html
// Hanterar bildbyte (tangentbord, knappar, svep), helskärm, tema, hjälpdialog
// och adress per bild (#3 osv). Ingen extern kod, inga byggsteg.

(function () {
    'use strict';

    var slides = Array.prototype.slice.call(document.querySelectorAll('.deck .slide'));
    if (!slides.length) return;

    var prevBtn = document.getElementById('deck-prev-btn');
    var nextBtn = document.getElementById('deck-next-btn');
    var counter = document.getElementById('deck-counter');
    var status = document.getElementById('deck-status');
    var progressBar = document.getElementById('deck-progress-bar');
    var fullscreenBtn = document.getElementById('deck-fullscreen-btn');
    var themeBtn = document.getElementById('deck-theme-btn');
    var helpBtn = document.getElementById('deck-help-btn');
    var helpDialog = document.getElementById('deck-help');

    var total = slides.length;
    var current = -1;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── Bildbyte ─────────────────────────────────────────────

    function slideTitle(slide) {
        var heading = slide.querySelector('h1, h2');
        return heading ? heading.textContent.trim().replace(/\s+/g, ' ') : '';
    }

    function goTo(index, opts) {
        opts = opts || {};
        index = Math.max(0, Math.min(total - 1, index));
        if (index === current) return;

        if (current >= 0) {
            slides[current].hidden = true;
            slides[current].classList.remove('is-entering');
        }

        current = index;
        var slide = slides[current];
        slide.hidden = false;
        slide.scrollTop = 0;
        if (!reducedMotion.matches) {
            // Starta om inträdesanimationen
            slide.classList.remove('is-entering');
            void slide.offsetWidth;
            slide.classList.add('is-entering');
        }

        counter.textContent = (current + 1) + ' / ' + total;
        progressBar.style.width = ((current + 1) / total * 100) + '%';
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;

        if (status) {
            status.textContent = 'Bild ' + (current + 1) + ' av ' + total + ': ' + slideTitle(slide);
        }

        var hash = '#' + (current + 1);
        if (window.location.hash !== hash) {
            if (opts.replace) {
                history.replaceState(null, '', hash);
            } else {
                history.pushState(null, '', hash);
            }
        }

        // Flytta fokus till bilden så att skärmläsare och tangentbord följer med,
        // men inte om fokus ligger i kontrollerna (då stannar det där).
        if (opts.focus !== false && !document.getElementById('deck-controls').contains(document.activeElement)) {
            slide.focus({ preventScroll: true });
        }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function indexFromHash() {
        var m = /^#(?:slide-)?(\d+)$/.exec(window.location.hash);
        if (!m) return 0;
        var n = parseInt(m[1], 10);
        if (isNaN(n) || n < 1) return 0;
        return Math.min(total, n) - 1;
    }

    // ── Helskärm ─────────────────────────────────────────────

    var fsSupported = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);

    function isFullscreen() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function toggleFullscreen() {
        if (!fsSupported) return;
        var root = document.documentElement;
        if (isFullscreen()) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else {
            (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
        }
    }

    function updateFullscreenBtn() {
        if (!fullscreenBtn) return;
        var on = isFullscreen();
        fullscreenBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        fullscreenBtn.setAttribute('aria-label', on ? 'Avsluta helskärm' : 'Helskärm');
    }

    if (fullscreenBtn) {
        if (!fsSupported) {
            fullscreenBtn.hidden = true;
        } else {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
            document.addEventListener('fullscreenchange', updateFullscreenBtn);
            document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);
        }
    }

    // ── Tema (delar nyckel med resten av webbplatsen) ────────

    var sunIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    var moonIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    function currentThemeIsDark() {
        var theme = document.documentElement.getAttribute('data-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return theme === 'dark' || (!theme && prefersDark);
    }

    function updateThemeBtn() {
        if (!themeBtn) return;
        var dark = currentThemeIsDark();
        themeBtn.setAttribute('aria-label', dark ? 'Byt till ljust tema' : 'Byt till mörkt tema');
        themeBtn.innerHTML = dark ? sunIcon : moonIcon;
    }

    function toggleTheme() {
        var nextTheme = currentThemeIsDark() ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        try { localStorage.setItem('theme', nextTheme); } catch (e) { /* ignorera */ }
        updateThemeBtn();
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
        updateThemeBtn();
    }

    // ── Hjälpdialog ──────────────────────────────────────────

    var dialogSupported = helpDialog && typeof helpDialog.showModal === 'function';

    function openHelp() {
        if (!dialogSupported || helpDialog.open) return;
        helpDialog.showModal();
    }

    if (helpBtn) {
        if (dialogSupported) {
            helpBtn.addEventListener('click', openHelp);
            helpDialog.addEventListener('close', function () { helpBtn.focus(); });
            // Klick på bakgrunden stänger dialogen
            helpDialog.addEventListener('click', function (e) {
                if (e.target === helpDialog) helpDialog.close();
            });
        } else {
            helpBtn.hidden = true;
        }
    }

    // ── Knappar ──────────────────────────────────────────────

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // ── Tangentbord ──────────────────────────────────────────

    document.addEventListener('keydown', function (e) {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
        if (helpDialog && helpDialog.open) return;

        var target = e.target;
        var tag = target && target.tagName;
        var onControl = tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                next();
                break;
            case ' ':
                // Mellanslag på en knapp eller länk ska aktivera den, inte byta bild
                if (onControl) return;
                e.preventDefault();
                if (e.shiftKey) { prev(); } else { next(); }
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                prev();
                break;
            case 'Home':
                e.preventDefault();
                goTo(0);
                break;
            case 'End':
                e.preventDefault();
                goTo(total - 1);
                break;
            case 'f':
            case 'F':
                if (onControl) return;
                e.preventDefault();
                toggleFullscreen();
                break;
            case 't':
            case 'T':
                if (onControl) return;
                e.preventDefault();
                toggleTheme();
                break;
            case '?':
                e.preventDefault();
                openHelp();
                break;
        }
    });

    // ── Svep på pekskärm ─────────────────────────────────────

    var touchStartX = null;
    var touchStartY = null;
    document.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        touchStartX = touchStartY = null;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0) { next(); } else { prev(); }
        }
    }, { passive: true });

    // ── Adress per bild ──────────────────────────────────────

    window.addEventListener('popstate', function () {
        goTo(indexFromHash(), { replace: true });
    });
    window.addEventListener('hashchange', function () {
        goTo(indexFromHash(), { replace: true });
    });

    // ── Start ────────────────────────────────────────────────

    slides.forEach(function (s) { s.hidden = true; });
    goTo(indexFromHash(), { replace: true, focus: false });
})();
