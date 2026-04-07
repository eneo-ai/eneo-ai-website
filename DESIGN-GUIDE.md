# Eneo AI - Design Guide & Grafisk Profil

---

## 1. Varumarke & Logotyp

### Logotyp
Eneo AI:s logotyp bestar av tva delar:
- **Ikon**: En geometrisk, vinkelfomad symbol i **Eneo Blue** (`#055594`) — inspirerad av cirkular rorelse och AI-precision.
- **Ordmarke**: "eneo" i svart (`#000000`) med geometriska, moderna bokstavsformer. Det lilla "e" i eneo speglar ikonens design.

### Logotypfiler
| Format | Fil | Anvandning |
|--------|-----|------------|
| SVG | `images/Eneo-logo-svg.svg` | Webb, skalbar |
| PNG | `public/logo-eneo.png` | Fallback, sociala medier |
| Favicon | `public/favicon-32x32.png` | Webblasarflik |
| Apple Touch | `public/apple-touch-icon.png` | iOS bokmärke |

### Logotypregler
- **Minsta storlek**: 2.5rem hojd (40px)
- **Frizon**: Minst logotypens hojd runt om pa alla sidor
- **Bakgrund**: Anvand alltid pa ljus/vit bakgrund
- **Forbjudet**: Rotera inte, stretcha inte, ändra inte farger

---

## 2. Farger

### Primarfärger

| Namn | HEX | RGB | Anvandning |
|------|-----|-----|------------|
| **Eneo Blue** | `#005293` | 0, 82, 147 | Primarfärg, knappar, lankar, rubriker |
| **Eneo Blue Light** | `#0074cc` | 0, 116, 204 | Gradienter, hover-states, accenter |
| **Logo Blue** | `#055594` | 5, 85, 148 | Logotyp, varumärkesikon |

### Neutrala färger

| Namn | HEX | RGB | Anvandning |
|------|-----|-----|------------|
| **Foreground** | `#2d3748` | 45, 55, 72 | Brodtext, rubriker |
| **Muted Text** | `#4a5568` | 74, 85, 104 | Sekundär text, beskrivningar |
| **Border** | `#e2e8f0` | 226, 232, 240 | Ramar, avdelare |
| **Accent** | `#f1f5f9` | 241, 245, 249 | Bakgrundsaccenter |
| **Muted BG** | `#f8f9fa` | 248, 249, 250 | Sektionsbakgrunder |
| **Secondary BG** | `#fbfcfd` | 251, 252, 253 | Subtila bakgrunder |
| **White** | `#ffffff` | 255, 255, 255 | Huvudbakgrund, text pa mork bg |
| **Black** | `#000000` | 0, 0, 0 | Logotyp ordmarke |

### Funktionsfärger

| Namn | HEX | Anvandning |
|------|-----|------------|
| **Success** | `#22c55e` | Framgangsmeddelanden, checkmarkeringar |
| **Success Dark** | `#16a34a` | Gradienter, hover pa grona element |
| **Purple Accent** | `#8b5cf6` | Utbildningsinnehall, specialaccenter |

### Gradienter

```css
/* Primargradient — knappar, CTA, rubriker */
linear-gradient(to right, #005293, #0074cc)

/* Primargradient diagonal — ikoner, dekorativa element */
linear-gradient(135deg, #005293, #0074cc)

/* Subtil bakgrundsgradient — hero-sektioner */
linear-gradient(135deg, rgba(0, 82, 147, 0.05) 0%, #f1f5f9 50%, #ffffff 100%)

/* Kortbakgrund — nordic cards */
linear-gradient(145deg, #ffffff, #f1f5f9)
```

---

## 3. Typografi

### Typsnitt
- **Primärt**: **Inter** (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Kod**: Monaco, Menlo, Ubuntu Mono, monospace

### Teckenvikter

| Vikt | Varde | Anvandning |
|------|-------|------------|
| Light | 300 | Dekorativ text, stor displaytext |
| Regular | 400 | Brodtext |
| Medium | 500 | Mellantitlar, betoning |
| Semibold | 600 | Knappar, underrubriker, navigation |
| Bold | 700 | Huvudrubriker, stark betoning |

### Textstorlekar (responsiva med clamp)

| Element | Storlek | Vikt | Radavstand |
|---------|---------|------|------------|
| **Hero H1** | `clamp(2rem, 8vw, 4.5rem)` | 700 | 1.2 |
| **Page H1** | `clamp(2.5rem, 6vw, 4rem)` | 700 | 1.2 |
| **Section H2** | `clamp(1.875rem, 4vw, 2.5rem)` | 700 | 1.2 |
| **H3** | ~1.5rem | 600 | 1.3 |
| **Body Large** | 1.25rem | 400 | 1.7 |
| **Body** | 1.125rem | 400 | 1.6 |
| **Small** | 0.875rem–1rem | 400/500 | 1.5 |
| **Knapptext** | 1.25rem | 600 | — |

### Teckenavstand

| Kontext | Varde |
|---------|-------|
| Rubriker | -0.025em |
| Brodtext | 0 (normal) |
| Versaler / taggar | 0.025em–0.05em |

### Gradienttext
Rubriker kan anvanda gradienttext for att framhava nyckelord:
```css
background: linear-gradient(135deg, #005293, #0074cc);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 4. Layout & Spacing

### Container
- **Max bredd**: 75rem (1200px)
- **Padding**: `clamp(1.25rem, 5vw, 3rem)` — responsiv

### Breakpoints

| Namn | Bredd | Beskrivning |
|------|-------|-------------|
| Mobile SM | ≤ 480px | Liten mobil |
| Mobile LG | ≤ 640px | Stor mobil |
| Tablet | ≤ 767px | Surfplatta |
| Desktop | ≥ 768px | Desktop start |
| Desktop LG | ≥ 1024px | Stor desktop |
| Desktop XL | ≥ 1200px | Extra stor desktop |

### Spacing-skala
Anvand konsekvent: `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `2.5rem`, `3rem`, `4rem`, `6rem`

### Sektionspadding
- **Standard sektion**: 6rem vertikalt (4rem pa mobil)
- **Hero-sektion**: 13–14rem topp, 8–10rem botten
- **Undersida hero**: `calc(var(--header-height) + 4rem)` topp

### Border Radius

| Anvandning | Varde |
|------------|-------|
| Standard | 0.5rem |
| Kort | 0.75rem–1rem |
| Extra rundad | 1.5rem |
| Pill-knapp | 2rem |
| Cirkel | 50% |

---

## 5. Komponenter

### Knappar

**Primar knapp** (`btn-primary`)
- Bakgrund: `linear-gradient(to right, #005293, #0074cc)`
- Text: Vit, 1.25rem, semibold (600)
- Padding: 1.5rem 3rem
- Border radius: 1rem
- Hover: Lyft (-2px), forstärkt skugga (`--shadow-primary-hover`)

**Outline-knapp** (`btn-outline`)
- Bakgrund: `rgba(255, 255, 255, 0.5)` med `backdrop-filter: blur(4px)`
- Kant: 2px solid `rgba(45, 55, 72, 0.2)`
- Text: Foreground, 1.25rem, semibold (600)
- Padding: 1.5rem 3rem
- Hover: Primar bakgrundsfärg

### Kort

**Nordic Card**
- Bakgrund: `linear-gradient(145deg, #ffffff, #f1f5f9)`
- Kant: 1px solid `var(--border)`
- Skugga: `var(--shadow-sm)`
- Border radius: 0.5rem
- Hover: Lyft (-1px), forstärkt skugga

**Feature Card / Advantage Card**
- Bakgrund: Vit
- Kant: 1px solid `#e2e8f0`
- Border radius: 1rem
- Padding: 2rem
- Ikon: 4rem × 4rem med gradientbakgrund
- Hover: Lyft (-2px till -6px), accentbar (3px gradient) langst upp

**Pillar Card**
- Padding: 2rem
- Ikon: 4rem × 4rem, bakgrund `rgba(0, 82, 147, 0.08)`
- Hover: Lyft (-6px), forstärkt skugga

### Trust Indicators
- Bakgrund: `rgba(255, 255, 255, 0.9)` med `backdrop-filter: blur(8px)`
- Ikoner: 3–3.5rem cirklar med success/primargradienter
- Accentbar (3px) langst upp

### Navigation
- **Desktop**: Horisontell, centrerad med flex
- **Mobil**: Hamburger-meny med dropdown
- **Aktiv state**: Färgändring + bakgrundsmarkering + understrykningsanimation
- **Header**: `backdrop-filter: blur(16px)` for glaseffekt

---

## 6. Skuggor

| Namn | Varde | Anvandning |
|------|-------|------------|
| **SM** | `0 1px 3px rgba(0,0,0,0.05)` | Kort i viloläge |
| **MD** | `0 4px 12px rgba(0,0,0,0.08)` | Hover, upphojda element |
| **LG** | `0 10px 25px rgba(0,0,0,0.1)` | Modaler, framhävda kort |
| **XL** | `0 25px 50px -12px rgba(0,0,0,0.25)` | Hero-element |
| **Primary** | `0 25px 50px -12px rgba(0,82,147,0.25)` | CTA-knappar |
| **Primary Hover** | `0 20px 40px -12px rgba(0,82,147,0.3)` | Knapp-hover |

---

## 7. Animationer & Overgångar

### Transition-tidsfunktioner

| Namn | Varde | Anvandning |
|------|-------|------------|
| Fast | `0.15s cubic-bezier(0.4, 0, 0.2, 1)` | Hover, fokus |
| Normal | `0.2s ease` | Enklare overgångar |
| Smooth | `0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Mjuka animationer |
| Entrance | `0.6s cubic-bezier(0.4, 0, 0.2, 1)` | Ingangsanimationer |

### Hover-effekter
- **Kort**: `translateY(-2px)` till `translateY(-6px)` + forstärkt skugga
- **Knappar**: Skuggforstärkning + lyft
- **Lankar**: Färgändring + understrykningsexpansion
- **Ikoner**: `scale(1.05)` till `scale(1.1)`, ibland rotation (5deg)
- **Bilder**: `scale(1.02)` till `scale(1.05)`

### Ingangsanimationer
- **Fade In Up**: translateY(20–30px) → 0, opacity 0 → 1, 0.6s
- **Fade In Scale**: scale(0.8) → 1, opacity 0 → 1, 0.6s
- **Slide In Up**: translateY(30px) → 0, 0.8s med staggered delays (0.2s per element)
- **Pulse**: Opacity 1 → 0.5 → 1, 2s infinite (for trust badges)

### Tillgänglighet
Alla animationer respekterar `prefers-reduced-motion`.

---

## 8. Visuella Effekter

### Glasmorfism (Backdrop Filter)
- **Header**: `blur(16px)` — semi-transparent navigation
- **Mobil nav**: `blur(16px)`
- **Kort/Knappar**: `blur(4px)` till `blur(8px)`
- **Trust indicators**: `blur(8px)`

### Dekorativa Element
- **Hero-sektioner**: Suddiga cirklar (16rem × 16rem) som pseudo-element (`::before`, `::after`)
- **Sektionsavdelare**: Gradientkanter med transparens
- **Timeline**: 1.5px gradientlinje med glow-effekt

---

## 9. Tillgänglighet

### Fokus-state
```css
*:focus-visible {
    outline: 2px solid #005293;
    outline-offset: 2px;
    border-radius: 0.5rem;
}
```

### Textmarkering
```css
::selection {
    background-color: rgba(0, 82, 147, 0.15);
    color: #005293;
}
```

### Riktlinjer
- Alla interaktiva element har synliga fokus-states
- Fargkontrast foljer WCAG-riktlinjer (vit text pa primar bakgrund)
- Animationer respekterar `prefers-reduced-motion`
- Semantisk HTML med tydlig hierarki

---

## 10. Grid & Layoutmonster

### Kort-grid
```css
/* Responsivt auto-grid */
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
/* Storre kort */
grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
```

Kolumner: 1 (mobil) → 2 (tablet) → 3–4 (desktop)

### Statistik-grid
4 kolumner → 2 (tablet) → 1 (mobil)

### Timeline
- Centerlinje pa 50%
- Alternerande vanster/hoger: `:nth-child(even) { flex-direction: row-reverse }`
- Markerare med pulsande animationer

---

## 11. Designprinciper

### Nordisk Minimalism
Ren, luftig och professionell design med mycket whitespace och subtila gradienteffekter. Inget overflodigt — varje element har ett syfte.

### Lagrad Djupkansla
Skuggor, glasmorfism och subtila gradienter skapar djup utan att vara tungrodda. Kort "svävar" med mjuka skuggor och lyfts ytterligare vid interaktion.

### Responsiv Typografi
All text skalar flytande med `clamp()` for en sömlos upplevelse fran mobil till desktop. Inga harda breakpoints for typografi.

### Progressiv Interaktivitet
Hover-effekter avslöjar ytterligare information och skapar en kansla av responsivitet. Staggered ingangsanimationer ger en polerad kansla.

### Ljust Tema
Hemsidan anvander uteslutande ljust tema med vit bakgrund som bas. Fargpaletten ar noggrant balanserad for att vara behaglig for ogonen.

---

## 12. Fil- & CSS-struktur

```
css/
  variables.css     — Design tokens (färger, spacing, skuggor, etc.)
  base.css          — Bas-stilar (reset, typografi, utility-klasser)
  components.css    — Ateranvandbara komponenter (knappar, kort, etc.)
  layout.css        — Header, footer, navigation
  pages/            — Sidspecifika stilar
images/
  Eneo-logo-svg.svg — Vektorlogotyp
public/
  logo-eneo.png     — PNG-logotyp
  favicon-*.png     — Favicons
  apple-touch-icon.png
```

---

*Senast uppdaterad: April 2026*
