import { ipcMain } from 'electron';
import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureOptions } from '@domain/models/capture';
import { License } from '@domain/models/license';
import { Preferences } from '@domain/models/preferences';
import { Bounds, Point } from '@domain/models/screen';

import { UiState } from '@application/models/ui';
import { ActionDispatcher } from '@application/ports/action';

@injectable()
export default class ActionDispatcherForMain implements ActionDispatcher {
  constructor(
    @inject(TYPES.ActionDispatcher) private actionDispatcher: ActionDispatcher
  ) {
    ipcMain.on('disableCaptureMode', () => this.disableCaptureMode());
    ipcMain.on(
      'startTargetSelection',
      (_event, targetBounds, cursorPosition): void => {
        this.startTargetSelection(targetBounds, cursorPosition);
      }
    );
    ipcMain.on(
      'selectingTarget',
      (_event, targetBounds, cursorPosition): void => {
        this.selectingTarget(targetBounds, cursorPosition);
      }
    );
    ipcMain.on('finishTargetSelection', (_event, targetBounds): void => {
      this.finishTargetSelection(targetBounds);
    });
    ipcMain.on('startCapture', () => this.startCapture());
    ipcMain.on('changeCaptureOptions', (_event, options) => {
      this.changeCaptureOptions(options);
    });
    ipcMain.on('getUiState', (event) => {
      event.returnValue = this.getUiState();
    });
    ipcMain.on('savePreferences', async (event, prefs: Preferences) => {
      event.returnValue = await this.savePreferences(prefs);
    });
    ipcMain.on('getLicense', async (event) => {
      event.returnValue = await this.getLicense();
    });
  }

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
    this.actionDispatcher.openCaptureFolder();
  }

  enableCaptureMode(): void {
    throw new Error('Method not implemented.');
  }

  disableCaptureMode(): void {
    this.actionDispatcher.disableCaptureMode();
  }

  changeCaptureOptions(options: CaptureOptions): void {
    this.actionDispatcher.changeCaptureOptions(options);
  }

  startTargetSelection(targetBounds: Bounds, cursorPosition: Point): void {
    this.actionDispatcher.startTargetSelection(targetBounds, cursorPosition);
  }

  selectingTarget(targetBounds: Bounds, cursorPosition: Point): void {
    this.actionDispatcher.selectingTarget(targetBounds, cursorPosition);
  }

  finishTargetSelection(targetBounds: Bounds): void {
    this.actionDispatcher.finishTargetSelection(targetBounds);
  }

  startCapture(): void {
    this.actionDispatcher.startCapture();
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
    return this.actionDispatcher.getUiState();
  }

  savePreferences(prefs: Preferences): Promise<Preferences> {
    return this.actionDispatcher.savePreferences(prefs);
  }

  getLicense(): Promise<License | null> {
    return this.actionDispatcher.getLicense();
  }
}
