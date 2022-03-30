import { injectable } from 'inversify';
import { ipcRenderer } from 'electron';

import { IPoint } from '@core/entities/screen';
import { IRemote, PathType } from '@adapters/remote/types';

@injectable()
export default class RemoteClient implements IRemote {
  getAppPath(name: PathType): string {
    return ipcRenderer.sendSync('getAppPath', name);
  }

  getCursorScreenPoint(): IPoint {
    return ipcRenderer.sendSync('getCursorScreenPoint');
  }
}
