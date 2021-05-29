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

import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import { BrowserWindow, Display, screen, ipcMain, app } from 'electron';
import { injectable } from 'inversify';
import {
  createFFmpeg,
  CreateFFmpegOptions,
  fetchFile,
  FFmpeg,
} from '@ffmpeg/ffmpeg';

import { ICaptureContext } from '@core/entities/capture';
import { IScreenRecorder } from '@core/components/recorder';
import { isProduction } from '@utils/process';

import { RecorderRendererDelegate } from './recorder-delegate';

@injectable()
export class ElectronScreenRecorder implements IScreenRecorder {
  ffmpeg?: FFmpeg;
  recorderDelegate?: BrowserWindow;

  constructor() {
    this.initializeFFmpeg();

    app.whenReady().then(() => this.renewBuildRenderer());
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

    return new Promise((resolve, reject) => {
      const onRecordingStarted = (_event: any) => {
        clearIpcListeners();
        resolve();
      };

      const onRecordingFailed = (_event: any, _data: any) => {
        clearIpcListeners();
        reject();
      };

      const setupIpcListeners = () => {
        ipcMain.on('recording-started', onRecordingStarted);
        ipcMain.on('recording-failed', onRecordingFailed);
      };

      const clearIpcListeners = () => {
        ipcMain.off('recording-started', onRecordingStarted);
        ipcMain.off('recording-failed', onRecordingFailed);
      };

      setupIpcListeners();

      const args = {
        screenId,
        screenBounds: targetDisplay.bounds,
        targetBounds,
      };
      this.recorderDelegate?.webContents.send('start-record', args);
    });
  }

  async finish(ctx: ICaptureContext): Promise<void> {
    const outPath = ctx.outputPath!;

    return new Promise((resolve, reject) => {
      const onRecordingFileSaved = async (_event: any, data: any) => {
        clearIpcListeners();
        await this.postProcessWithFFmpeg(data.tempFilePath, outPath);
        this.renewBuildRenderer();
        resolve();
      };

      const onRecordingFailed = (_event: any, _data: any) => {
        clearIpcListeners();
        this.renewBuildRenderer();
        reject();
      };

      const setupIpcListeners = () => {
        ipcMain.on('recording-file-saved', onRecordingFileSaved);
        ipcMain.on('recording-failed', onRecordingFailed);
      };

      const clearIpcListeners = () => {
        ipcMain.off('recording-file-saved', onRecordingFileSaved);
        ipcMain.off('recording-failed', onRecordingFailed);
      };

      setupIpcListeners();

      this.recorderDelegate?.webContents.send('stop-record', {
        outputPath: outPath,
      });
    });
  }

  private initializeFFmpeg() {
    const ffmpegOptions: CreateFFmpegOptions = {
      log: true,
      logger: ({ message }) => log.debug(message),
    };

    if (isProduction()) {
      ffmpegOptions.corePath = path.join(
        app.getAppPath(),
        '..',
        'ffmpegwasm-core',
        'ffmpeg-core.js'
      );
    }

    this.ffmpeg = createFFmpeg(ffmpegOptions);
    this.ffmpeg!.load();
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }

  private async postProcessWithFFmpeg(tempPath: string, outputPath: string) {
    const memInputName = path.basename(tempPath);
    const memOutputName = path.basename(outputPath);

    try {
      this.ffmpeg!.FS('writeFile', memInputName, await fetchFile(tempPath));

      await this.ffmpeg!.run(
        '-i',
        memInputName,
        '-c',
        'copy',
        '-r',
        '30',
        memOutputName
      );

      await fs.promises.writeFile(
        outputPath,
        this.ffmpeg!.FS('readFile', memOutputName)
      );
    } catch (e) {
      log.error(e);
    } finally {
      fs.unlink(tempPath, () => {});
    }
  }
}
