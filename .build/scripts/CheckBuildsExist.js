// Check if the renderer and main bundles are built
const path = require('path');
const chalk = require('chalk');
const fs = require('fs');

const buildPaths = [
  path.join(__dirname, '../../src/dist/main.prod.js'),
  path.join(__dirname, '../../src/dist/renderer.ui.prod.js'),
  path.join(__dirname, '../../src/dist/renderer.recorder.prod.js'),
  path.join(__dirname, '../../src/dist/renderer.recorder.worker.prod.js'),
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
