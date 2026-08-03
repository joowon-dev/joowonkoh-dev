const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_ROOT = path.join(process.cwd(), "content");
const SECTIONS = ["dev", "life"];

// Build a map of "/blog/<section>/<slug>" -> ISO publish date from frontmatter,
// so the sitemap reports each post's real date instead of the build timestamp.
function buildContentIndex() {
  const dateMap = {};
  const noindexPaths = [];
  for (const section of SECTIONS) {
    const dir = path.join(CONTENT_ROOT, section);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".mdx")) continue;
      const slug = (file.replace(/\.mdx$/, "").match(/^(\d+)/) || [])[1] || file;
      const { data } = matter(fs.readFileSync(path.join(dir, file), "utf-8"));
      const loc = `/blog/${section}/${slug}`;
      if (data.date) dateMap[loc] = new Date(data.date).toISOString();
      if (data.noindex === true) noindexPaths.push(loc);
    }
  }
  return { dateMap, noindexPaths };
}

const { dateMap, noindexPaths } = buildContentIndex();

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://joowonkoh.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  outDir: "./public",
  // 어드민은 색인 대상이 아니다. 페이지 metadata의 noindex와 별개로,
  // 사이트맵과 robots.txt 양쪽에서 주소 자체를 흘리지 않는다.
  exclude: [...noindexPaths, "/admin", "/admin/*"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/", disallow: ["/admin"] }],
  },
  transform: async (config, url) => {
    const loc = new URL(url, config.siteUrl).pathname;
    const isPost = loc.startsWith("/blog/") && loc.split("/").length === 4;
    return {
      loc: url,
      changefreq: isPost ? "monthly" : "weekly",
      priority: isPost ? 0.7 : 0.5,
      lastmod: dateMap[loc] || new Date().toISOString(),
    };
  },
};
