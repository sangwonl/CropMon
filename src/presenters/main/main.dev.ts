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

import { initializeSaga } from '@presenters/redux/store-main';
import { MainWindowBuilder } from '@presenters/ui/main/builder';
import { AppTray } from '@presenters/ui/tray';
import { AppTrayBuilder } from '@presenters/ui/tray/builder';

import { AppUpdater } from './updater';
import { initializeDevTools } from './debug';
import { assetResolver } from './asset';
import { configureShortcuts } from './shortcut';

let tray: AppTray;

const initializeApp = () => {
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  configureShortcuts();

  // app.on('window-all-closed', () => {
  //   // Respect the OSX convention of having the application in memory even
  //   // after all windows have been closed
  //   if (process.platform !== 'darwin') {
  //     app.quit();
  //   }
  // });

  // app.on('activate', () => {
  //   createMainWindow();
  // });
};

const initializeWindows = () => {
  new MainWindowBuilder(assetResolver).build();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tray = new AppTrayBuilder(assetResolver).build();
};

const start = async () => {
  await initializeDevTools();

  initializeSaga();

  initializeApp();

  initializeWindows();
};

app.whenReady().then(start).catch(console.log);
