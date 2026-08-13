import { readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const root = new URL("../dist/", import.meta.url);
const origin = "https://wikinb.kainnne.com";

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtml(path));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

const distPath = root.pathname;
const urls = (await collectHtml(distPath))
  .map((file) => relative(distPath, file).split(sep).join("/"))
  .map((path) => path === "index.html"
    ? `${origin}/`
    : path.endsWith("/index.html")
      ? `${origin}/${path.slice(0, -"index.html".length)}`
      : `${origin}/${path.slice(0, -".html".length)}`)
  .filter((url) => url === `${origin}/`
    || url === `${origin}/search/`
    || url === `${origin}/wiki/`
    || url.startsWith(`${origin}/wiki/`))
  .sort();

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${url.replaceAll("&", "&amp;")}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

await writeFile(new URL("sitemap.xml", root), xml, "utf8");
console.log(`Generated sitemap with ${urls.length} public URL(s).`);
