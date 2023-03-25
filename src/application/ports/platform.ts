import { Point } from '@domain/models/screen';

export type PathType =
  | 'home'
  | 'appData'
  | 'userData'
  | 'sessionData'
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
  | 'crashDumps'
  | 'app'; // custom

export interface PlatformApi {
  getPath(name: PathType): string;
  getCursorScreenPoint(): Point;
  promptDirectory(defaultPath: string): Promise<string>;
}
