/**
 * Generates icon-192.png and icon-512.png as minimal valid PNGs
 * using pure Node.js (no native deps) via a hand-crafted PNG writer.
 */
import { writeFileSync } from "fs";
import { createHash } from "crypto";
import { deflateSync } from "zlib";

function adler32(buf) {
  let s1 = 1, s2 = 0;
  for (const b of buf) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521; }
  return (s2 << 16) | s1;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) {
    crc ^= b;
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makePNG(width, height, drawFn) {
  const pixels = new Uint8ClampedArray(width * height * 4);

  // drawFn fills pixels[y * width * 4 + x * 4 .. +3] = [r, g, b, a]
  drawFn(pixels, width, height);

  // Build raw scanlines (filter byte 0 = None before each row)
  const raw = Buffer.allocUnsafe(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst] = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = deflateSync(raw);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function hex(h) {
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return [r, g, b];
}

function setPixel(pixels, width, x, y, r, g, b, a = 255) {
  if (x < 0 || y < 0 || x >= width) return;
  const i = (Math.round(y) * width + Math.round(x)) * 4;
  if (i < 0 || i + 3 >= pixels.length) return;
  pixels[i] = r; pixels[i+1] = g; pixels[i+2] = b; pixels[i+3] = a;
}

function fillRect(pixels, width, height, x1, y1, w, h, r, g, b, a = 255) {
  for (let y = Math.max(0, Math.floor(y1)); y < Math.min(height, Math.ceil(y1 + h)); y++) {
    for (let x = Math.max(0, Math.floor(x1)); x < Math.min(width, Math.ceil(x1 + w)); x++) {
      setPixel(pixels, width, x, y, r, g, b, a);
    }
  }
}

function fillCircle(pixels, width, height, cx, cy, radius, r, g, b, a = 255) {
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(width - 1, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(height - 1, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(pixels, width, x, y, r, g, b, a);
      }
    }
  }
}

function fillRoundRect(pixels, width, height, rx, ry, rw, rh, cr, r, g, b, a = 255) {
  // Fill center
  fillRect(pixels, width, height, rx + cr, ry, rw - 2 * cr, rh, r, g, b, a);
  fillRect(pixels, width, height, rx, ry + cr, rw, rh - 2 * cr, r, g, b, a);
  // Corners
  fillCircle(pixels, width, height, rx + cr, ry + cr, cr, r, g, b, a);
  fillCircle(pixels, width, height, rx + rw - cr, ry + cr, cr, r, g, b, a);
  fillCircle(pixels, width, height, rx + cr, ry + rh - cr, cr, r, g, b, a);
  fillCircle(pixels, width, height, rx + rw - cr, ry + rh - cr, cr, r, g, b, a);
}

function drawLine(pixels, width, height, x0, y0, x1, y1, r, g, b, a = 255, thickness = 1) {
  const dx = x1 - x0, dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const px = x0 + dx * t;
    const py = y0 + dy * t;
    for (let ty = -thickness / 2; ty <= thickness / 2; ty++) {
      for (let tx = -thickness / 2; tx <= thickness / 2; tx++) {
        setPixel(pixels, width, Math.round(px + tx), Math.round(py + ty), r, g, b, a);
      }
    }
  }
}

function drawIcon(pixels, size) {
  const S = size / 192;

  // Background: warm off-white circle
  fillCircle(pixels, size, size, size / 2, size / 2, size / 2, ...hex("#F7F5F0"));

  // Ledger body (teal)
  const lx = Math.round(45 * S), ly = Math.round(28 * S);
  const lw = Math.round(104 * S), lh = Math.round(136 * S);
  const cr = Math.round(10 * S);
  fillRoundRect(pixels, size, size, lx, ly, lw, lh, cr, ...hex("#0D9488"));

  // Spine (darker teal)
  const sw = Math.round(26 * S);
  fillRect(pixels, size, size, lx, ly + cr, sw, lh - 2 * cr, ...hex("#0A6B63"));
  fillCircle(pixels, size, size, lx + cr, ly + cr, cr, ...hex("#0A6B63"));
  fillCircle(pixels, size, size, lx + cr, ly + lh - cr, cr, ...hex("#0A6B63"));
  fillRect(pixels, size, size, lx, ly + cr, cr, lh - 2 * cr, ...hex("#0A6B63"));

  // Lines on ledger
  const lineX1 = Math.round(84 * S);
  const lineX2 = Math.round(138 * S);
  const lineX2short = Math.round(118 * S);
  const thickness = Math.max(3, Math.round(5 * S));
  const lineYs = [72, 95, 118, 141];
  lineYs.forEach((y, i) => {
    const py = Math.round(y * S);
    drawLine(pixels, size, size, lineX1, py, i === 3 ? lineX2short : lineX2, py, 255, 255, 255, 255, thickness);
  });

  // Spine divider line
  const divX = Math.round(71 * S);
  drawLine(pixels, size, size, divX, ly + Math.round(18 * S), divX, ly + lh - Math.round(18 * S), 255, 255, 255, 60, Math.max(1, Math.round(2 * S)));
}

for (const size of [192, 512]) {
  const png = makePNG(size, size, (pixels) => drawIcon(pixels, size));
  writeFileSync(`public/icon-${size}.png`, png);
  console.log(`Generated icon-${size}.png`);
}
