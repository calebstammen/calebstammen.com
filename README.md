# calebstammen.com (Portfolio)

Static portfolio + resume site for `calebstammen.com`, built as a single-page with interactive travel maps and story overlays.

**Highlights**
- Single-page layout with clear sections (About, Focus, Approach, Work, Experience, Education, Travel, Contact).
- Sticky nav with active-section highlighting and skip-link accessibility.
- Scroll-reveal animations with `prefers-reduced-motion` support.
- Email copy buttons with toast feedback.
- Interactive travel maps (US + World) with zoom, expand overlay, and story modal for visited regions.
- Dedicated resume page with print-friendly layout and optional PDF download.
- No build step: plain HTML, CSS, and JS.

**Structure**
- `index.html` - main site
- `resume/index.html` - resume page
- `styles.css` - global styles and resume styling
- `script.js` - UI interactions, map rendering, travel stories
- `assets/` - images, topo overlays, favicon
- `assets/maps/` - local TopoJSON for US + world maps

**Local Preview**
Option 1: open `index.html` directly in a browser (map data may fail to load due to file protocol restrictions).

Option 2 (recommended): run a local server from the repo root:
```bash
python3 -m http.server 5173
```
Then visit `http://localhost:5173`.

**Content Updates**
- Site copy and sections: edit `index.html`.
- Resume content: edit `resume/index.html`.
- Travel map data:
  - Update `visitedStatesInput` and `visitedCountriesInput` in `script.js`.
  - Add/adjust stories in `travelStories` in `script.js`.
  - Add images under `assets/travel/` and reference them in the stories.
- Photo swaps: replace files in `assets/` and update corresponding `img` tags in `index.html`.
- Resume PDF download: place the file at `resume/Caleb Stammen Resume.pdf` and keep the download link in `resume/index.html`.

## License
This project uses a split license:
- **Code** (HTML/CSS/JS): MIT License (see `LICENSE`).
- **Content** (site copy, images, design assets, resume materials): All Rights Reserved (see `LICENSE-CONTENT`).
