# Claude Code Learning Journey

## Project Overview
Personal learning progress landing page for Artem — tracking a 20-hour Claude Code mastery journey from beginner to pro.

## Stack
- **Vanilla HTML/CSS/JS** — no frameworks, no build tools
- **Deployed via GitHub Pages** from the `main` branch
- Single-page app: `index.html`, `styles.css`, `script.js`, `assets/`

## Design System

### CSS Variables (defined in `:root`)
```css
--color-bg: #0a0a0a
--color-surface: #111111
--color-border: #1e1e1e
--color-text: #e8e8e8
--color-muted: #555555
--color-accent: #f5a623        /* electric amber — the ONE accent */
--font-display: 'Bebas Neue'   /* condensed sans for headings */
--font-body: 'IBM Plex Mono'   /* monospace for data/metrics */
--spacing-unit: 8px
```

### Conventions
- **BEM-like class naming**: `.block__element--modifier`
- **Mobile-first**: base styles for mobile, `min-width` breakpoints for desktop
- **Semantic HTML**: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`
- **No inline styles** — all styling via CSS variables and classes
- **Dark theme by default** — no light mode toggle needed

## Skill Reference
This project uses the `frontend-design` skill for all significant UI work.

**Design direction**: editorial/magazine meets developer tool
- Monochromatic base (#0a0a0a) with ONE sharp accent (electric amber `#f5a623`)
- Typography: Bebas Neue (display) + IBM Plex Mono (body/data)
- Motion: staggered fade-in on load, smooth transitions
- Layout: asymmetric, generous whitespace, editorial feel
- NO purple gradients, NO Inter font, NO generic AI aesthetics

## Deploying to GitHub Pages
1. Push code to the `main` branch on GitHub
2. Go to repo **Settings → Pages**
3. Under "Source", select **Deploy from a branch**
4. Choose `main` branch, `/ (root)` folder
5. Click **Save** — site will be live at `https://<username>.github.io/<repo-name>/`

To update: just push to `main` — GitHub Pages auto-deploys on every push.

## File Structure
```
/
├── index.html       # Main HTML (semantic, single page)
├── styles.css       # All styles (CSS variables, BEM, mobile-first)
├── script.js        # Accordion, progress tracking, animations
├── assets/          # Images, icons (if any)
├── .gitignore
└── CLAUDE.md        # This file
```
