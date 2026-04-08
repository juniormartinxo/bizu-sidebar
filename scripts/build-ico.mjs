import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const iconDir = join(root, "src-tauri", "icons");

const sources = [
  { file: "32x32.png", size: 32 },
  { file: "128x128.png", size: 128 },
  { file: "128x128@2x.png", size: 256 }
];

const images = sources.map(({ file, size }) => ({
  size,
  data: readFileSync(join(iconDir, file))
}));

const headerSize = 6;
const entrySize = 16;
const buffer = Buffer.alloc(
  headerSize + entrySize * images.length + images.reduce((sum, image) => sum + image.data.length, 0)
);

let offset = 0;
buffer.writeUInt16LE(0, offset);
offset += 2;
buffer.writeUInt16LE(1, offset);
offset += 2;
buffer.writeUInt16LE(images.length, offset);
offset += 2;

let dataOffset = headerSize + entrySize * images.length;

for (const image of images) {
  buffer.writeUInt8(image.size === 256 ? 0 : image.size, offset);
  offset += 1;
  buffer.writeUInt8(image.size === 256 ? 0 : image.size, offset);
  offset += 1;
  buffer.writeUInt8(0, offset);
  offset += 1;
  buffer.writeUInt8(0, offset);
  offset += 1;
  buffer.writeUInt16LE(1, offset);
  offset += 2;
  buffer.writeUInt16LE(32, offset);
  offset += 2;
  buffer.writeUInt32LE(image.data.length, offset);
  offset += 4;
  buffer.writeUInt32LE(dataOffset, offset);
  offset += 4;

  image.data.copy(buffer, dataOffset);
  dataOffset += image.data.length;
}

writeFileSync(join(iconDir, "icon.ico"), buffer);
console.log("[build-ico] src-tauri/icons/icon.ico regenerated from transparent PNG sources");
