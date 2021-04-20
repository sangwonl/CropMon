/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { Tray, nativeImage, BrowserWindow, Menu } from 'electron';

export abstract class AppTray {
  mainWindow: BrowserWindow;

  tray: Tray;

  constructor(iconPath: string, mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.tray = new Tray(nativeImage.createFromPath(iconPath));
    this.tray.setContextMenu(this.buildContextMenu());
  }

  protected abstract buildContextMenu(): Menu;

  // eslint-disable-next-line class-methods-use-this
  protected onStartRecording(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected onPreferences(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected onQuit(): void {}

  static forWindows(iconPath: string, mainWindow: BrowserWindow): AppTray {
    return new WinAppTray(iconPath, mainWindow);
  }

  static forMac(iconPath: string, mainWindow: BrowserWindow): AppTray {
    return new MacAppTray(iconPath, mainWindow);
  }
}

class WinAppTray extends AppTray {
  // eslint-disable-next-line class-methods-use-this
  protected buildContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Start &Recording',
        click: super.onStartRecording,
      },
      {
        label: '&Preferences',
        click: super.onPreferences,
      },
      {
        label: '&Quit',
        click: super.onQuit,
      },
    ]);
  }
}

class MacAppTray extends AppTray {
  // eslint-disable-next-line class-methods-use-this
  protected buildContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Start Recording',
        click: super.onStartRecording,
      },
      {
        label: 'Preferences',
        click: super.onPreferences,
      },
      {
        label: 'Quit',
        click: super.onQuit,
      },
    ]);
  }
}
