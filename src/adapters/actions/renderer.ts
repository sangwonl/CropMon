import { ipcRenderer } from 'electron';
import { injectable } from 'inversify';

import { CaptureOptions } from '@domain/models/capture';
import { Bounds, Point } from '@domain/models/screen';

import { UiState } from '@application/models/ui';
import { ActionDispatcher } from '@application/ports/action';

@injectable()
export default class ActionDispatcherForRenderer implements ActionDispatcher {
  initializeApp(): void {
    throw new Error('Method not implemented.');
  }

  checkForUpdates(): void {
    throw new Error('Method not implemented.');
  }

  downloadAndInstall(): void {
    throw new Error('Method not implemented.');
  }

  showHelp(): void {
    throw new Error('Method not implemented.');
  }

  quitApplication(): void {
    throw new Error('Method not implemented.');
  }

  openPreferences(): void {
    throw new Error('Method not implemented.');
  }

  openCaptureFolder(): void {
    throw new Error('Method not implemented.');
  }

  enableCaptureMode(): void {
    throw new Error('Method not implemented.');
  }

  disableCaptureMode(): void {
    ipcRenderer.send('disableCaptureMode');
  }

  changeCaptureOptions(options: CaptureOptions): void {
    ipcRenderer.send('changeCaptureOptions', options);
  }

  startTargetSelection(targetBounds: Bounds, cursorPosition: Point): void {
    ipcRenderer.send('startTargetSelection', targetBounds, cursorPosition);
  }

  selectingTarget(targetBounds: Bounds, cursorPosition: Point): void {
    ipcRenderer.send('selectingTarget', targetBounds, cursorPosition);
  }

  finishTargetSelection(targetBounds: Bounds): void {
    ipcRenderer.send('finishTargetSelection', targetBounds);
  }

  startCapture(): void {
    ipcRenderer.send('startCapture');
  }

  startCaptureWithCurrentStates(): void {
    throw new Error('Method not implemented.');
  }

  finishCapture(): void {
    throw new Error('Method not implemented.');
  }

  onCaptureToggleShortcut(): void {
    throw new Error('Method not implemented.');
  }

  getUiState(): UiState {
    return ipcRenderer.sendSync('getUiState');
  }
}
