import 'reflect-metadata';

import { ScreenInfo } from '@core/entities/screen';
import { AssetResolverFunc } from '@presenters/common/asset';

export interface UiDirector {
  intialize(assetResolver: AssetResolverFunc): void;
  quitApplication(): void;
  openPreferencesWindow(): void;
  closePreferencesWindow(): void;
  openDialogForRecordHomeDir(): Promise<string>;
  enableCaptureSelectionMode(): Array<ScreenInfo>;
}
