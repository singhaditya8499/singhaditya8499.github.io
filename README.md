# Aditya Singh Portfolio (Hugo + PaperMod)

This repository is now structured as a **Hugo** site using the **PaperMod** theme, with:

- Home / About
- Blog (`/posts`)
- Projects (`/projects`)
- Journal (`/journal`)
- Contact (`/contact`)

## 1) Install prerequisites (macOS)

```bash
brew install hugo
```

## 2) Add the PaperMod theme

From the repository root:

```bash
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

If submodule already exists, run:

```bash
git submodule update --init --recursive
```

## 3) Run locally

```bash
hugo server -D
```

Open: `http://localhost:1313`

## 4) Build production output

```bash
hugo --minify
```

Generated site will be in `public/`.

## Content locations

- Posts: `content/posts/`
- Projects: `content/projects/`
- Journal: `content/journal/`
- About page: `content/about.md`
- Contact page: `content/contact.md`
- Site config: `hugo.yaml`
