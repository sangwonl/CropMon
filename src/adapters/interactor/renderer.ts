import { ipcRenderer } from 'electron';
import { injectable } from 'inversify';

import type { CaptureOptions } from '@domain/models/capture';
import type { Preferences } from '@domain/models/preferences';
import type { Bounds, Point } from '@domain/models/screen';

import type { UiState } from '@application/models/ui';
import type { UseCaseInteractor } from '@application/ports/interactor';

@injectable()
export class UseCaseInteractorForRenderer implements UseCaseInteractor {
  initializeApp(): void {
    throw new Error('Method not implemented.');
  }

  checkForUpdates(): void {
    throw new Error('Method not implemented.');
  }

  downloadAndInstall(): void {
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

  savePreferences(prefs: Preferences): Promise<Preferences> {
    return ipcRenderer.invoke('savePreferences', prefs);
  }

  openExternal(url: string): void {
    ipcRenderer.send('openExternal', url);
  }
}
