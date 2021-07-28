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
import { ipcMain, app } from 'electron';
import { injectable } from 'inversify';
import {
  createFFmpeg,
  CreateFFmpegOptions,
  fetchFile,
  FFmpeg,
} from '@ffmpeg/ffmpeg';

import { IBounds } from '@core/entities/screen';
import { ICaptureContext } from '@core/entities/capture';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { isProduction } from '@utils/process';
import {
  getAllScreensFromLeftTop,
  getIntersection,
  isEmptyBounds,
} from '@utils/bounds';

import { RecorderDelegate } from './rec-delegate';
import { IRecordContext, ITargetSlice } from './rec-delegate/types';

@injectable()
export class ElectronScreenRecorder implements IScreenRecorder {
  ffmpeg?: FFmpeg;
  delegate?: RecorderDelegate;

  constructor() {
    this.initializeFFmpeg();

    app.whenReady().then(() => this.renewBuildRenderer());
  }

  renewBuildRenderer() {
    this.delegate?.destroy();
    this.delegate = new RecorderDelegate();
    // this.delegate.webContents.openDevTools();
  }

  async record(ctx: ICaptureContext): Promise<void> {
    const { bounds: targetBounds } = ctx.target;
    if (targetBounds === undefined || isEmptyBounds(targetBounds)) {
      return Promise.reject();
    }

    const recordCtx = this.createRecordContext(targetBounds);
    if (recordCtx === undefined) {
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

      this.delegate?.webContents.send('start-record', {
        recordContext: recordCtx,
      });
    });
  }

  async finish(ctx: ICaptureContext): Promise<void> {
    const outPath = ctx.outputPath!;

    return new Promise((resolve, reject) => {
      const onRecordingFileSaved = async (_event: any, data: any) => {
        clearIpcListeners();
        await this.postProcess(data.tempFilePath, outPath);
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

      this.delegate?.webContents.send('stop-record', {
        outputPath: outPath,
      });
    });
  }

  private createRecordContext(targetBounds: IBounds): IRecordContext {
    const screens = getAllScreensFromLeftTop();
    const targetSlices = screens
      .filter((s) => !isEmptyBounds(getIntersection(s.bounds, targetBounds)))
      .map((s): ITargetSlice => {
        return { screen: s, bounds: getIntersection(s.bounds, targetBounds)! };
      });

    return { targetSlices, targetBounds };
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

  private async postProcess(tempPath: string, outputPath: string) {
    fs.renameSync(tempPath, outputPath);
    // await this.postProcessWithFFmpeg(tempPath, outputPath);
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
