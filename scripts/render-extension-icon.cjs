const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');

sharp(path.join(root, 'assets/extension-icon.svg'))
  .png()
  .toFile(path.join(root, 'assets/extension-icon.png'))
  .then(() => console.log('Extension icon rendered at 256 × 256 px.'))
  .catch(error => { console.error(error); process.exitCode = 1; });
