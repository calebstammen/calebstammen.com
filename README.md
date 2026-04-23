# calebstammen.com (Portfolio)

Static portfolio and resume site for `calebstammen.com`, focused on Caleb Stammen's software engineering, AI systems,
automation, internal tools, cybersecurity, and technical product work.

**Highlights**
- Jobs-first homepage with selected work, experience, technical strengths, approach, about, and contact sections.
- Project/case-study presentation for Suitflow, GM Minutes AI, Pax Machine Works, and Stammen Technology.
- Sticky nav with active-section highlighting and skip-link accessibility.
- Scroll-reveal animations with `prefers-reduced-motion` support.
- Email copy buttons with toast feedback.
- Dedicated resume page with optional PDF download.
- No build step: plain HTML, CSS, and JS.

**Structure**
- `index.html` - main portfolio site
- `resume/index.html` - resume page
- `styles.css` - global styles and resume styling
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
- Resume content: edit `resume/index.html`.
- Photo swaps: replace files in `assets/` and update corresponding `img` tags in `index.html`.
- Resume PDF download: place the file at `resume/Caleb Stammen Resume.pdf` and keep the download link in
  `resume/index.html`.

## License
This project uses a split license:
- **Code** (HTML/CSS/JS): MIT License (see `LICENSE`).
- **Content** (site copy, images, design assets, resume materials): All Rights Reserved (see `LICENSE-CONTENT`).
