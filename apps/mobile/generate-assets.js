/**
 * generate-assets.js
 * Generates all three required app icon assets properly sized:
 *   1. assets/icon.png          — 1024x1024, purple bg, B mark centered, for iOS + Android legacy
 *   2. assets/adaptive-icon-transparent.png — 1024x1024, TRANSPARENT bg, B mark with 20% padding safe zone
 *   3. assets/splash.png        — 2048x2048, white bg, centered logo (icon + wordmark)
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT = path.resolve(__dirname, 'assets');

// ─── Brand colors ────────────────────────────────────────────────────────────
const BRAND  = '#5B4DFF';  // purple
const COIN   = '#F5B731';  // gold
const WHITE  = '#FFFFFF';

// ─── SVG templates ───────────────────────────────────────────────────────────

/**
 * Full icon SVG — purple rounded-rect background with B mark + coin.
 * Canvas: SIZE x SIZE, the letterform is centered with generous padding.
 * The B is drawn on a 48x48 grid then scaled to fill ~62% of the canvas.
 */
function fullIconSVG(size) {
  // Place B mark centred; scale so it fills 62% of the icon canvas
  const markSize = size * 0.62;
  const offset   = (size - markSize) / 2;
  const sc       = markSize / 48;           // scale from 48-unit grid
  const rx       = Math.round(size * 0.22); // rounded corner radius

  const tx = (x) => (offset + x * sc).toFixed(2);
  const ty = (y) => (offset + y * sc).toFixed(2);
  const ts = (v) => (v * sc).toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="${BRAND}"/>
  <rect x="${tx(10)}" y="${ty(9)}" width="${ts(5)}" height="${ts(30)}" rx="${ts(2.5)}" fill="${WHITE}"/>
  <path d="M${tx(15)} ${ty(13)} H${tx(23)} A${ts(6.5)} ${ts(6.5)} 0 0 1 ${tx(23)} ${ty(26)} H${tx(15)}"
        stroke="${WHITE}" stroke-width="${ts(5)}" stroke-linecap="round" fill="none"/>
  <path d="M${tx(15)} ${ty(24)} H${tx(25)} A${ts(6.5)} ${ts(6.5)} 0 0 1 ${tx(25)} ${ty(37)} H${tx(15)}"
        stroke="${WHITE}" stroke-width="${ts(5)}" stroke-linecap="round" fill="none"/>
  <circle cx="${tx(37)}" cy="${ty(11)}" r="${ts(5)}" fill="${COIN}"/>
</svg>`;
}

/**
 * Transparent adaptive icon SVG — NO background rectangle.
 * Content placed with 18% padding on each side → safe zone for Android adaptive icons.
 * Android masks the icon with a 72dp circle centred on a 108dp canvas (~66% safe zone).
 */
function adaptiveIconSVG(size) {
  const PAD    = size * 0.18;  // 18% padding = nice safe zone
  const markSize = size - PAD * 2;
  const sc       = markSize / 48;
  const tx = (x) => (PAD + x * sc).toFixed(2);
  const ty = (y) => (PAD + y * sc).toFixed(2);
  const ts = (v) => (v * sc).toFixed(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${tx(10)}" y="${ty(9)}" width="${ts(5)}" height="${ts(30)}" rx="${ts(2.5)}" fill="${WHITE}"/>
  <path d="M${tx(15)} ${ty(13)} H${tx(23)} A${ts(6.5)} ${ts(6.5)} 0 0 1 ${tx(23)} ${ty(26)} H${tx(15)}"
        stroke="${WHITE}" stroke-width="${ts(5)}" stroke-linecap="round" fill="none"/>
  <path d="M${tx(15)} ${ty(24)} H${tx(25)} A${ts(6.5)} ${ts(6.5)} 0 0 1 ${tx(25)} ${ty(37)} H${tx(15)}"
        stroke="${WHITE}" stroke-width="${ts(5)}" stroke-linecap="round" fill="none"/>
  <circle cx="${tx(37)}" cy="${ty(11)}" r="${ts(5)}" fill="${COIN}"/>
</svg>`;
}

/**
 * Splash screen SVG — white background with centred full icon (icon + wordmark text below).
 */
function splashSVG(size) {
  const iconSize = size * 0.18; // icon occupies 18% of the splash
  const cx = size / 2;
  const cy = size / 2;
  // Icon centred slightly above midpoint
  const iconX = cx - iconSize / 2;
  const iconY = cy - iconSize * 0.75;
  const rx = iconSize * 0.22;

  const sc = iconSize / 48;
  const ox = iconX;
  const oy = iconY;
  const tx = (x) => (ox + x * sc).toFixed(2);
  const ty = (y) => (oy + y * sc).toFixed(2);
  const ts = (v) => (v * sc).toFixed(2);

  const fontSize = Math.round(iconSize * 0.55);
  const textY = iconY + iconSize + fontSize * 0.9;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND}"/>
  <!-- Icon mark -->
  <rect x="${iconX.toFixed(2)}" y="${iconY.toFixed(2)}" width="${iconSize.toFixed(2)}" height="${iconSize.toFixed(2)}" rx="${rx.toFixed(2)}" fill="rgba(255,255,255,0.18)"/>
  <rect x="${tx(10)}" y="${ty(9)}" width="${ts(5)}" height="${ts(30)}" rx="${ts(2.5)}" fill="${WHITE}"/>
  <path d="M${tx(15)} ${ty(13)} H${tx(23)} A${ts(6.5)} ${ts(6.5)} 0 0 1 ${tx(23)} ${ty(26)} H${tx(15)}"
        stroke="${WHITE}" stroke-width="${ts(5)}" stroke-linecap="round" fill="none"/>
  <path d="M${tx(15)} ${ty(24)} H${tx(25)} A${ts(6.5)} ${ts(6.5)} 0 0 1 ${tx(25)} ${ty(37)} H${tx(15)}"
        stroke="${WHITE}" stroke-width="${ts(5)}" stroke-linecap="round" fill="none"/>
  <circle cx="${tx(37)}" cy="${ty(11)}" r="${ts(5)}" fill="rgba(255,255,255,0.7)"/>
</svg>`;
}

// ─── Generate ────────────────────────────────────────────────────────────────

async function run() {
  console.log('Generating app assets...\n');

  // 1. icon.png — full coloured icon, 1024x1024
  await sharp(Buffer.from(fullIconSVG(1024)))
    .png()
    .toFile(path.join(OUT, 'icon.png'));
  console.log('✅  assets/icon.png         (1024×1024, purple bg)');

  // 2. adaptive-icon-transparent.png — transparent fg for Android adaptive
  await sharp(Buffer.from(adaptiveIconSVG(1024)))
    .png()
    .toFile(path.join(OUT, 'adaptive-icon-transparent.png'));
  console.log('✅  assets/adaptive-icon-transparent.png  (1024×1024, transparent)');

  // 3. splash.png — white bg centred icon, 2048x2048
  await sharp(Buffer.from(splashSVG(2048)))
    .png()
    .toFile(path.join(OUT, 'splash.png'));
  console.log('✅  assets/splash.png       (2048×2048, white bg)');

  console.log('\nAll assets generated successfully!');
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
