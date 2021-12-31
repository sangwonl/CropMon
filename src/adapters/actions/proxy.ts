/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { ipcMain } from 'electron';

import { IRecordOptions, ICaptureOptions } from '@core/entities/capture';
import { CaptureMode } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import { IActionDispatcher } from '@adapters/actions/types';
import { ActionDispatcher } from '@adapters/actions/dispatcher';

@injectable()
export class ActionDispatcherProxy implements IActionDispatcher {
  constructor(private actionDispatcher: ActionDispatcher) {
    ipcMain.on('disableCaptureMode', () => this.disableCaptureMode());
    ipcMain.on('startTargetSelection', () => this.startTargetSelection());
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

  toggleRecordOptions(_recordOptions: IRecordOptions): void {
    throw new Error('Method not implemented.');
  }

  enableCaptureMode(_captureMode?: CaptureMode): void {
    throw new Error('Method not implemented.');
  }

  disableCaptureMode(): void {
    this.actionDispatcher.disableCaptureMode();
  }

  changeCaptureOptions(options: ICaptureOptions): void {
    this.actionDispatcher.changeCaptureOptions(options);
  }

  startTargetSelection(): void {
    this.actionDispatcher.startTargetSelection();
  }

  finishTargetSelection(targetBounds: IBounds): void {
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
