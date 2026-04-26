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
