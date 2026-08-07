# Travis Serna Author Site

Custom author website for Travis Serna, prepared for Netlify deployment and a Decap CMS blog workflow.

## Included

- Main marketing site in `index.html`
- Blog admin at `/admin/`
- Blog source posts in `content/posts/`
- Generated blog pages in `blog/`
- Netlify config in `netlify.toml`

## Local build

Run the blog build script:

```bash
npm run build
```

This regenerates the blog index and individual post pages from the Markdown files in `content/posts/`.

## Schedule daily blog posts

Create posts in `/admin/` as usual and set each **Publish Date** to the day and
time you want it to appear. Publishing a future-dated post saves it to the site,
but the build keeps it hidden until that date arrives.

The GitHub Actions workflow in `.github/workflows/publish-scheduled-posts.yml`
runs every morning at 9:00 a.m. Mountain Daylight Time (8:00 a.m. during
Mountain Standard Time). It publishes every post whose date has arrived and
pushes the generated pages to `main`, which triggers the normal Netlify deploy.

You can also publish due posts immediately from GitHub by opening **Actions →
Publish scheduled blog posts → Run workflow**.

## GitHub upload

1. Create a new empty GitHub repository.
2. In this folder, run:

```bash
git init
git add .
git commit -m "Initial site setup"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Netlify deployment

After uploading to GitHub:

1. Connect the repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `.`
4. Enable Netlify Identity.
5. Enable Git Gateway.
6. Visit `/admin/` after deploy to manage blog posts.

For more detail, see `NETLIFY-SETUP.md`.
