import { Bounds } from '@domain/models/screen';
import { CaptureOptions, RecordOptions } from '@domain/models/capture';

export interface ActionDispatcher {
  initializeApp(): void;
  checkForUpdates(): void;
  downloadAndInstall(): void;
  showAbout(): void;
  showHelp(): void;
  quitApplication(): void;
  openPreferences(): void;
  toggleRecordOptions(recordOptions: RecordOptions): void;
  enableCaptureMode(): void;
  disableCaptureMode(): void;
  changeCaptureOptions(options: CaptureOptions): void;
  startTargetSelection(): void;
  finishTargetSelection(targetBounds: Bounds): void;
  startCapture(): void;
  finishCapture(): void;
  onCaptureToggleShortcut(): void;
}
