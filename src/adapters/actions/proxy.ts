import { inject, injectable } from 'inversify';
import { ipcMain } from 'electron';

import TYPES from '@di/types';

import { RecordOptions, CaptureOptions } from '@domain/models/capture';
import { Bounds, Point } from '@domain/models/screen';

import { ActionDispatcher } from '@application/ports/action';

@injectable()
export default class ActionDispatcherProxy implements ActionDispatcher {
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

  showAbout(): void {
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

  toggleRecordOptions(_recordOptions: RecordOptions): void {
    throw new Error('Method not implemented.');
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
}
