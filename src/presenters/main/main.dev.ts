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

import { app, globalShortcut } from 'electron';

import store, { initializeSaga } from '@presenters/redux/store-main';
import MainWindowBuilder from '@presenters/renderers/main/builder';
import {
  configuringCaptureParams,
  finishCapture,
} from '@presenters/redux/capture/slice';

import AppUpdater from './updater';
import { initializeDevTools } from './debug';
import { assetResolver } from './asset';

const createWindow = async () => {
  new MainWindowBuilder(assetResolver).build();
};

const configureShortcuts = () => {
  interface ShortcutHandler {
    shortcut: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: any;
  }

  interface PlatformShortcuts {
    [platform: string]: Array<ShortcutHandler>;
  }

  const handleCapture = () => {
    store.dispatch(configuringCaptureParams());
  };

  const handleFinishCapture = () => {
    store.dispatch(finishCapture());
  };

  const platformShortcuts: PlatformShortcuts = {
    win32: [
      { shortcut: 'Alt+Control+4', handler: handleCapture },
      { shortcut: 'Alt+Control+5', handler: handleFinishCapture },
    ],
    darwin: [],
  };

  if (!Object.keys(platformShortcuts).includes(process.platform)) {
    console.error('not support platform..');
  }

  platformShortcuts[process.platform].forEach((s) => {
    globalShortcut.register(s.shortcut, s.handler);
  });
};

const initializeApp = () => {
  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  configureShortcuts();

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
};

const initializeWindows = () => {
  createWindow();
};

const start = async () => {
  await initializeDevTools();

  initializeSaga();

  initializeApp();

  initializeWindows();
};

app.whenReady().then(start).catch(console.log);
