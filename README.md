# calebstammen.com (Portfolio)

Static portfolio site for `calebstammen.com`, designed with a \"Topo + Alpine\" visual theme.

## Structure
- `index.html` - homepage
- `resume/index.html` - HTML resume (print-friendly)
- `assets/` - SVG assets (topo overlay + favicon)

## Local Preview
Option 1: open `index.html` directly in a browser.

Option 2: run a local web server from the repo root:
```bash
python3 -m http.server 5173
```
Then visit `http://localhost:5173`.

## Deployment (GitHub Pages)
1. Push `main` to GitHub.
2. In GitHub: Settings -> Pages
3. Build and deployment:
   - Source: "Deploy from a branch"
   - Branch: `main` / `/(root)`
4. Custom domain: `calebstammen.com`
5. After DNS is set and propagates: enable "Enforce HTTPS".

This repo includes:
- `CNAME` (custom domain)
- `.nojekyll` (disable Jekyll processing)
- `404.html` for SPA-like behavior on GitHub Pages

## DNS (DreamHost)
Create these records in DreamHost DNS for `calebstammen.com`:

### Apex (`calebstammen.com`)
`A` records:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

`AAAA` records:
- `2606:50c0:8000::153`
- `2606:50c0:8001::153`
- `2606:50c0:8002::153`
- `2606:50c0:8003::153`

### `www`
`CNAME` record:
- `www` -> `calebstammen.github.io`

### Redirect
Redirect `www.calebstammen.com` -> `https://calebstammen.com`

## Resume PDF (Future)
The resume is HTML-only for now. When you have an official PDF:
1. Add it to `assets/caleb-stammen-resume.pdf`
2. Enable the "Download PDF" button on `resume/index.html`
