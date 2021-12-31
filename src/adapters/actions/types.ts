import { CaptureMode } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import { ICaptureOptions, IRecordOptions } from '@core/entities/capture';

export interface IActionDispatcher {
  initializeApp(): void;
  checkForUpdates(): void;
  downloadAndInstall(): void;
  showAbout(): void;
  showHelp(): void;
  quitApplication(): void;
  openPreferences(): void;
  toggleRecordOptions(recordOptions: IRecordOptions): void;
  enableCaptureMode(captureMode?: CaptureMode): void;
  disableCaptureMode(): void;
  changeCaptureOptions(options: ICaptureOptions): void;
  startTargetSelection(): void;
  finishTargetSelection(targetBounds: IBounds): void;
  startCapture(): void;
  startCaptureWithCurrentStates(): void;
  finishCapture(): void;
  onCaptureToggleShortcut(): void;
}
