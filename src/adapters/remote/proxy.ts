/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { app, screen, ipcMain } from 'electron';

import { IPoint } from '@core/entities/screen';
import { IRemote, PathType } from '@adapters/remote/types';
import { isMac } from '@utils/process';

@injectable()
export class RemoteProxy implements IRemote {
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

  getCursorScreenPoint(): IPoint {
    if (isMac()) {
      // because mac doesn't support dipToScreenPoint
      return screen.getCursorScreenPoint();
    }
    return screen.dipToScreenPoint(screen.getCursorScreenPoint());
  }
}
