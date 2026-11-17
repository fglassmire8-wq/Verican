/**
 * Resize Nov 15 catalog photos to ~1600px and strip EXIF/GPS into public/uploads/<slug>/.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(path.join(root, "scripts/data/nov15-catalog.json"), "utf8"));
const sourceRoot = process.env.NOV15_PHOTO_ROOT || "/workspace/photos-nov15/sorted-v2";
const destRoot = path.join(root, "public", "uploads");

const MAX = 1600;

async function optimize(inputPath, destPath) {
  const bytes = await sharp(inputPath)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  await writeFile(destPath, bytes);
  return bytes.length;
}

let files = 0;
let bytes = 0;
for (const product of catalog) {
  const dir = path.join(destRoot, product.slug);
  await mkdir(dir, { recursive: true });
  const folderByFile = new Map();
  for (const source of product.sources) {
    for (const file of source.files) folderByFile.set(file, source.folder);
  }
  for (let i = 0; i < product.photos.length; i++) {
    const file = product.photos[i];
    const folder = folderByFile.get(file);
    if (!folder) throw new Error(`No source folder for ${product.slug} ${file}`);
    const src = path.join(sourceRoot, folder, file);
    const dest = path.join(dir, `${String(i + 1).padStart(2, "0")}.jpg`);
    const size = await optimize(src, dest);
    files += 1;
    bytes += size;
    process.stdout.write(`optimized ${product.slug}/${String(i + 1).padStart(2, "0")}.jpg (${Math.round(size / 1024)}KB)\n`);
  }
}
console.error(`Wrote ${files} photos, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
