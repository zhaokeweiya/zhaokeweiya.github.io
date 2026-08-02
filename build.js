const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const config = require("./_config.js");

const postsDir = path.join(__dirname, "_posts");
const outDir = path.join(__dirname, "blog");

function readHeaders(file) {
  const txt = fs.readFileSync(file, "utf8");
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const headers = {};
  if (m) {
    m[1].split("\n").forEach((line) => {
      const kv = line.match(/^([\w-]+):\s*(.*)$/);
      if (kv) headers[kv[1].trim()] = kv[2].trim();
    });
  }
  const body = txt.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  return { headers, body };
}

function slugify(title) {
  return title.replace(/\s+/g, "-");
}

function htmlHead(title, desc, prefix) {
  const css = prefix ? prefix + "css/style.css" : "css/style.css";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="stylesheet" href="${css}?v=4">
</head>
<body>`;
}

function nav(active, prefix, brand) {
  const p = (f) => (prefix ? prefix + f : f);
  return `<nav class="nav">
    <div class="nav-inner">
      <a href="${p("index.html")}" class="logo">
        <span class="logo-dot"></span>
        ${brand || config.siteTitle}
      </a>
      <button class="nav-toggle" aria-label="打开菜单">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links">
        <li><a href="${p("index.html")}" class="${active === "home" ? "active" : ""}">Home</a></li>
        <li><a href="${p("blog.html")}" class="${active === "blog" ? "active" : ""}">Blog</a></li>
        <li><a href="${p("about.html")}">About</a></li>
      </ul>
    </div>
  </nav>`;
}

function footer(prefix) {
  const p = (f) => (prefix ? prefix + f : "");
  return `<footer class="footer">
    <div class="container">
      <p>© 2026 zhaokeweiya · Made with <span class="heart">♥</span> · <a href="${p("about.html")}">About</a></p>
    </div>
  </footer>
  <button class="to-top" aria-label="返回顶部">↑</button>
  <script src="${prefix ? prefix + "js/" : "js/"}main.js"></script>
</body>
</html>`;
}

function build() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const posts = [];

  postFiles.forEach((f) => {
    const { headers, body } = readHeaders(path.join(postsDir, f));
    const html = marked.parse(body);
    const excerpt = body
      .replace(/[#>*`\-\[\]()!]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 110) || "阅读全文";
    posts.push({
      title: headers.title || "无标题",
      date: headers.date || "2026-01-01",
      category: headers.category || config.categories[0].id,
      excerpt,
      html,
      slug: slugify(headers.title || f),
    });
  });

  // sort by date desc
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));

  // 生成文章页
  posts.forEach((post) => {
    const page = renderArticle(post);
    fs.writeFileSync(path.join(outDir, post.slug + ".html"), page);
  });

  // 生成 blog.html 列表页
  const listItems = posts
    .map(
      (p) => `
      <div class="post-card" data-cat="${p.category}">
        <div class="meta">
          <span>${p.date}</span>
          <span class="tag">${p.category}</span>
        </div>
        <h2><a href="blog/${p.slug}.html">${p.title}</a></h2>
        <p>${p.excerpt}…</p>
      </div>`
    )
    .join("\n");

  const catTabs = `<button class="cat-tab active" data-cat="all">✨ 全部</button>` + config.categories.map((c) => `<button class="cat-tab" data-cat="${c.id}">${c.icon} ${c.label}</button>`).join("");

  const page = `${htmlHead("Blog", "我的博客文章列表")}
${nav("blog", "")}
  <main class="page">
    <div class="container">
      <h1 class="section-title" style="font-size:2.4rem;">Blog</h1>
      <p class="section-sub">记录思考，分享成长</p>
      <div class="cat-tabs">${catTabs}</div>
      <div class="post-list" id="post-list">
        ${listItems}
      </div>
    </div>
  </main>
  <script src="js/blog.js"></script>
${footer()}`;
  fs.writeFileSync(path.join(__dirname, "blog.html"), page);

  writeIndex(posts);

  console.log("✅ 生成完成，共", posts.length, "篇文章");
}

function writeIndex(posts) {
  const recent = posts.slice(0, 3);
  const previews = recent
    .map(
      (p) => `
        <div class="post-preview">
          <a href="blog/${p.slug}.html">
            <h2 class="post-title">${p.title}</h2>
            <div class="post-content-preview">
              ${p.excerpt}…
            </div>
          </a>
          <p class="post-meta">Posted by ${config.siteTitle} on ${p.date}</p>
        </div>
        <hr>`
    )
    .join("\n");

  const page = `${htmlHead(config.siteTitle, "记录生活、咖啡、摄影与思考的个人网站")}
${nav("home", "", "front page")}
  <header class="intro">
    <div class="container">
      <h1>zhaokewei’s blog</h1>
      <span class="subheading">「记录生活的琐碎与热爱」</span>
    </div>
  </header>
  <div class="container">
    <div class="hux-layout hux-layout--wide">
      <main class="postlist">
        ${previews}
        <ul class="pager">
          <li class="next"><a href="blog.html">更早的文章 →</a></li>
        </ul>
      </main>
    </div>
  </div>
${footer()}`;
  fs.writeFileSync(path.join(__dirname, "index.html"), page);
}

function fixImages(html) {
  return html.replace(/src="images\//g, 'src="../images/');
}

function renderArticle(post) {
  const p = (f) => "../" + f;
  const html = fixImages(post.html);
  return `${htmlHead(post.title, post.excerpt, "../")}
${nav("", "../")}
  <header class="intro">
    <div class="container">
      <div class="intro-meta">
        <span>${post.date}</span>
        <span class="tag">${post.category}</span>
      </div>
      <h1>${post.title}</h1>
    </div>
  </header>
  <div class="container">
    <div class="hux-layout hux-layout--wide">
      <div class="article-card">
        <div class="article-body">
${html}
        </div>
        <div class="article-foot">
          <span>${config.siteTitle}</span>
          <span>·</span>
          <span>${post.date}</span>
          <span>·</span>
          <span>${post.category}</span>
        </div>
      </div>
      <p style="text-align:center; margin-top:24px;">
        <a href="../blog.html" class="btn btn-ghost">← 返回列表</a>
      </p>
    </div>
  </div>
${footer("../")}`;
}

build();