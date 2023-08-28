import { ipcRenderer } from 'electron';
import { injectable } from 'inversify';

import type { Point } from '@domain/models/screen';

import type { PlatformApi, PathType } from '@application/ports/platform';

@injectable()
export class PlatformApiForRenderer implements PlatformApi {
  getPath(name: PathType): string {
    return ipcRenderer.sendSync('getPath', name);
  }

  getCursorScreenPoint(): Point {
    return ipcRenderer.sendSync('getCursorScreenPoint');
  }

  promptDirectory(defaultPath: string): Promise<string> {
    return Promise.resolve(
      ipcRenderer.sendSync('promptDirectory', defaultPath),
    );
  }
}
