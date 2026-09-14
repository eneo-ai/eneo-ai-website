# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for Eneo.ai, a Swedish AI platform for public sector organizations. The website is built with vanilla HTML, CSS, and JavaScript, and is deployed via GitHub Pages.

## Development Commands

Since this is a static website, there are no build, lint, or test commands. The website is deployed directly from the repository via GitHub Pages workflow.

### Local Development
- Simply open `index.html` in a web browser or serve files with a local HTTP server
- Use Python: `python -m http.server 8000` or `python3 -m http.server 8000`
- Use Node.js: `npx http-server` or `npx serve`

### Deployment
- Automatic deployment via GitHub Actions workflow (`.github/workflows/static.yml`)
- Triggers on pushes to `main` branch
- Deploys entire repository to GitHub Pages

## Architecture

### File Structure
```
eneo-ai-website/
├── index.html              # Main homepage
├── om-eneo.html            # About page
├── tidslinje.html          # Timeline/history page
├── samarbetsforum.html     # Collaboration page
├── docs.html               # Documentation page
├── css/
│   ├── variables.css       # CSS custom properties and design tokens
│   ├── base.css           # Base styles and resets
│   ├── components.css     # Reusable component styles
│   ├── layout.css         # Layout and grid systems
│   └── pages/             # Page-specific styles
├── js/
│   ├── main.js            # Core functionality and mobile menu
│   └── timeline.js        # Timeline page animations
├── public/
│   └── images/            # Static assets and images
└── .github/workflows/     # GitHub Actions for deployment
```

### CSS Architecture
- **Variables-first approach**: All design tokens in `css/variables.css`
- **Modular CSS**: Organized by concerns (base, components, layout, pages)
- **Custom properties**: Extensive use of CSS variables for theming
- **Responsive design**: Mobile-first approach with breakpoints
- **Component-based**: Reusable CSS classes following BEM-like conventions

### JavaScript Architecture
- **Vanilla JavaScript**: No frameworks or build tools
- **Modular approach**: Separate files for different functionality
- **Progressive enhancement**: Works without JavaScript
- **Intersection Observer**: Used for scroll-based animations
- **Export pattern**: Functions exposed via window object for cross-file usage

## Key Components

### Navigation
- Responsive header with mobile menu toggle
- Fixed positioning with backdrop blur
- Smooth scrolling for anchor links

### Animations
- CSS transitions and transforms
- Intersection Observer for scroll-triggered animations
- Staggered entrance animations for timeline items
- Trust indicators with delayed fade-in effects

### Content Areas
- Hero sections with gradient text effects
- Trust indicators with success states
- Platform showcase with feature lists
- Three-pillar layout for principles
- Timeline items with animated cards

## Styling Conventions

### Design System
- **Colors**: Primary blue (#005293), secondary light backgrounds
- **Typography**: Inter font family with weight scale (300-700)
- **Spacing**: Container max-width 75rem, responsive padding
- **Shadows**: Layered shadow system for depth
- **Transitions**: Consistent cubic-bezier easing functions

### CSS Patterns
- Use CSS custom properties for all design tokens
- Mobile-first responsive design
- Component-based class naming
- Consistent spacing and typography scales
- Semantic HTML structure

## Content Management

### Swedish Language
- All content is in Swedish
- Semantic HTML structure for accessibility
- Proper meta tags for SEO and social sharing

### Images
- Optimized images in `public/images/`
- Lazy loading for performance
- Proper alt text for accessibility
- Favicon set with multiple sizes

### HÅRD REGEL: Delningsmetadata (Open Graph) på alla sidor
**Varje ny publik sida, nyhetsartikel eller annan HTML-fil som kan delas ska ha komplett
och korrekt metadata för delning i `<head>` innan arbetet anses klart.** Regeln gäller
utan undantag vid nya sidor, nya nyheter, kopierade sidor och vid varje ändring av titel,
beskrivning eller bild. Kontrollera alltid, även om sidan skapats från en mall – mallen
kan ha fel (det har hänt).

**Delningsbilden ska alltid vara en PNG i 1200×630 px.** Sociala plattformar (LinkedIn,
Facebook, Teams, Slack) visar inte SVG som delningsbild. Illustrationer skapas som SVG
för webbsidan, men `og:image` ska peka på en PNG-version med samma filnamn, renderad
från SVG:n med headless Chromium (Playwright, viewport 1200×630, skala 1). Saknas
PNG:n för en illustration: rendera och committa den tillsammans med sidan.

**Standard för vanliga sidor** (`og:type` `website`, sajtens gemensamma bild):

```html
<!-- OG Meta Tags -->
<meta property="og:title" content="Sidans titel - Eneo.ai" />
<meta property="og:description" content="Samma text som meta name=description" />
<meta property="og:image" content="https://eneo.ai/public/og-image.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Eneo AI" />
<meta property="og:url" content="https://eneo.ai/sidans-filnamn.html" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Eneo.ai" />
<meta property="og:locale" content="sv_SE" />
```

**Standard för nyhetsartiklar** (`og:type` `article`, artikelns egen illustration som PNG):

```html
<meta property="og:title" content="Artikelns rubrik - Nyheter - Eneo.ai" />
<meta property="og:description" content="Samma text som meta name=description" />
<meta property="og:image" content="https://eneo.ai/public/images/nyheter/illustration.png" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Samma beskrivning som bildens alt-text i artikeln" />
<meta property="og:url" content="https://eneo.ai/nyheter/YYYY-MM-DD-slug.html" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Eneo.ai" />
<meta property="og:locale" content="sv_SE" />
```

Krav på innehållet:
- `og:title` ska matcha `<title>` och `og:description` ska matcha `meta name="description"`
- `og:url` ska vara sidans absoluta adress på `https://eneo.ai/` (nyheter: `https://eneo.ai/nyheter/…`)
- `og:image` ska vara en absolut adress till en PNG som finns i repot, 1200×630, aldrig SVG
- `og:image:type`, `og:image:width`, `og:image:height` och `og:image:alt` ska alltid finnas
- Bilden ska följa sajtens grafiska profil: vanliga sidor använder `public/og-image.png`,
  nyheter använder illustrationerna i `public/images/nyheter/` (samma stil, färger och
  Eneo-logotyp som befintliga; återanvänd de generiska bilderna när det passar)
- Sidhuvudet ska även innehålla analysskriptet (`analytics.eneo.ai`) på samma sätt som övriga sidor
- Undantag: dolda sidor med `noindex`, omdirigeringssidor och presentationsläget

Kontroller som ska köras innan en sida eller nyhet rapporteras som klar:
- `grep -L "og:image" *.html nyheter/*.html` ska bara lista undantagen ovan
- `grep -l 'og:image" content="[^"]*\.svg' *.html nyheter/*.html` ska inte lista någon sida
- `grep -L "og:image:alt" $(grep -l "og:image" *.html nyheter/*.html)` ska inte lista någon sida
- Varje adress i `og:image` ska motsvara en fil som finns i repot (`public/…`)

## Webbtillgänglighet (WCAG)

All kod ska uppfylla WCAG 2.1 Level AA. Detta är ett lagkrav för offentlig sektor (DOS-lagen, Lag 2018:1937).

### Krav vid all nyutveckling
- **All kod ska vara tillgänglig** — varje ny funktion, komponent eller sida måste uppfylla WCAG 2.1 Level AA
- **Automatiserade tillgänglighetskontroller** ska genomföras vid varje ny funktion eller kodändring
- **AI-genererad kod** genomgår automatiska kontroller utefter WCAG och webbtillgänglighetsregler
- Semantisk HTML (korrekta heading-nivåer, landmarks, ARIA-attribut där det behövs)
- Tangentbordsnavigation ska fungera för alla interaktiva element
- Färgkontrast ska minst uppnå 4.5:1 (normal text) / 3:1 (stor text)
- Alla bilder och ikoner ska ha textalternativ eller `aria-hidden="true"` om dekorativa
- Animationer ska respektera `prefers-reduced-motion`
- Alla hover-effekter ska ha matchande `:focus-visible`-stilar
- Interaktiva element ska ha minst 44×44px touch-target

### Tillgänglighetsredogörelse
Webbplatsen har en publicerad tillgänglighetsredogörelse enligt DOS-lagens krav (se `tillganglighetsredogorelse.html`).

## Nyheter

Nyheter publiceras som enskilda HTML-filer i `nyheter/`-katalogen och listas på `nyheter.html`.

### HÅRD REGEL: När en ny nyhet skapas
När Claude skapar en ny nyhet måste **alla** dessa steg genomföras:
1. Skapa nyhetsartikeln som `nyheter/YYYY-MM-DD-slug.html`
2. **Varje nyhet ska ha en illustrativ bild** (SVG i `public/images/nyheter/`) som visas både i artikeln (mellan header och content) och som thumb på nyhetskortet. Bilden ska ha beskrivande `aria-label` på `<svg>` och informativ `alt` på `<img>` i artikeln (dekorativ `alt=""` på kort-thumb). Meta `og:image` i artikeln ska peka på en **PNG-version** av bilden enligt den hårda regeln om delningsmetadata ovan (aldrig SVG; rendera PNG:n om den saknas).
   - **Återanvändbara bilder:** `public/images/nyheter/version-release.svg` används för alla nyheter om nya versioner. Skapa motsvarande generiska illustrationer för andra återkommande nyhetstyper (säkerhet, community, insikter, evenemang) innan du tar till engångsbilder.
3. Lägg till ett nyhetskort på `nyheter.html` (överst i listan, som featured om det är den senaste)
4. **Uppdatera startsidans nyhetslistning** (`index.html`, sektionen "Senaste nytt") med de 3 senaste nyheterna
5. Kör tillgänglighetstest på alla ändrade filer

## Performance Considerations

- Minimal JavaScript footprint
- CSS-only animations where possible
- Optimized images and lazy loading
- Efficient CSS selectors and minimal specificity conflicts