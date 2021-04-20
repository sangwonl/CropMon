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

import { app, BrowserWindow, globalShortcut } from 'electron';

import { CaptureStatus } from '@core/entities/capture';
import store, { RootState, initializeSaga } from '@presenters/redux/store-main';
import MainWindowBuilder from '@presenters/renderers/main/builder';
import TrayBuilder from '@presenters/renderers/tray/builder';
import { AppTray } from '@presenters/renderers/tray/tray';
import {
  configuringCaptureParams,
  finishCapture,
} from '@presenters/redux/capture/slice';

import AppUpdater from './updater';
import { initializeDevTools } from './debug';
import { assetResolver } from './asset';

let tray: AppTray;

const configureShortcuts = () => {
  interface ShortcutHandler {
    shortcut: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: any;
  }

  interface PlatformShortcuts {
    [platform: string]: Array<ShortcutHandler>;
  }

  const handleCaptureShortcut = () => {
    const state: RootState = store.getState();
    if (state.capture.curCaptureCtx?.status === CaptureStatus.IN_PROGRESS) {
      store.dispatch(finishCapture());
    } else {
      store.dispatch(configuringCaptureParams());
    }
  };

  const platformShortcuts: PlatformShortcuts = {
    win32: [{ shortcut: 'Super+Shift+R', handler: handleCaptureShortcut }],
    darwin: [],
  };

  if (!Object.keys(platformShortcuts).includes(process.platform)) {
    console.error('not support platform..');
  }

  platformShortcuts[process.platform].forEach((s) => {
    globalShortcut.register(s.shortcut, s.handler);
  });
};

const createMainWindow = (): BrowserWindow => {
  return new MainWindowBuilder(assetResolver).build();
};

const createAppTray = (mainWindow: BrowserWindow): AppTray => {
  return new TrayBuilder(assetResolver, mainWindow).build();
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
    createMainWindow();
  });
};

const initializeWindows = () => {
  const mainWindow = createMainWindow();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tray = createAppTray(mainWindow);
};

const start = async () => {
  await initializeDevTools();

  initializeSaga();

  initializeApp();

  initializeWindows();
};

app.whenReady().then(start).catch(console.log);
