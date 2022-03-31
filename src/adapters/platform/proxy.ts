import { injectable } from 'inversify';
import { app, screen, ipcMain } from 'electron';

import { Point } from '@domain/models/screen';

import { PlatformApi, PathType } from '@application/ports/platform';

import { isMac } from '@utils/process';

@injectable()
export default class PlatformApiProxy implements PlatformApi {
  constructor() {
    ipcMain.on('getAppPath', (event, name) => {
      event.returnValue = this.getAppPath(name);
    });

    ipcMain.on('getCursorScreenPoint', (event) => {
      event.returnValue = this.getCursorScreenPoint();
    });
  }

  getAppPath(name: PathType): string {
    return app.getPath(name);
  }

  getCursorScreenPoint(): Point {
    if (isMac()) {
      // because mac doesn't support dipToScreenPoint
      return screen.getCursorScreenPoint();
    }
    return screen.dipToScreenPoint(screen.getCursorScreenPoint());
  }
}
