/**
 * Versioner – utfällbar versionshistorik
 *
 * Bara den senaste versionen visas utfälld. Äldre versioner fälls ihop tills
 * användaren klickar på versionsnumret (en knapp med aria-expanded) eller
 * följer en länk direkt till versionen, t.ex. versioner.html#v1.9.0.
 * Utan JavaScript ligger alla versioner utfällda.
 */

(function () {
    'use strict';

    var releases = Array.prototype.slice.call(document.querySelectorAll('.release'));
    if (releases.length === 0) return;

    function setExpanded(release, expanded) {
        var button = release.querySelector('.ver-tag[aria-controls]');
        var body = button && document.getElementById(button.getAttribute('aria-controls'));
        if (!button || !body) return;
        button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        body.hidden = !expanded;
        release.classList.toggle('collapsed', !expanded);
    }

    function releaseFromHash() {
        var id;
        try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (e) { return null; }
        var target = id && document.getElementById(id);
        return target ? target.closest('.release') : null;
    }

    // Startläge: senaste utfälld, övriga hopfällda – utom den som adressen pekar på
    var linked = releaseFromHash();
    releases.forEach(function (release, index) {
        setExpanded(release, index === 0 || release === linked);
    });

    // Klick på versionsnumret växlar
    releases.forEach(function (release) {
        var button = release.querySelector('.ver-tag[aria-controls]');
        if (!button) return;
        button.addEventListener('click', function () {
            setExpanded(release, button.getAttribute('aria-expanded') !== 'true');
        });
    });

    // Länk till en version (ankarikonen eller extern länk) fäller ut den
    window.addEventListener('hashchange', function () {
        var release = releaseFromHash();
        if (release) setExpanded(release, true);
    });
    document.addEventListener('click', function (event) {
        var anchor = event.target.closest('a.release-anchor');
        if (!anchor) return;
        var release = anchor.closest('.release');
        if (release) setExpanded(release, true);
    });
})();
