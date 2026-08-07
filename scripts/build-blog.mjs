import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content", "posts");
const blogDir = path.join(root, "blog");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseFrontMatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Post is missing front matter.");
  }

  const [, rawMeta, body] = match;
  const meta = {};

  for (const line of rawMeta.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^"/, "").replace(/"$/, "");
    meta[key] = value;
  }

  return { meta, body: body.trim() };
}

function markdownToHtml(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let paragraph = [];
  let listItems = [];
  let quoteLines = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inlineFormat(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      html.push(
        `<ul>${listItems.map((item) => `<li>${inlineFormat(item)}</li>`).join("")}</ul>`,
      );
      listItems = [];
    }
  };

  const flushQuote = () => {
    if (quoteLines.length) {
      html.push(
        `<blockquote>${quoteLines
          .map((line) => `<p>${inlineFormat(line)}</p>`)
          .join("")}</blockquote>`,
      );
      quoteLines = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      flushQuote();
      html.push(`<h2>${inlineFormat(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.slice(2));
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      flushQuote();
      listItems.push(trimmed.slice(2));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return html.join("\n");
}

function inlineFormat(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/"([^"]+)"/g, "&ldquo;$1&rdquo;");
}

function formatDisplayDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Denver",
  }).format(date);
}

function layout({ title, description, body, relativePrefix = ".." }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} | Travis Serna</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="stylesheet" href="${relativePrefix}/styles.css" />
  </head>
  <body>
    <header class="site-header">
      <div class="brand">TRAVIS SERNA</div>
      <nav class="site-nav">
        <a href="${relativePrefix}/index.html#book">The Book</a>
        <a href="${relativePrefix}/index.html#coming-soon">Coming Soon</a>
        <a href="${relativePrefix}/blog/">Blog</a>
        <a href="${relativePrefix}/index.html#author">The Author</a>
        <a href="${relativePrefix}/admin/">Login</a>
      </nav>
    </header>
    ${body}
  </body>
</html>`;
}

function renderPost(post) {
  const body = `
    <main class="post-shell">
      <div class="post-wrap">
        <a class="post-back" href="../../blog/">Back to Blog</a>
        <section class="post-hero">
          <p class="post-meta">${escapeHtml(post.displayDate)}</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="post-dek">${escapeHtml(post.excerpt)}</p>
        </section>
        <div class="post-layout">
          <article class="post-body">
            ${post.html}
          </article>
          <aside class="post-aside">
            <h3>Post Details</h3>
            <ul>
              <li>Author: Travis Serna</li>
              <li>Published: ${escapeHtml(post.displayDate)}</li>
              <li>Category: Encouragement</li>
            </ul>
          </aside>
        </div>
      </div>
    </main>`;

  return layout({
    title: post.title,
    description: post.excerpt,
    body,
  });
}

function renderBlogIndex(posts) {
  const cards = posts
    .map(
      (post) => `
          <article class="blog-card">
            <p class="blog-meta">${escapeHtml(post.displayDate)}</p>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.excerpt)}</p>
            <a class="text-link" href="../blog/${post.slug}/">Read post</a>
          </article>`,
    )
    .join("\n");

  const body = `
    <main class="post-shell">
      <div class="post-wrap">
        <section class="post-hero">
          <p class="post-meta">From the Blog</p>
          <h1>Encouragement for the journey.</h1>
          <p class="post-dek">
            Reflections from Travis Serna on truth, courage, faith, healing, and
            the quiet work of hope.
          </p>
        </section>

        <section class="blog-section">
          <div class="blog-grid">
${cards}
          </div>
        </section>
      </div>
    </main>`;

  return layout({
    title: "Blog",
    description: "Blog posts from Travis Serna",
    body,
    relativePrefix: "..",
  });
}

async function ensureDirectory(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureDirectory(blogDir);

  const files = (await fs.readdir(contentDir)).filter((file) => file.endsWith(".md"));
  const posts = [];
  const now = new Date();

  for (const file of files) {
    const fullPath = path.join(contentDir, file);
    const source = await fs.readFile(fullPath, "utf8");
    const { meta, body } = parseFrontMatter(source);
    const slug = slugify(path.basename(file, ".md"));
    const html = markdownToHtml(body);

    const publishDate = new Date(meta.date || "");

    if (Number.isNaN(publishDate.getTime())) {
      throw new Error(`${file} has an invalid or missing publish date.`);
    }

    const post = {
      slug,
      title: meta.title || path.basename(file, ".md"),
      excerpt: meta.excerpt || "",
      date: meta.date,
      publishDate,
      displayDate: formatDisplayDate(meta.date),
      html,
    };

    if (publishDate <= now) {
      posts.push(post);
    } else {
      // Remove an older generated copy if a post is rescheduled into the future.
      await fs.rm(path.join(blogDir, slug), { recursive: true, force: true });
      await fs.rm(path.join(blogDir, `${slug}.html`), { force: true });
    }
  }

  posts.sort((a, b) => b.publishDate - a.publishDate);

  for (const post of posts) {
    const postDir = path.join(blogDir, post.slug);
    await ensureDirectory(postDir);
    await fs.writeFile(path.join(postDir, "index.html"), renderPost(post));
  }

  await fs.writeFile(path.join(blogDir, "index.html"), renderBlogIndex(posts));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
