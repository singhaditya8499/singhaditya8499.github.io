# Portfolio Website

Static portfolio website ready for GitHub Pages deployment.

## Local preview

Open `index.html` directly in your browser, or run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to a NEW GitHub repository

1. Create a new repository on GitHub, for example: `portfolio-site`.
2. In this project folder run:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/singhaditya8499/portfolio-site.git
git push -u origin main
```

3. In GitHub repo settings: `Settings` > `Pages`
4. Under `Build and deployment`:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Save. Your site will be available in a minute at:

`https://singhaditya8499.github.io/portfolio-site/`

## If you want to use the existing Pages repository

If you push this to `singhaditya8499.github.io`, your URL will be root-level:

`https://singhaditya8499.github.io/`
