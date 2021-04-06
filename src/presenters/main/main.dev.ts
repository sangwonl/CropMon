/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { app } from 'electron';

import AppUpdater from './updater';
import { initializeDevTools } from './debug';
import { initializeStore } from '../redux/store';

import { assetResolver } from './asset';
import MainWindowBuilder from '../renderers/main/builder';

const createWindow = async () => {
  new MainWindowBuilder(assetResolver).build();
};

const initializeApp = () => {
  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    createWindow();
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

const initializeWindows = () => {
  createWindow();
};

const start = async () => {
  await initializeDevTools();

  initializeStore();

  initializeApp();

  initializeWindows();
};

app.whenReady().then(start).catch(console.log);
