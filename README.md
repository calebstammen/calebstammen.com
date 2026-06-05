# calebstammen.com (Portfolio)

Static personal portfolio for `calebstammen.com`, focused on Caleb Stammen's software engineering, AI systems,
automation, internal tools, cybersecurity, product ownership, and Stammen Technology work.

**Highlights**
- Product-led homepage with Suitflow, Stammen Technology, operating strengths, experience, and email contact.
- Product/profile presentation for Suitflow, Atlas, Stammen Technology, internal AI work, infrastructure, and security
  work.
- Sticky nav with active-section highlighting and skip-link accessibility.
- Scroll-reveal animations with `prefers-reduced-motion` support.
- Email copy buttons with toast feedback.
- No build step: plain HTML, CSS, and JS.

**Brand palette**
- Background: `#efe6d6`
- Paper: `#fbf6ea`
- Ink: `#243232`
- Accent: `#1f7456`
- Muted line: `#d6c8ad`
- Highlight: `#d8e4dc`

**Design bans**
- No small initial-logo squares in the header.
- No metadata text pills or chips.
- No black-and-white primary palette.
- No faux browser chrome or boxed text callouts around screenshots.
- No boxed capability-card stack when structured rows read better.

**Structure**
- `index.html` - main portfolio site
- `styles.css` - global styles
- `script.js` - UI interactions for navigation, scroll state, reveal animations, parallax, and copy-email behavior
- `assets/` - images, social cards, topo overlay, favicon, and supporting media

**Local Preview**
Option 1: open `index.html` directly in a browser.

Option 2 (recommended): run a local server from the repo root:
```bash
python3 -m http.server 5173
```
Then visit `http://localhost:5173`.

**Content Updates**
- Site copy and sections: edit `index.html`.
- Photo swaps: replace files in `assets/` and update corresponding `img` tags in `index.html`.

## License
This project uses a split license:
- **Code** (HTML/CSS/JS): MIT License (see `LICENSE`).
- **Content** (site copy, images, design assets, portfolio materials): All Rights Reserved (see `LICENSE-CONTENT`).
