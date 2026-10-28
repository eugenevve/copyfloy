import fs from "node:fs";

import pngToIco from "png-to-ico";
import sharp from "sharp";

const SIZES = [16, 24, 32, 48, 64, 128, 256];
const svg = fs.readFileSync("resources/icon.svg");

// Render the SVG once into a large PNG to avoid losing clarity
const meta = await sharp(svg).metadata();
const density = (72 * 1024) / Math.max(meta.width, meta.height);

const master = await sharp(svg, { density })
  .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

// All sizes for .ico
const pngs = await Promise.all(SIZES.map((size) => sharp(master).resize(size, size).png().toBuffer()));
fs.writeFileSync("resources/icon.ico", await pngToIco(pngs));

// PNG for window and tray
await sharp(master).resize(512, 512).png().toFile("resources/icon.png");

console.log("Done: resources/icon.ico, resources/icon.png");
