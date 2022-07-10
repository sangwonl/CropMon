import { Bounds, Point } from '@domain/models/screen';
import { CaptureOptions, RecordOptions } from '@domain/models/capture';

export interface ActionDispatcher {
  initializeApp(): void;
  checkForUpdates(): void;
  downloadAndInstall(): void;
  showAbout(): void;
  showHelp(): void;
  quitApplication(): void;
  openPreferences(): void;
  openCaptureFolder(): void;
  toggleRecordOptions(recordOptions: RecordOptions): void;
  enableCaptureMode(): void;
  disableCaptureMode(): void;
  changeCaptureOptions(options: CaptureOptions): void;
  startTargetSelection(targetBounds: Bounds, cursorPosition: Point): void;
  selectingTarget(targetBounds: Bounds, cursorPosition: Point): void;
  finishTargetSelection(targetBounds: Bounds): void;
  startCapture(): void;
  startCaptureWithCurrentStates(): void;
  finishCapture(): void;
  onCaptureToggleShortcut(): void;
}
