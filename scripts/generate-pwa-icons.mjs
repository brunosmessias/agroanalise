// scripts/generate-pwa-icons.mjs
// Regenerates the PWA icon set from public/logo-mini.png.
// Run with: node scripts/generate-pwa-icons.mjs
//
// Composites the transparent source logo onto an opaque background so that
// the icons meet PWA installability requirements (no transparency).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "public", "logo-mini.png");
const OUT_DIR = join(ROOT, "public", "icons");

// Slightly inset the logo so the OS rounded-mask doesn't crop the artwork.
const PADDING = 0.12;

const SIZES = [
  { size: 192, file: "icon-192.png" },
  { size: 512, file: "icon-512.png" },
  { size: 180, file: "apple-touch-icon.png" },
];

// Solid background colour matching manifest.background_color (#ffffff).
const BG = { r: 255, g: 255, b: 255, alpha: 1 };

async function generateIcon({ size, file }) {
  const inner = Math.round(size * (1 - PADDING * 2));
  const source = await readFile(SOURCE);
  const resized = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: BG })
    .png()
    .toBuffer();

  const out = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: resized, top: 0, left: 0 }])
    .png()
    .toBuffer();

  await writeFile(join(OUT_DIR, file), out);
  console.log(`  wrote ${file} (${size}x${size}, ${out.length} bytes)`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log("Generating PWA icons from public/logo-mini.png");
  for (const target of SIZES) {
    await generateIcon(target);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
