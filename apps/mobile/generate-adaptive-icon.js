/**
 * generate-adaptive-icon.js
 * Creates a transparent-background 1024x1024 adaptive icon PNG using sharp
 * (bundled in workspace via pnpm add sharp)
 */
const sharp = require('sharp');
const path = require('path');

const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="1024" height="1024">
  <rect x="10" y="9" width="5" height="30" rx="2.5" fill="white"/>
  <path d="M15 13 H23 A6.5 6.5 0 0 1 23 24 H15" stroke="white" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M15 24 H25 A6.5 6.5 0 0 1 25 35 H15" stroke="white" stroke-width="5" stroke-linecap="round" fill="none"/>
  <circle cx="37" cy="11" r="5" fill="#F5B731"/>
</svg>`);

sharp(svgBuffer)
  .resize(1024, 1024)
  .png()
  .toFile(path.resolve(__dirname, 'assets/adaptive-icon-transparent.png'))
  .then(info => {
    console.log('Done:', info);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
