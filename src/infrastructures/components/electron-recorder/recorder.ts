/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable promise/param-names */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable radix */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { BrowserWindow, Display, screen, ipcMain, app } from 'electron';
import { injectable } from 'inversify';

import { ICaptureContext } from '@core/entities/capture';
import { IScreenRecorder } from '@core/components/recorder';

import { RecorderRendererDelegate } from './recorder-delegate';

@injectable()
export class ElectronScreenRecorder implements IScreenRecorder {
  recorderDelegate?: BrowserWindow;

  constructor() {
    app.whenReady().then(() => {
      this.renewBuildRenderer();
      this.recorderDelegate = new RecorderRendererDelegate();
      this.recorderDelegate.webContents.openDevTools();
    });
  }

  renewBuildRenderer() {
    this.recorderDelegate?.destroy();
    this.recorderDelegate = new RecorderRendererDelegate();
  }

  async record(ctx: ICaptureContext): Promise<void> {
    const { screenId, bounds: targetBounds } = ctx.target;
    const targetDisplay = this.getDisplay(screenId);
    if (targetDisplay === undefined || targetBounds === undefined) {
      return Promise.reject();
    }

    const { bounds: dispBounds } = targetDisplay;
    const screenWidth = dispBounds.width;
    const screenHeight = dispBounds.height;

    return new Promise((resolve, reject) => {
      const onRecordingStarted = (_event: any) => {
        clearIpcListeners();
        resolve();
      };

      const onRecordingFail = (_event: any, _data: any) => {
        clearIpcListeners();
        reject();
      };

      const setupIpcListeners = () => {
        ipcMain.on('recording-started', onRecordingStarted);
        ipcMain.on('recording-fail', onRecordingFail);
      };

      const clearIpcListeners = () => {
        ipcMain.off('recording-started', onRecordingStarted);
        ipcMain.off('recording-fail', onRecordingFail);
      };

      setupIpcListeners();

      const args = { screenId, screenWidth, screenHeight };
      this.recorderDelegate?.webContents.send('start-record', args);
    });
  }

  async finish(ctx: ICaptureContext): Promise<void> {
    const outPath = ctx.outputPath!;
    const { screenId, bounds: targetBounds } = ctx.target;
    const targetDisplay = this.getDisplay(screenId);
    if (targetDisplay === undefined || targetBounds === undefined) {
      return Promise.reject();
    }

    return new Promise((resolve, _reject) => {
      const onRecordingFileSaved = (_event: any, _data: any) => {
        clearIpcListeners();
        this.renewBuildRenderer();
        resolve();
      };

      const setupIpcListeners = () => {
        ipcMain.on('recording-file-saved', onRecordingFileSaved);
      };

      const clearIpcListeners = () => {
        ipcMain.off('recording-file-saved', onRecordingFileSaved);
      };

      setupIpcListeners();

      this.recorderDelegate?.webContents.send('stop-record', {
        outputPath: outPath,
        displayBounds: targetDisplay.bounds,
        targetBounds,
      });
    });
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }
}
