import { injectable } from 'inversify';
import { ipcRenderer } from 'electron';

import { Point } from '@domain/models/screen';

import { PlatformApi, PathType } from '@application/ports/platform';

@injectable()
export default class PlatformApiClient implements PlatformApi {
  getAppPath(name: PathType): string {
    return ipcRenderer.sendSync('getAppPath', name);
  }

  getCursorScreenPoint(): Point {
    return ipcRenderer.sendSync('getCursorScreenPoint');
  }
}
