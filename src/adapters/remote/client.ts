import { injectable } from 'inversify';
import { ipcRenderer } from 'electron';

import { Point } from '@domain/models/screen';

import { IRemote, PathType } from '@application/ports/remote';

@injectable()
export default class RemoteClient implements IRemote {
  getAppPath(name: PathType): string {
    return ipcRenderer.sendSync('getAppPath', name);
  }

  getCursorScreenPoint(): Point {
    return ipcRenderer.sendSync('getCursorScreenPoint');
  }
}
