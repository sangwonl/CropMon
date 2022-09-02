import { app, screen, ipcMain } from 'electron';
import { injectable } from 'inversify';

import { isMac } from '@utils/process';

import { Point } from '@domain/models/screen';

import { PlatformApi, PathType } from '@application/ports/platform';

@injectable()
export default class PlatformApiProxy implements PlatformApi {
  constructor() {
    ipcMain.on('getPath', (event, name) => {
      event.returnValue = this.getPath(name);
    });

    ipcMain.on('getCursorScreenPoint', (event) => {
      event.returnValue = this.getCursorScreenPoint();
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
}
