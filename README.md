# zhaokeweiya.github.io

我的个人网站。基于 Markdown 写博客，本地用脚本生成静态网页，托管在 GitHub Pages。

## 网站结构

```
my-site/
├── index.html        # 首页
├── blog.html         # 博客列表页（含分类筛选）
├── about.html        # 关于我
├── _posts/           # ★ 写博客的地方（.md 文件都放这里）
│   ├── hello-world.md
│   └── ...
├── _config.js        # 站点配置（分类、标题等）
├── build.js          # 把 Markdown 转成网页的脚本
├── css/              # 样式
├── js/               # 交互脚本
└── blog/             # 生成的网页（由 build.js 自动生成，勿手动改）
```

## 一键发博客（三件事）

写新博客只需要三个步骤：

### 第 1 步：写文章

在 `_posts/` 文件夹里新建一个 `.md` 文件。文件最上方写三行"属性"（标题、日期、分类），下面写正文：

```markdown
---
title: 我的新文章
date: 2026-08-03
category: 生活
---

# 正文标题

用 Markdown 写正文，支持 **加粗**、列表、`代码`、> 引用 等。

```

**category（分类）可填的值**：

| 填写的值 | 含义 |
|---|---|
| `生活` | Life |
| `摄影` | Photography |
| `网络与编程` | Internet & Coding |

`date` 格式：`YYYY-MM-DD`。一篇文章 = 一个 `.md` 文件。

### 第 2 步：生成网页

进入 `my-site` 文件夹，运行：

```bash
npm run build
```

脚本会自动把每个 `.md` 转换成独立的文章网页，并更新 `blog.html` 列表和分类。

### 第 3 步：上传网站

```bash
git add -A
git commit -m "新增文章"
git push
```

等大约 1~2 分钟，GitHub Pages 会自动部署，新文章就会出现在博客里。

## 举个例子

今天想发一篇摄影的文章：

1. 新建文件 `_posts/street-photo.md`
2. 内容：

```markdown
---
title: 街头光影
date: 2026-08-03
category: 摄影
---

# 街头光影

今天在街上拍到一张很喜欢的照片……
```

3. `npm run build`
4. `git add -A && git commit -m "publish: 街头光影" && git push`

搞定。

## 添加新分类

如果以后想要新的分类（比如"美食"），编辑 `_config.js`：

```js
categories: [
  { id: "生活", label: "Life", icon: "🌿" },
  { id: "摄影", label: "Photography", icon: "📷" },
  { id: "网络与编程", label: "Internet & Coding", icon: "💻" },
  // 在这里加一行，例如：
  // { id: "美食", label: "Food", icon: "🍜" },
]
```

然后把文章 `category` 写成对应值，再 `npm run build`。

## 备注

- `blog/` 目录是自动生成的，**不需要手动编辑**，直接运行 `npm run build` 即可。
- 需要先安装依赖（只需一次）：`npm install`
- `node_modules/` 已加入 `.gitignore`，不会上传到 GitHub。