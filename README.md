# Portfolio Site (Hugo + PaperMod)

This project now mirrors the structure and design approach of the reference repo using Hugo and PaperMod.

## Local run

1. Install Hugo extended.
2. Run:

```bash
hugo server -D
```

3. Open `http://localhost:1313`.

## Deploy on GitHub Pages

This repo includes a GitHub Actions workflow at:

- `.github/workflows/hugo.yaml`

It deploys automatically on pushes to `main`.

## Personal data to update

- `hugo.toml` (title, social links, email, intro)
- `content/about.md` (bio, projects, achievements)
- `content/blog/*`, `content/musings/*`, `content/vim_stuff/*` (replace with your own writing)
- Optional integrations in `layouts/partials/*` (newsletter, giscus, analytics)
