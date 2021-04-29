/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { dialog, BrowserWindow } from 'electron';
import { injectable } from 'inversify';

import { AppTray } from '@presenters/ui/tray';

@injectable()
export class UiDirector {
  private appTray!: AppTray;
  private preferencesWindow!: BrowserWindow;
  private overlaysWindow!: BrowserWindow;

  register(tray: AppTray, preferences: BrowserWindow, overlays: BrowserWindow) {
    this.appTray = tray;
    this.preferencesWindow = preferences;
    this.overlaysWindow = overlays;
  }

  quitApplication() {
    process.exit();
  }

  openPreferencesWindow() {
    this.preferencesWindow.show();
  }

  closePreferencesWindow() {
    this.preferencesWindow.hide();
  }

  async openDialogForRecordHomeDir(): Promise<string> {
    const { filePaths } = await dialog.showOpenDialog(this.preferencesWindow, {
      properties: ['openDirectory'],
    });

    return filePaths.length > 0 ? filePaths[0] : '';
  }
}
