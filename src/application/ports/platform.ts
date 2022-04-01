import { Point } from '@domain/models/screen';

export type PathType =
  | 'home'
  | 'appData'
  | 'userData'
  | 'cache'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'recent'
  | 'logs'
  | 'crashDumps';

export interface PlatformApi {
  getAppPath(name: PathType): string;
  getCursorScreenPoint(): Point;
}
