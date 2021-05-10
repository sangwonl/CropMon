import 'reflect-metadata';

import { IScreenInfo } from '@core/entities/screen';
import { AssetResolverFunc } from '@presenters/common/asset';

export interface UiDirector {
  intialize(assetResolver: AssetResolverFunc): void;
  quitApplication(): void;
  openPreferencesWindow(): void;
  closePreferencesWindow(): void;
  openDialogForRecordHomeDir(path?: string): Promise<string>;
  enableCaptureSelection(): Array<IScreenInfo>;
  disableCaptureSelection(): void;
  showItemInFolder(path: string): void;
}
