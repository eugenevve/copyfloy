import fs from "node:fs";

const buf = fs.readFileSync("resources/icon.ico");
const count = buf.readUInt16LE(4);

for (let i = 0; i < count; i++) {
  const offset = 6 + i * 16;
  const w = buf[offset] || 256;
  const h = buf[offset + 1] || 256;
  console.log(`${w}x${h}`);
}
