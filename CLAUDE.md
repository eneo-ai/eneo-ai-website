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

## Performance Considerations

- Minimal JavaScript footprint
- CSS-only animations where possible
- Optimized images and lazy loading
- Efficient CSS selectors and minimal specificity conflicts