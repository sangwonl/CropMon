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
import { IBounds } from '@core/entities/screen';
import { isProduction } from '@utils/process';

import { RecorderRendererDelegate } from './recorder-delegate';

@injectable()
export class ElectronScreenRecorder implements IScreenRecorder {
  ffmpeg?: FFmpeg;
  recorderDelegate?: BrowserWindow;

  constructor() {
    this.initializeFFmpeg();

    app.whenReady().then(() => {
      this.renewBuildRenderer();
      this.recorderDelegate = new RecorderRendererDelegate();
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
      const onRecordingFileSaved = async (_event: any, data: any) => {
        clearIpcListeners();

        await this.cropWithFfmpeg(
          data.tempFilePath,
          outPath,
          targetDisplay.bounds,
          targetBounds
        );

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

  private inferVideoCodec(outPath: string): string {
    const ext = path.extname(outPath);
    switch (ext) {
      case '.webm':
        return 'libvpx-vp9';
      case '.mp4':
        return 'libx264';
      default:
        return 'libx264';
    }
  }

  private async cropWithFfmpeg(
    tempPath: string,
    outputPath: string,
    displayBounds: IBounds,
    targetBounds: IBounds
  ) {
    const skipCrop =
      targetBounds.width === displayBounds.width &&
      targetBounds.height === displayBounds.height;
    if (skipCrop) {
      await fs.promises.rename(tempPath, outputPath);
      fs.unlink(tempPath, () => {});
      return;
    }

    const { x, y, width, height } = targetBounds;
    const memInputName = path.basename(tempPath);
    const memOutputName = path.basename(outputPath);

    try {
      this.ffmpeg!.FS('writeFile', memInputName, await fetchFile(tempPath));

      await this.ffmpeg!.run(
        '-i',
        memInputName,
        '-vf',
        `crop=${width}:${height}:${x}:${y}`,
        '-c:v',
        `${this.inferVideoCodec(outputPath)}`,
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
