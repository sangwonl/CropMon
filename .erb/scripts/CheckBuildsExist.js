// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

const buildPaths = [
  path.join(__dirname, '../../src/dist/main.prod.js'),
  path.join(__dirname, '../../src/dist/renderer.preferences.prod.js'),
  path.join(__dirname, '../../src/dist/renderer.overlays.prod.js'),
];

buildPaths.forEach((buildPath) => {
  if (!fs.existsSync(buildPath)) {
    throw new Error(
      chalk.whiteBright.bgRed.bold(
        'The main process is not built yet. Build it by running "npm run build"'
      )
    );
  }
});
