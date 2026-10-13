const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ROOT_DIR = "c:\\Users\\sajal\\Downloads\\Flash";
const PUBLIC_BRAND_DIR = path.join(ROOT_DIR, "public", "brand");
const ICONS_DIR = path.join(PUBLIC_BRAND_DIR, "icons");
const APP_DIR = path.join(ROOT_DIR, "src", "app");

// Ensure target directories exist
fs.mkdirSync(PUBLIC_BRAND_DIR, { recursive: true });
fs.mkdirSync(ICONS_DIR, { recursive: true });

// 1. Scalable Vector Mark for Light Surfaces
const markLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" aria-label="Formly brand mark">
  <defs>
    <linearGradient id="fl-top-arm-light" x1="224" y1="74" x2="390" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A1C24"/>
      <stop offset="100%" stop-color="#0E1015"/>
    </linearGradient>
    <linearGradient id="fl-mid-arm-light" x1="224" y1="234" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E233F8"/>
      <stop offset="60%" stop-color="#C11EEE"/>
      <stop offset="100%" stop-color="#9A0FE6"/>
    </linearGradient>
    <linearGradient id="fl-upper-ribbon-light" x1="160" y1="74" x2="160" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6948FF"/>
      <stop offset="50%" stop-color="#5534FB"/>
      <stop offset="100%" stop-color="#4621F7"/>
    </linearGradient>
    <linearGradient id="fl-lower-stem-light" x1="120" y1="280" x2="220" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A3FE8"/>
      <stop offset="50%" stop-color="#2356F7"/>
      <stop offset="100%" stop-color="#3470FE"/>
    </linearGradient>
    <linearGradient id="fl-crease-shadow-light" x1="120" y1="280" x2="220" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#061258" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#061258" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Lower Stem -->
  <path d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z" fill="url(#fl-lower-stem-light)"/>

  <!-- Crease Shadow -->
  <path d="M112 284 L224 352 L224 364 L112 296 Z" fill="url(#fl-crease-shadow-light)"/>

  <!-- Upper Ribbon (Faceted Stem) -->
  <path d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z" fill="url(#fl-upper-ribbon-light)"/>

  <!-- Middle Arm -->
  <path d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z" fill="url(#fl-mid-arm-light)"/>

  <!-- Upper Arm -->
  <path d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z" fill="url(#fl-top-arm-light)"/>
</svg>`;

// 2. Scalable Vector Mark for Dark Surfaces
const markDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" aria-label="Formly brand mark">
  <defs>
    <linearGradient id="fl-top-arm-dark" x1="220" y1="74" x2="390" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="45%" stop-color="#F2F4FD"/>
      <stop offset="100%" stop-color="#D7DEFC"/>
    </linearGradient>
    <linearGradient id="fl-mid-arm-dark" x1="220" y1="234" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E83BF9"/>
      <stop offset="50%" stop-color="#C823EE"/>
      <stop offset="100%" stop-color="#9C17EC"/>
    </linearGradient>
    <linearGradient id="fl-upper-ribbon-dark" x1="160" y1="74" x2="160" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8561FE"/>
      <stop offset="50%" stop-color="#6542FB"/>
      <stop offset="100%" stop-color="#512CF8"/>
    </linearGradient>
    <linearGradient id="fl-lower-stem-dark" x1="120" y1="280" x2="220" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A3FE8"/>
      <stop offset="50%" stop-color="#2457F7"/>
      <stop offset="100%" stop-color="#3470FE"/>
    </linearGradient>
    <linearGradient id="fl-crease-shadow-dark" x1="120" y1="280" x2="220" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#061258" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#061258" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  <!-- Lower Stem -->
  <path d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z" fill="url(#fl-lower-stem-dark)"/>

  <!-- Crease Shadow -->
  <path d="M112 284 L224 352 L224 364 L112 296 Z" fill="url(#fl-crease-shadow-dark)"/>

  <!-- Upper Ribbon (Faceted Stem) -->
  <path d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z" fill="url(#fl-upper-ribbon-dark)"/>

  <!-- Middle Arm -->
  <path d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z" fill="url(#fl-mid-arm-dark)"/>

  <!-- Upper Arm -->
  <path d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z" fill="url(#fl-top-arm-dark)"/>
</svg>`;

// 3. Horizontal Formly Logo for Light Surfaces (2000 x 640)
const logoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 640" fill="none" aria-label="Formly logo">
  <defs>
    <linearGradient id="hl-top-arm" x1="224" y1="74" x2="390" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A1C24"/>
      <stop offset="100%" stop-color="#0E1015"/>
    </linearGradient>
    <linearGradient id="hl-mid-arm" x1="224" y1="234" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E233F8"/>
      <stop offset="60%" stop-color="#C11EEE"/>
      <stop offset="100%" stop-color="#9A0FE6"/>
    </linearGradient>
    <linearGradient id="hl-upper-ribbon" x1="160" y1="74" x2="160" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6948FF"/>
      <stop offset="50%" stop-color="#5534FB"/>
      <stop offset="100%" stop-color="#4621F7"/>
    </linearGradient>
    <linearGradient id="hl-lower-stem" x1="120" y1="280" x2="220" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A3FE8"/>
      <stop offset="50%" stop-color="#2356F7"/>
      <stop offset="100%" stop-color="#3470FE"/>
    </linearGradient>
    <linearGradient id="hl-crease-shadow" x1="120" y1="280" x2="220" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#061258" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#061258" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Scaled F mark centered vertically: scale 0.75, offset x=200, y=128 -->
  <g transform="translate(200, 128) scale(0.75)">
    <!-- Lower Stem -->
    <path d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z" fill="url(#hl-lower-stem)"/>
    <!-- Crease Shadow -->
    <path d="M112 284 L224 352 L224 364 L112 296 Z" fill="url(#hl-crease-shadow)"/>
    <!-- Upper Ribbon -->
    <path d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z" fill="url(#hl-upper-ribbon)"/>
    <!-- Middle Arm -->
    <path d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z" fill="url(#hl-mid-arm)"/>
    <!-- Upper Arm -->
    <path d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z" fill="url(#hl-top-arm)"/>
  </g>

  <!-- Wordmark Formly in dark navy -->
  <text x="600" y="388" fill="#060B1E" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="250" font-weight="800" letter-spacing="-0.035em">Formly</text>
</svg>`;

// 4. Horizontal Formly Logo for Dark Surfaces (2000 x 640)
const logoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 640" fill="none" aria-label="Formly logo">
  <defs>
    <linearGradient id="hd-top-arm" x1="220" y1="74" x2="390" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="45%" stop-color="#F2F4FD"/>
      <stop offset="100%" stop-color="#D7DEFC"/>
    </linearGradient>
    <linearGradient id="hd-mid-arm" x1="220" y1="234" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E83BF9"/>
      <stop offset="50%" stop-color="#C823EE"/>
      <stop offset="100%" stop-color="#9C17EC"/>
    </linearGradient>
    <linearGradient id="hd-upper-ribbon" x1="160" y1="74" x2="160" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8561FE"/>
      <stop offset="50%" stop-color="#6542FB"/>
      <stop offset="100%" stop-color="#512CF8"/>
    </linearGradient>
    <linearGradient id="hd-lower-stem" x1="120" y1="280" x2="220" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A3FE8"/>
      <stop offset="50%" stop-color="#2457F7"/>
      <stop offset="100%" stop-color="#3470FE"/>
    </linearGradient>
    <linearGradient id="hd-crease-shadow" x1="120" y1="280" x2="220" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#061258" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#061258" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  <!-- Scaled F mark centered vertically: scale 0.75, offset x=200, y=128 -->
  <g transform="translate(200, 128) scale(0.75)">
    <!-- Lower Stem -->
    <path d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z" fill="url(#hd-lower-stem)"/>
    <!-- Crease Shadow -->
    <path d="M112 284 L224 352 L224 364 L112 296 Z" fill="url(#hd-crease-shadow)"/>
    <!-- Upper Ribbon -->
    <path d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z" fill="url(#hd-upper-ribbon)"/>
    <!-- Middle Arm -->
    <path d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z" fill="url(#hd-mid-arm)"/>
    <!-- Upper Arm -->
    <path d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z" fill="url(#hd-top-arm)"/>
  </g>

  <!-- Wordmark Formly in pure white -->
  <text x="600" y="388" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="250" font-weight="800" letter-spacing="-0.035em">Formly</text>
</svg>`;

// 5. App Icon for Light Tile (1024 x 1024 master)
const appIconLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="none" aria-label="Formly app icon">
  <defs>
    <filter id="tile-shadow-light" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.08"/>
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.04"/>
    </filter>
    <linearGradient id="ai-top-arm-light" x1="224" y1="74" x2="390" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A1C24"/>
      <stop offset="100%" stop-color="#0E1015"/>
    </linearGradient>
    <linearGradient id="ai-mid-arm-light" x1="224" y1="234" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E233F8"/>
      <stop offset="60%" stop-color="#C11EEE"/>
      <stop offset="100%" stop-color="#9A0FE6"/>
    </linearGradient>
    <linearGradient id="ai-upper-ribbon-light" x1="160" y1="74" x2="160" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6948FF"/>
      <stop offset="50%" stop-color="#5534FB"/>
      <stop offset="100%" stop-color="#4621F7"/>
    </linearGradient>
    <linearGradient id="ai-lower-stem-light" x1="120" y1="280" x2="220" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A3FE8"/>
      <stop offset="50%" stop-color="#2356F7"/>
      <stop offset="100%" stop-color="#3470FE"/>
    </linearGradient>
    <linearGradient id="ai-crease-shadow-light" x1="120" y1="280" x2="220" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#061258" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#061258" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Clean White Squircle Tile -->
  <rect x="64" y="64" width="896" height="896" rx="220" fill="#FFFFFF" filter="url(#tile-shadow-light)"/>

  <!-- Centered F Mark: scale 1.45, centered -->
  <g transform="translate(512, 512) scale(1.42) translate(-256, -256)">
    <path d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z" fill="url(#ai-lower-stem-light)"/>
    <path d="M112 284 L224 352 L224 364 L112 296 Z" fill="url(#ai-crease-shadow-light)"/>
    <path d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z" fill="url(#ai-upper-ribbon-light)"/>
    <path d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z" fill="url(#ai-mid-arm-light)"/>
    <path d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z" fill="url(#ai-top-arm-light)"/>
  </g>
</svg>`;

// 6. App Icon for Dark Tile (1024 x 1024 master with neon glow)
const appIconDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="none" aria-label="Formly app icon">
  <defs>
    <!-- Radiant Violet/Neon Back-glow -->
    <filter id="neon-glow-dark" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="50" result="blur1"/>
      <feGaussianBlur stdDeviation="25" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur1"/>
        <feMergeNode in="blur2"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="ai-top-arm-dark" x1="220" y1="74" x2="390" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="45%" stop-color="#F2F4FD"/>
      <stop offset="100%" stop-color="#D7DEFC"/>
    </linearGradient>
    <linearGradient id="ai-mid-arm-dark" x1="220" y1="234" x2="320" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E83BF9"/>
      <stop offset="50%" stop-color="#C823EE"/>
      <stop offset="100%" stop-color="#9C17EC"/>
    </linearGradient>
    <linearGradient id="ai-upper-ribbon-dark" x1="160" y1="74" x2="160" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8561FE"/>
      <stop offset="50%" stop-color="#6542FB"/>
      <stop offset="100%" stop-color="#512CF8"/>
    </linearGradient>
    <linearGradient id="ai-lower-stem-dark" x1="120" y1="280" x2="220" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A3FE8"/>
      <stop offset="50%" stop-color="#2457F7"/>
      <stop offset="100%" stop-color="#3470FE"/>
    </linearGradient>
    <linearGradient id="ai-crease-shadow-dark" x1="120" y1="280" x2="220" y2="350" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#061258" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#061258" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  <!-- Radiant Glow Layer -->
  <rect x="74" y="74" width="876" height="876" rx="220" fill="#6E3CFA" opacity="0.32" filter="url(#neon-glow-dark)"/>

  <!-- Sleek Dark Squircle Tile -->
  <rect x="64" y="64" width="896" height="896" rx="220" fill="#0B0F19" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>

  <!-- Centered F Mark: scale 1.42 -->
  <g transform="translate(512, 512) scale(1.42) translate(-256, -256)">
    <path d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z" fill="url(#ai-lower-stem-dark)"/>
    <path d="M112 284 L224 352 L224 364 L112 296 Z" fill="url(#ai-crease-shadow-dark)"/>
    <path d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z" fill="url(#ai-upper-ribbon-dark)"/>
    <path d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z" fill="url(#ai-mid-arm-dark)"/>
    <path d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z" fill="url(#ai-top-arm-dark)"/>
  </g>
</svg>`;

// 7. Canonical App Router SVG Favicon / App Icon (src/app/icon.svg)
// Responsive SVG that cleanly adapts and renders sharply at 16x16, 32x32, etc.
const nextAppIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <defs>
    <linearGradient id="f-top" x1="14" y1="4.5" x2="25" y2="11.5" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A1C24"/>
      <stop offset="100%" stop-color="#0E1015"/>
    </linearGradient>
    <linearGradient id="f-mid" x1="14" y1="14.5" x2="21" y2="21.5" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#E233F8"/>
      <stop offset="100%" stop-color="#9A0FE6"/>
    </linearGradient>
    <linearGradient id="f-ribbon" x1="10" y1="4.5" x2="10" y2="22" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6948FF"/>
      <stop offset="100%" stop-color="#4621F7"/>
    </linearGradient>
    <linearGradient id="f-stem" x1="7" y1="17.5" x2="14" y2="27" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1A3FE8"/>
      <stop offset="100%" stop-color="#3470FE"/>
    </linearGradient>
  </defs>

  <!-- Clean White Squircle Tile -->
  <rect width="32" height="32" rx="8" fill="#FFFFFF"/>

  <!-- Centered F Mark -->
  <g transform="translate(16, 16) scale(0.052) translate(-256, -256)">
    <path d="M112 284 L112 422 C112 430 119 435 126 431 L220 367 C223 365 224 362 224 358 L224 352 Z" fill="url(#f-stem)"/>
    <path d="M224 74 L126 139 C117 145 112 154 112 165 L112 284 L224 352 L224 234 L224 180 L224 74 Z" fill="url(#f-ribbon)"/>
    <path d="M224 234 L306 234 C315 234 322 239 326 248 L337 274 C339 279 339 285 336 290 L315 332 C312 337 306 340 300 340 L224 340 Z" fill="url(#f-mid)"/>
    <path d="M224 74 L378 74 C388 74 396 80 400 89 L415 125 C417 131 416 137 412 142 L390 173 C386 178 380 180 374 180 L224 180 Z" fill="url(#f-top)"/>
  </g>
</svg>`;

// Write all SVGs
fs.writeFileSync(path.join(PUBLIC_BRAND_DIR, "formly-mark-light.svg"), markLightSvg);
fs.writeFileSync(path.join(PUBLIC_BRAND_DIR, "formly-mark-dark.svg"), markDarkSvg);
fs.writeFileSync(path.join(PUBLIC_BRAND_DIR, "formly-logo-light.svg"), logoLightSvg);
fs.writeFileSync(path.join(PUBLIC_BRAND_DIR, "formly-logo-dark.svg"), logoDarkSvg);
fs.writeFileSync(path.join(PUBLIC_BRAND_DIR, "formly-app-icon-light.svg"), appIconLightSvg);
fs.writeFileSync(path.join(PUBLIC_BRAND_DIR, "formly-app-icon-dark.svg"), appIconDarkSvg);
fs.writeFileSync(path.join(APP_DIR, "icon.svg"), nextAppIconSvg);

console.log("✓ All SVG master assets written to public/brand/ and src/app/icon.svg");

// Raster generator using Puppeteer
async function generateRasters() {
  console.log("Launching Puppeteer for raster generation...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Helper function to render an SVG string at exact dimensions
  async function exportPng(svgContent, width, height, outputPath, transparent = true) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: ${transparent ? "transparent" : "#0B0F19"};
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 10000 });
    await new Promise((r) => setTimeout(r, 100));
    await page.screenshot({ path: outputPath, omitBackground: transparent });
    console.log(`✓ Exported: ${path.basename(outputPath)} (${width}x${height})`);
  }

  // 1. App Icon Masters (1024x1024)
  await exportPng(appIconLightSvg, 1024, 1024, path.join(PUBLIC_BRAND_DIR, "formly-app-icon-light.png"));
  await exportPng(appIconDarkSvg, 1024, 1024, path.join(PUBLIC_BRAND_DIR, "formly-app-icon-dark.png"));

  // 2. Horizontal Logo Masters (2000x640)
  await exportPng(logoLightSvg, 2000, 640, path.join(PUBLIC_BRAND_DIR, "formly-logo-light.png"));
  await exportPng(logoDarkSvg, 2000, 640, path.join(PUBLIC_BRAND_DIR, "formly-logo-dark.png"));

  // 3. Size Family Exports: 512, 256, 128, 64, 32
  const sizes = [512, 256, 128, 64, 32];
  for (const s of sizes) {
    await exportPng(appIconLightSvg, s, s, path.join(ICONS_DIR, `app-icon-light-${s}.png`));
    await exportPng(appIconDarkSvg, s, s, path.join(ICONS_DIR, `app-icon-dark-${s}.png`));
  }

  // 4. Favicon 32x32 and 16x16
  await exportPng(nextAppIconSvg, 32, 32, path.join(ICONS_DIR, "favicon-32.png"));
  await exportPng(nextAppIconSvg, 16, 16, path.join(ICONS_DIR, "favicon-16.png"));

  // 5. Standard Platform Icons
  // Apple Touch Icon (180x180)
  await exportPng(appIconLightSvg, 180, 180, path.join(APP_DIR, "apple-icon.png"));
  await exportPng(appIconLightSvg, 180, 180, path.join(ICONS_DIR, "apple-touch-icon.png"));

  // Also write public/favicon.ico as 32x32 PNG (browsers happily accept PNG favicons)
  await exportPng(nextAppIconSvg, 32, 32, path.join(ROOT_DIR, "public", "favicon.ico"));

  await browser.close();
  console.log("🎉 All raster exports generated successfully!");
}

generateRasters().catch((err) => {
  console.error("Error generating rasters:", err);
  process.exit(1);
});
