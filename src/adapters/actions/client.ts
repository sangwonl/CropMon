/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';
import { ipcRenderer } from 'electron';

import { IRecordOptions, ICaptureOptions } from '@core/entities/capture';
import { CaptureMode } from '@core/entities/common';
import { IBounds } from '@core/entities/screen';
import { IActionDispatcher } from '@adapters/actions/types';

@injectable()
export class ActionDispatcherClient implements IActionDispatcher {
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
    ipcRenderer.send('disableCaptureMode');
  }

  changeCaptureOptions(options: ICaptureOptions): void {
    ipcRenderer.send('changeCaptureOptions', options);
  }

  startTargetSelection(): void {
    ipcRenderer.send('startTargetSelection');
  }

  finishTargetSelection(targetBounds: IBounds): void {
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
}
