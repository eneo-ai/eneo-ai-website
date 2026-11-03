/* Graf över Eneos utvecklingskostnader på fragor-och-svar.html.
   Underlag: summor per månad, exkl. moms (Eneo-utvecklingskostnader-graf.html, byggd 2026-11-02). */
(function () {
    "use strict";
    const POSTS = [{"m": "2023-12", "amt": 80000.0}, {"m": "2024-01", "amt": 168000.0}, {"m": "2024-02", "amt": 248000.0}, {"m": "2024-03", "amt": 273000.0}, {"m": "2024-04", "amt": 311000.0}, {"m": "2024-05", "amt": 317000.0}, {"m": "2024-06", "amt": 717500.0}, {"m": "2024-07", "amt": 301500.0}, {"m": "2024-08", "amt": 241000.0}, {"m": "2024-09", "amt": 219707.5}, {"m": "2024-10", "amt": 130695.0}, {"m": "2024-11", "amt": 74360.0}, {"m": "2024-12", "amt": 233967.5}, {"m": "2025-01", "amt": 344232.5}, {"m": "2025-02", "amt": 244132.5}, {"m": "2025-03", "amt": 261655.0}, {"m": "2025-04", "amt": 364745.0}, {"m": "2025-05", "amt": 358950.0}, {"m": "2025-06", "amt": 216670.0}, {"m": "2025-07", "amt": 12252.5}, {"m": "2025-08", "amt": 287172.5}, {"m": "2025-09", "amt": 285877.5}, {"m": "2025-10", "amt": 296172.5}, {"m": "2025-11", "amt": 202800.0}, {"m": "2025-12", "amt": 161395.0}, {"m": "2026-01", "amt": 210405.0}, {"m": "2026-02", "amt": 203645.0}, {"m": "2026-03", "amt": 212517.5}, {"m": "2026-04", "amt": 135200.0}, {"m": "2026-05", "amt": 128440.0}, {"m": "2026-06", "amt": 225192.5}, {"m": "2026-07", "amt": 116610.0}, {"m": "2026-08", "amt": 165197.5}];

    const root = document.getElementById("kostnad-graf");
    if (!root) return;
    const q = sel => root.querySelector(sel);

    const kr = v => Math.round(v).toLocaleString("sv-SE") + " kr";
    const MON = ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];
    const MONL = ["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"];
    const mLong = m => MONL[+m.slice(5) - 1] + " " + m.slice(0, 4);
    const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
    const nextM = m => { let y = +m.slice(0, 4), n = +m.slice(5) + 1; if (n > 12) { n = 1; y++; } return y + "-" + String(n).padStart(2, "0"); };

    const sum = ps => ps.reduce((a, p) => a + p.amt, 0);
    const total = sum(POSTS);
    const first = POSTS[0].m, last = POSTS[POSTS.length - 1].m;
    const MONTHS = []; for (let m = first; m <= last; m = nextM(m)) MONTHS.push(m);
    const YEARS = [...new Set(MONTHS.map(m => m.slice(0, 4)))];
    const postsOf = k => POSTS.filter(p => k.length === 4 ? p.m.startsWith(k) : p.m === k);
    const monthsIn = y => MONTHS.filter(m => m.startsWith(y));
    const span = y => { const ms = monthsIn(y); return ms.length === 12 ? "helår" : ms.length === 1 ? MON[+ms[0].slice(5) - 1] : MON[+ms[0].slice(5) - 1] + "–" + MON[+ms[ms.length - 1].slice(5) - 1]; };
    const keyLabel = k => k.length === 4 ? k : cap1(mLong(k));

    // ---------- nyckeltal ----------
    q(".kg-total").textContent = kr(total);
    q(".kg-lead").textContent = `från ${mLong(first)} till ${mLong(last)}`;
    q(".kg-facts").innerHTML = [
        [kr(total / MONTHS.length), "i snitt per månad"],
        [MONTHS.length + " månader", "från första till sista posten"]
    ].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("");

    // ---------- tabell (samma siffror i textform) ----------
    q(".kg-table tbody").innerHTML = MONTHS.map(m => {
        return `<tr><th scope="row">${cap1(mLong(m))}</th><td>${kr(sum(postsOf(m)))}</td></tr>`;
    }).join("");
    q(".kg-table thead tr").innerHTML = `<th scope="col">Månad</th><th scope="col">Kostnad</th>`;
    q(".kg-table tfoot tr").innerHTML = `<th scope="row">Summa</th><td>${kr(total)}</td>`;

    // ---------- diagram ----------
    const state = { view: "y", year: "" };
    const yearSel = q(".kg-year select");
    YEARS.forEach(y => yearSel.insertAdjacentHTML("beforeend", `<option>${y}</option>`));

    function niceStep(max) {
        const raw = max / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
        return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
    }
    const axisLbl = v => v === 0 ? "0" : v >= 1e6 ? (v / 1e6).toLocaleString("sv-SE") + " mkr" : (v / 1e3).toLocaleString("sv-SE") + " tkr";
    const capLbl = v => v >= 1e6 ? (v / 1e6).toLocaleString("sv-SE", { maximumFractionDigits: 2 }) + " mkr" : Math.round(v / 1e3).toLocaleString("sv-SE") + " tkr";

    function render() {
        const yearly = state.view === "y";
        const keys = yearly ? YEARS : MONTHS.filter(m => !state.year || m.startsWith(state.year));
        const vals = keys.map(k => sum(postsOf(k)));
        const step = niceStep(Math.max(...vals)), top = Math.ceil(Math.max(...vals) / step) * step;
        const ticks = []; for (let v = 0; v <= top + 1; v += step) ticks.push(v);
        const chart = q(".kg-chart");
        chart.classList.toggle("is-monthly", !yearly);
        q(".kg-hint").textContent = yearly ? "Välj ett år för att se det månad för månad." : "Håll muspekaren över en stapel för att se beloppet.";
        q(".kg-grid").innerHTML = ticks.slice(1).map(v => `<div class="kg-gl" style="bottom:${v / top * 100}%"></div>`).join("");
        q(".kg-yax").innerHTML = ticks.map(v => `<span style="bottom:${v / top * 100}%">${axisLbl(v)}</span>`).join("");
        // Årsstaplar är knappar (klick visar året per månad). Månadsstaplar är inte
        // interaktiva – siffrorna finns i tabellen under diagrammet.
        q(".kg-cols").innerHTML = keys.map((k, i) => {
            const v = vals[i], h = v / top * 100;
            const bar = v ? `<span class="kg-bar" style="height:${h}%"></span>` : "";
            return yearly
                ? `<button type="button" class="kg-col" data-k="${k}" aria-label="${k}: ${kr(v)}. Visa månad för månad">${bar}<span class="kg-cap" style="bottom:${h}%">${capLbl(v)}</span></button>`
                : `<div class="kg-col" data-k="${k}">${bar}</div>`;
        }).join("");
        q(".kg-xax").innerHTML = keys.map((k, i) => yearly
            ? `<div><span class="kg-yr">${k}</span><span class="kg-sp">${span(k)}</span></div>`
            : `<div><span class="kg-mn">${MON[+k.slice(5) - 1]}</span><span class="kg-yr">${(k.endsWith("-01") || i === 0) ? k.slice(0, 4) : "&nbsp;"}</span></div>`).join("");
    }

    function tipHtml(k) {
        const ps = postsOf(k), v = sum(ps);
        return `<b>${keyLabel(k)}</b><br>${v ? kr(v) : "Inga utvecklingskostnader"}`
            + (k.length === 4 ? `<br>Snitt ${kr(v / monthsIn(k).length)} per månad` : "");
    }

    function setView(v) {
        state.view = v;
        root.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === v));
        q(".kg-year").hidden = v !== "m";
        render();
    }
    root.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => setView(b.dataset.view)));
    yearSel.addEventListener("change", e => { state.year = e.target.value; render(); });
    q(".kg-cols").addEventListener("click", e => {
        const c = e.target.closest("button.kg-col"); if (!c) return;
        state.year = c.dataset.k; yearSel.value = state.year; setView("m");
        q('[data-view="m"]').focus();
    });

    const tip = q(".kg-tip");
    function showTip(el, x, y) {
        tip.innerHTML = tipHtml(el.dataset.k); tip.hidden = false;
        const r = tip.getBoundingClientRect();
        tip.style.left = Math.max(8, Math.min(x + 14, innerWidth - r.width - 8)) + "px";
        tip.style.top = Math.max(8, y - r.height - 12) + "px";
    }
    const hideTip = () => { tip.hidden = true; };
    const cols = q(".kg-cols");
    cols.addEventListener("mousemove", e => { const c = e.target.closest(".kg-col"); c ? showTip(c, e.clientX, e.clientY) : hideTip(); });
    cols.addEventListener("mouseleave", hideTip);
    cols.addEventListener("focusin", e => { const c = e.target.closest(".kg-col"); if (c) { const r = c.getBoundingClientRect(); showTip(c, r.left + r.width / 2, r.top + 40); } });
    cols.addEventListener("focusout", hideTip);
    document.addEventListener("keydown", e => { if (e.key === "Escape") hideTip(); });
    addEventListener("scroll", hideTip, { passive: true });

    root.hidden = false;
    render();
})();
