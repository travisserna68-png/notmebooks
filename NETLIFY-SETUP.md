# Netlify Setup

This site is prepared for a Netlify + Decap CMS blog workflow.

## What is already set up

- `netlify.toml` for Netlify builds
- `package.json` with a build command
- `/admin/` for the Decap CMS login and editor
- `content/posts/*.md` as the blog source files
- `scripts/build-blog.mjs` to generate live blog pages from Markdown

## Netlify steps

1. Push this site to a GitHub repository.
2. In Netlify, create a new site from that Git repository.
3. Keep the build command as `npm run build`.
4. Keep the publish directory as `.`.
5. Deploy the site.

## Turn on CMS login

Based on the official Decap CMS + Netlify flow, enable these in Netlify after deploy:

1. Go to `Integrations > Identity` and enable Identity.
2. Set registration to `Invite only` for a private author login.
3. Go to `Services > Git Gateway` and enable Git Gateway.
4. Invite yourself as a user from the Identity area.

Then visit:

- `https://your-site-url.netlify.app/admin/`

## How blog publishing works

- Blog posts live in `content/posts/`
- When you save a post in `/admin/`, Decap CMS commits it to the repo
- Netlify rebuilds the site
- The build script generates:
  - `/blog/index.html`
  - `/blog/<slug>/index.html`

## Important note

The main homepage blog cards are still curated manually for now.
New posts added in the CMS will appear automatically on `/blog/`.
