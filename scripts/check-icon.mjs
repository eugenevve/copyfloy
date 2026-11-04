import fs from "node:fs";

const expectedSizes = [16, 24, 32, 48, 64, 128, 256];

for (const variant of ["dev", "prod"]) {
  const icoPath = `resources/icon-${variant}.ico`;
  const pngPath = `resources/icon-${variant}.png`;
  const buf = fs.readFileSync(icoPath);
  const count = buf.readUInt16LE(4);
  const sizes = [];

  for (let i = 0; i < count; i++) {
    const offset = 6 + i * 16;
    const width = buf[offset] || 256;
    const height = buf[offset + 1] || 256;
    if (width !== height) throw new Error(`${icoPath}: expected square icon, got ${width}x${height}`);
    sizes.push(width);
  }

  if (expectedSizes.some((size) => !sizes.includes(size))) {
    throw new Error(`${icoPath}: expected sizes ${expectedSizes.join(", ")}, got ${sizes.join(", ")}`);
  }
  if (!fs.existsSync(pngPath) || fs.statSync(pngPath).size === 0) {
    throw new Error(`${pngPath}: missing or empty`);
  }

  console.log(`${icoPath}: ${sizes.map((size) => `${size}x${size}`).join(", ")}; ${pngPath}: OK`);
}
