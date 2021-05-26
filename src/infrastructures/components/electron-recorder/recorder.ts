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

import log from 'electron-log';
import { BrowserWindow, Display, screen, ipcMain, app } from 'electron';
import { injectable } from 'inversify';
import Ffmpeg from 'fluent-ffmpeg';

import { ICaptureContext } from '@core/entities/capture';
import { IScreenRecorder } from '@core/components/recorder';
import { getPathToFfmpeg, inferVideoCodec } from '@utils/ffmpeg';

import { RecorderRendererBuilder } from './builder';

@injectable()
export class ElectronScreenRecorder implements IScreenRecorder {
  recorderDelegate?: BrowserWindow;

  constructor() {
    app.whenReady().then(() => {
      this.renewBuildRenderer();
    });
  }

  renewBuildRenderer() {
    this.recorderDelegate?.destroy();
    this.recorderDelegate = new RecorderRendererBuilder().build();
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

    const { x, y, width, height } = targetBounds!;
    const { bounds: display } = targetDisplay;
    const shouldCrop = width !== display.width || height !== display.height;

    return new Promise((resolve, reject) => {
      const onRecordingFileSaved = (_event: any, data: any) => {
        clearIpcListeners();

        const { filePath: tmpFilePath } = data;
        let ffmpegCmd = Ffmpeg()
          .setFfmpegPath(getPathToFfmpeg())
          .input(tmpFilePath)
          .videoCodec(inferVideoCodec(outPath))
          .withOptions(['-r 30'])
          .on('start', (cmd) => {
            log.info(cmd);
          })
          .on('end', (stdout, stderr) => {
            log.info(stdout);
            log.error(stderr);
            fs.unlink(tmpFilePath, () => {});
            resolve();
          })
          .on('error', (error, _stdout, stderr) => {
            log.error(error);
            log.error(stderr);
            reject();
          });

        if (shouldCrop) {
          ffmpegCmd = ffmpegCmd.withVideoFilter(
            `crop=${width}:${height}:${x}:${y}`
          );
        }

        ffmpegCmd.save(outPath);

        this.renewBuildRenderer();
      };

      const setupIpcListeners = () => {
        ipcMain.on('recording-file-saved', onRecordingFileSaved);
      };

      const clearIpcListeners = () => {
        ipcMain.off('recording-file-saved', onRecordingFileSaved);
      };

      setupIpcListeners();

      this.recorderDelegate?.webContents.send('stop-record', {});
    });
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }
}
