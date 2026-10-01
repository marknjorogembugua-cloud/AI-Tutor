#!/usr/bin/env node
/**
 * Generate the installable app icons as real PNG files.
 *
 * Why hand-rolled instead of an image library:
 *
 *   sharp is not a dependency of this project, and app/icon.svg is the only
 *   raster source we have. Adding sharp for four static files would mean a
 *   native build step and a lockfile change to produce assets that never
 *   change again.
 *
 *   next/og is already in the tree (it backs the OpenGraph card), but satori
 *   renders a flexbox subset with no SVG passthrough, so it cannot rasterise
 *   the logo faithfully — it has to rebuild the mark out of divs, which is
 *   what this script does anyway, and doing it twice invites drift.
 *
 * So we draw the mark analytically. Every shape below is an exact distance or
 * point-in-polygon test, evaluated on a 3x3 supersampled grid per pixel, which
 * gives clean anti-aliased edges without a rasteriser.
 *
 * The mark is the graduation cap from app/icon.svg, so it stays identical to
 * the in-app logo. Colours match the default (light, indigo) theme in
 * app/globals.css.
 *
 * Run: npm run icons
 *
 * Outputs to public/ (see PUBLIC_DIR below) and also app/apple-icon.png.
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Where the PNGs go.
 *
 * public/, not app/. Only `icon.*` and `apple-icon.*` are Next file-based
 * metadata conventions; `icon-192.png` and friends are not recognised and would
 * not be served at all, so the manifest would reference 404s. app/icon.svg
 * already covers the favicon and link icon via the convention.
 *
 * apple-icon.png is additionally written into app/ because that name *is* a
 * convention, and Next derives <link rel="apple-touch-icon"> from it.
 */
const PUBLIC_DIR = join(ROOT, 'public');
const APP_DIR = join(ROOT, 'app');

/** Matches --brand and the icon plate in globals.css. */
const PLATE = '#4f46e5';
const INK = '#ffffff';

// ---------- geometry (32x32 design units, matching app/icon.svg) ----------

/** Distance from a point to a rounded rectangle, negative inside. */
function sdRoundRect(px, py, hw, hh, r) {
    const qx = Math.abs(px) - hw + r;
    const qy = Math.abs(py) - hh + r;
    const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
    return outside + Math.min(Math.max(qx, qy), 0) - r;
}

/** Even-odd point-in-polygon test. */
function inPoly(px, py, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * The cap body: two side walls plus the rounded bowl underneath. Modelled as a
 * lower-half ring unioned with two vertical walls, which matches the stroked
 * path in the SVG.
 */
function inCapBody(px, py) {
    const cx = 16;
    const cy = 21.4; // centre of the bowl arc
    const rOuter = 5.5;
    const rInner = 3.3;
    if (py >= cy) {
        const d = Math.hypot(px - cx, py - cy);
        return d <= rOuter && d >= rInner;
    }
    // Side walls, only between the mortarboard and the top of the bowl.
    if (py < 14.4 || py > cy) return false;
    return Math.abs(px - (cx - rOuter)) <= 1.1 || Math.abs(px - (cx + rOuter)) <= 1.1;
}

// The mortarboard diamond: (16,7.5) top, (25,11.5) right, (16,15.5) bottom,
// (7,11.5) left.
const BOARD = [[16, 7.5], [25, 11.5], [16, 15.5], [7, 11.5]];

/**
 * How much to scale the mark about the centre.
 *
 * Maskable icons are cropped to a circle by Android, so the mark has to shrink
 * into the 80% safe zone while the plate keeps bleeding to the edges.
 */
let markScale = 1;

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const PLATE_RGB = hexToRgb(PLATE);
const INK_RGB = hexToRgb(INK);

/** Which colour, if any, covers this point in design units. */
function sample(u, v) {
    // Outside the rounded plate: fully transparent.
    if (sdRoundRect(u - 16, v - 16, 16, 16, 8) > 0) return null;

    const mu = (u - 16) / markScale + 16;
    const mv = (v - 16) / markScale + 16;
    const cap = inPoly(mu, mv, BOARD) || inCapBody(mu, mv);

    return cap ? INK_RGB : PLATE_RGB;
}

// ---------- rasteriser ----------

const SS = 3; // supersampling factor per axis

function renderRgba(size, scale = 1) {
    markScale = scale;
    const px = Buffer.alloc(size * size * 4);
    const step = 32 / size;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let r = 0, g = 0, b = 0, hits = 0;
            for (let sy = 0; sy < SS; sy++) {
                for (let sx = 0; sx < SS; sx++) {
                    const u = (x + (sx + 0.5) / SS) * step;
                    const v = (y + (sy + 0.5) / SS) * step;
                    const c = sample(u, v);
                    if (!c) continue;
                    r += c[0]; g += c[1]; b += c[2]; hits++;
                }
            }
            const i = (y * size + x) * 4;
            if (hits === 0) continue; // leave transparent
            // Average only the covered samples so edges fade to transparent
            // without picking up the plate colour.
            px[i] = Math.round(r / hits);
            px[i + 1] = Math.round(g / hits);
            px[i + 2] = Math.round(b / hits);
            px[i + 3] = Math.round((hits / (SS * SS)) * 255);
        }
    }
    return px;
}

// ---------- PNG encoder ----------

const CRC_TABLE = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
    }
    return t;
})();

function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}

function encodePng(size, rgba) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8;  // bit depth
    ihdr[9] = 6;  // colour type: RGBA
    ihdr[10] = 0; // deflate
    ihdr[11] = 0; // adaptive filtering
    ihdr[12] = 0; // no interlace

    // Filter type 0 (None) on every scanline. Our images are flat colour with
    // alpha-only edges, so per-line filtering would cost bytes for no gain.
    const stride = size * 4;
    const raw = Buffer.alloc(size * (stride + 1));
    for (let y = 0; y < size; y++) {
        const o = y * (stride + 1);
        raw[o] = 0;
        rgba.copy(raw, o + 1, y * stride, (y + 1) * stride);
    }

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

// ---------- outputs ----------

const TARGETS = [
    { file: 'icon-512.png', size: 512, scale: 1 },
    { file: 'icon-192.png', size: 192, scale: 1 },
    { file: 'apple-icon.png', size: 180, scale: 1, alsoToApp: true },
    // Android crops maskable icons to a circle: keep the plate full-bleed and
    // pull the mark inside the safe zone (80% diameter).
    { file: 'icon-maskable-512.png', size: 512, scale: 0.62 },
];

mkdirSync(PUBLIC_DIR, { recursive: true });
for (const t of TARGETS) {
    const png = encodePng(t.size, renderRgba(t.size, t.scale));
    writeFileSync(join(PUBLIC_DIR, t.file), png);
    console.log(`wrote public/${t.file}  ${t.size}x${t.size}  ${png.length} bytes`);

    if (t.alsoToApp) {
        writeFileSync(join(APP_DIR, t.file), png);
        console.log(`wrote app/${t.file}  (file-based metadata convention)`);
    }
}