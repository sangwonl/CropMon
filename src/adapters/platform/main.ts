import { app, screen, ipcMain, dialog, BrowserWindow } from 'electron';
import { injectable } from 'inversify';

import { isMac } from '@utils/process';

import { Point } from '@domain/models/screen';

import { PlatformApi, PathType } from '@application/ports/platform';

@injectable()
export default class PlatformApiForMain implements PlatformApi {
  constructor() {
    ipcMain.on('getPath', (event, name) => {
      event.returnValue = this.getPath(name);
    });

    ipcMain.on('getCursorScreenPoint', event => {
      event.returnValue = this.getCursorScreenPoint();
    });

    ipcMain.on('promptDirectory', async (event, defaultPath) => {
      event.returnValue = await this.promptDirectory(defaultPath);
    });
  }

  getPath(name: PathType): string {
    if (name === 'app') {
      return app.getAppPath();
    }
    return app.getPath(name);
  }

  getCursorScreenPoint(): Point {
    if (isMac()) {
      // because mac doesn't support dipToScreenPoint
      return screen.getCursorScreenPoint();
    }
    return screen.dipToScreenPoint(screen.getCursorScreenPoint());
  }

  async promptDirectory(defaultPath: string): Promise<string> {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) {
      return defaultPath;
    }

    const { filePaths } = await dialog.showOpenDialog(window, {
      defaultPath,
      properties: ['openDirectory'],
    });

    if (filePaths.length > 0) {
      return filePaths[0];
    }

    return defaultPath;
  }
}
