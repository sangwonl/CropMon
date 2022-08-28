import { injectable } from 'inversify';
import { ipcRenderer } from 'electron';

import { Point } from '@domain/models/screen';

import { PlatformApi, PathType } from '@application/ports/platform';

@injectable()
export default class PlatformApiClient implements PlatformApi {
  getPath(name: PathType): string {
    return ipcRenderer.sendSync('getPath', name);
  }

  getCursorScreenPoint(): Point {
    return ipcRenderer.sendSync('getCursorScreenPoint');
  }
}
