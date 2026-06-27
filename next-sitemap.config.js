const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_ROOT = path.join(process.cwd(), "content");
const SECTIONS = ["dev", "life"];

// Build a map of "/blog/<section>/<slug>" -> ISO publish date from frontmatter,
// so the sitemap reports each post's real date instead of the build timestamp.
function buildDateMap() {
  const map = {};
  for (const section of SECTIONS) {
    const dir = path.join(CONTENT_ROOT, section);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".mdx")) continue;
      const slug = (file.replace(/\.mdx$/, "").match(/^(\d+)/) || [])[1] || file;
      const { data } = matter(fs.readFileSync(path.join(dir, file), "utf-8"));
      if (data.date) {
        map[`/blog/${section}/${slug}`] = new Date(data.date).toISOString();
      }
    }
  }
  return map;
}

const dateMap = buildDateMap();

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://joowonkoh.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  outDir: "./public",
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
