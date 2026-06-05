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
- No framework build step: plain HTML, CSS, JS, and a small local gallery-manifest sync script.

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
Run a local server from the repo root:
```bash
python3 -m http.server 5173
```
Then visit `http://localhost:5173`.

**Content Updates**
- Site copy and sections: edit `index.html`.
- Interest gallery photos: add or remove image files in `assets/interests/`, then run:
```bash
npm run sync:interests
```
- While actively adding/removing interest photos, keep this running in a second terminal so `assets/interests/manifest.json`
  updates automatically:
```bash
npm run watch:interests
```

## License
This project uses a split license:
- **Code** (HTML/CSS/JS): MIT License (see `LICENSE`).
- **Content** (site copy, images, design assets, portfolio materials): All Rights Reserved (see `LICENSE-CONTENT`).
