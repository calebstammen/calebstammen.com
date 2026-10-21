# calebstammen.com (Portfolio)

Static personal portfolio for `calebstammen.com`, focused on Caleb Stammen's software engineering, applied AI,
knowledge management, cybersecurity, career, and independent work through Stammen Technology.

**Highlights**
- Personal introduction and specific professional focus areas.
- Independent business and product sections for Stammen Technology and Suitflow, described as business entities.
- Streamlined experience and education history, early coding background, and personal interests photo gallery.
- Sticky responsive navigation and a skip link for keyboard accessibility.
- Scroll-reveal animations with `prefers-reduced-motion` support.
- Email copy buttons with toast feedback.
- No framework build step: plain HTML, CSS, JS, and a small local gallery-manifest sync script.

**Homepage palette**
- Deep blue-green: `#153d4b`
- Warm off-white: `#f9f8f2`
- Pale green: `#f0f4f1`
- Text: `#20353c`
- Accent: `#0a7187`

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
