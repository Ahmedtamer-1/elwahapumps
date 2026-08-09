/**
 * Builds the El Waha brand assets from the delivered artwork.
 *
 * Run with:  npx tsx scripts/build-brand-assets.ts
 *
 * The original arrives as solid green artwork on an opaque white field,
 * padded, at 1708x960. Serving that directly would put a white box on every
 * pine surface, so this keys the white out to alpha, trims to the drawing,
 * and repaints the ink — one pine copy for light grounds, one white copy for
 * dark ones. Re-run it if the artwork is redrawn;
 * the crop boxes below were measured from this source and would need
 * re-measuring for another.
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

// The delivered artwork. Kept outside public/ so the 765 KB original is
// never served — only the keyed derivatives below are.
const SRC = "assets/brand/elwaha-logo-source.png";
const OUT = "public/images/brand";

const PINE: [number, number, number] = [0x0e, 0x3b, 0x2e];
// The reversed drawing goes pure white rather than bone. Bone is the right
// paper colour for a page, but as ink over the hero photography it loses a
// little against the brighter parts of the image; white holds everywhere.
const WHITE: [number, number, number] = [0xff, 0xff, 0xff];

// Content bounds and part segmentation, measured from the source: the full
// lockup, and the calligraphic droplet alone up to the divider.
const FULL = { left: 167, top: 205, width: 1367, height: 553 };
const MARK = { left: 167, top: 205, width: 390, height: 553 };

const lum = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// Luminance of the darkest ink in the source. Anything at or below it is
// fully opaque, pure white is fully transparent, and the antialiased edges
// interpolate between the two — which is what keeps the curves smooth.
const INK_LUM = 61;

const alphaFor = (r: number, g: number, b: number) =>
  Math.round(255 * Math.min(1, Math.max(0, (255 - lum(r, g, b)) / (255 - INK_LUM))));

/** Keys the white field out of `crop` and repaints the ink in `rgb`. */
async function key(crop: typeof FULL, rgb: [number, number, number]) {
  const { data, info } = await sharp(SRC).extract(crop).raw().toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    out[o] = rgb[0];
    out[o + 1] = rgb[1];
    out[o + 2] = rgb[2];
    out[o + 3] = alphaFor(data[i], data[i + 1], data[i + 2]);
  }

  return { raw: out, width: info.width, height: info.height };
}

async function emit(crop: typeof FULL, rgb: [number, number, number], file: string) {
  const { raw, width, height } = await key(crop, rgb);
  const dest = path.join(OUT, file);

  await sharp(raw, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(dest);

  console.log(`${file}  ${width}x${height}  ${(fs.statSync(dest).size / 1024).toFixed(1)} KB`);
}

/**
 * The favicon: the droplet in pine on a bone square, so it holds its shape
 * against both light and dark browser chrome instead of dissolving into it.
 *
 * Written as a PNG wrapped in an ICO container — every browser that matters
 * reads PNG-in-ICO, and it keeps the one 256px drawing rather than a stack
 * of hand-tuned bitmaps.
 */
async function emitFavicon(dest: string) {
  const SIZE = 256;
  const PAD = 28;

  const { raw, width, height } = await key(MARK, PINE);
  const scaled = await sharp(raw, { raw: { width, height, channels: 4 } })
    .resize({ height: SIZE - PAD * 2, fit: "contain" })
    .png()
    .toBuffer();

  const png = await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: "#f6f5ef" },
  })
    .composite([{ input: scaled, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  // ICONDIR (6 bytes) + one ICONDIRENTRY (16 bytes) + the PNG itself.
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image in the file
  header.writeUInt8(0, 6); // width, where 0 means 256
  header.writeUInt8(0, 7); // height, where 0 means 256
  header.writeUInt8(0, 8); // palette colours: none
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // offset to the image data

  fs.writeFileSync(dest, Buffer.concat([header, png]));
  console.log(`${dest}  ${SIZE}x${SIZE}  ${((22 + png.length) / 1024).toFixed(1)} KB`);
}

async function main() {
  await emit(FULL, PINE, "elwaha-logo.png");
  await emit(FULL, WHITE, "elwaha-logo-reversed.png");
  await emit(MARK, PINE, "elwaha-mark.png");
  await emit(MARK, WHITE, "elwaha-mark-reversed.png");
  await emitFavicon("src/app/favicon.ico");
}

main();
