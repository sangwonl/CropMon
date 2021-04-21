/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { BrowserWindow } from 'electron';
import { injectable } from 'inversify';

import { AppTray } from '@presenters/ui/tray';

@injectable()
export class UiDirector {
  private appTray!: AppTray;
  private mainWindow!: BrowserWindow;

  register(tray: AppTray, main: BrowserWindow) {
    this.appTray = tray;
    this.mainWindow = main;
  }

  openPreferenceWindow() {
    this.mainWindow.show();
  }
}
