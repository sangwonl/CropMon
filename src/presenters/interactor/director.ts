/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import { app, BrowserWindow } from 'electron';
import { injectable } from 'inversify';

import { AppTray } from '@presenters/ui/tray';

@injectable()
export class UiDirector {
  private appTray!: AppTray;
  private preferencesWindow!: BrowserWindow;

  register(tray: AppTray, main: BrowserWindow) {
    this.appTray = tray;
    this.preferencesWindow = main;
  }

  quitApplication() {
    app.quit();
  }

  openPreferencesWindow() {
    this.preferencesWindow.show();
  }
}
