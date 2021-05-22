/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable promise/param-names */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable radix */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { exec } from 'child_process';
import fs from 'fs';

import log from 'electron-log';
import { BrowserWindow, Display, screen, ipcMain, app } from 'electron';
import { injectable } from 'inversify';
import Ffmpeg from 'fluent-ffmpeg';

import { ICaptureContext } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { IScreenRecorder } from '@core/components/recorder';
import { getPathToFfmpeg, inferVideoCodec } from '@utils/ffmpeg';

import { RecorderRendererBuilder } from './builder';

@injectable()
export class ElectronScreenRecorder implements IScreenRecorder {
  recorderDelegate!: BrowserWindow;

  constructor() {
    app.whenReady().then(async () => {
      await this.initializeRecorderDelegate();
    });
  }

  async initializeRecorderDelegate(): Promise<void> {
    if (this.recorderDelegate !== undefined) {
      return Promise.resolve();
    }

    this.recorderDelegate = new RecorderRendererBuilder().build();

    return new Promise((resolve, _) => {
      this.recorderDelegate.webContents.on('did-finish-load', () => {
        resolve();
      });
    });
  }

  async record(ctx: ICaptureContext): Promise<void> {
    const { screenId, bounds: targetBounds } = ctx.target;

    const targetDisplay = this.getDisplay(screenId);
    if (targetDisplay === undefined || targetBounds === undefined) {
      return Promise.reject();
    }

    const { bounds: dispBounds, scaleFactor } = targetDisplay;
    const screenWidth = dispBounds.width * scaleFactor;
    const screenHeight = dispBounds.height * scaleFactor;

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
      this.recorderDelegate.webContents.send('start-record', args);
    });
  }

  async finish(ctx: ICaptureContext): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const outPath = ctx.outputPath!;
    const { screenId, bounds: targetBounds } = ctx.target;

    const targetDisplay = this.getDisplay(screenId);
    if (targetDisplay === undefined || targetBounds === undefined) {
      return Promise.reject();
    }

    const wholeScreenBounds = await this.getWholeScreenBounds();
    const { x, y, width, height } = this.adjustBoundsOnDisplay(
      targetDisplay,
      targetBounds,
      wholeScreenBounds
    );

    return new Promise((resolve, reject) => {
      const onRecordingFileSaved = (_event: any, data: any) => {
        clearIpcListeners();

        const { filePath: tmpFilePath } = data;

        Ffmpeg()
          .setFfmpegPath(getPathToFfmpeg())
          .input(tmpFilePath)
          .videoCodec(inferVideoCodec(outPath))
          .withVideoFilter(`crop=${width}:${height}:${x}:${y}`)
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
          })
          .save(outPath);
      };

      const setupIpcListeners = () => {
        ipcMain.on('recording-file-saved', onRecordingFileSaved);
      };

      const clearIpcListeners = () => {
        ipcMain.off('recording-file-saved', onRecordingFileSaved);
      };

      setupIpcListeners();

      this.recorderDelegate.webContents.send('stop-record', {});
    });
  }

  private getDisplay(screenId: number): Display | undefined {
    return screen.getAllDisplays().find((d) => d.id === screenId);
  }

  private getWholeScreenBounds(): Promise<IBounds> {
    return new Promise((resolve, reject) => {
      const cmd = `"${getPathToFfmpeg()}" -f gdigrab -i desktop`;
      exec(cmd, (_error, _stdout, stderr) => {
        const matched = stderr.match(
          /whole desktop as (-?\d+)x(-?\d+).*at \((-?\d+),(-?\d+)\)/
        );
        if (matched === null) {
          reject();
          return;
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const [_, fw, fh, sx, sy] = matched;
        const x = parseInt(sx);
        const y = parseInt(sy);
        resolve({
          x,
          y,
          width: parseInt(fw) + x,
          height: parseInt(fh) + y,
        });
      });
    });
  }

  private adjustBoundsOnDisplay(
    targetDisp: Display,
    bounds: IBounds,
    wholeScreenBounds: IBounds
  ): IBounds {
    const scaledBounds = this.calcScaledScreenBounds(targetDisp);
    const x = Math.floor(scaledBounds.x + bounds.x * targetDisp.scaleFactor);
    const y = Math.floor(scaledBounds.y + bounds.y * targetDisp.scaleFactor);
    const width = Math.floor(bounds.width * targetDisp.scaleFactor);
    const height = Math.floor(bounds.height * targetDisp.scaleFactor);
    return {
      x: Math.max(x, wholeScreenBounds.x),
      y: Math.max(y, wholeScreenBounds.y),
      width: Math.min(width, wholeScreenBounds.width),
      height: Math.min(height, wholeScreenBounds.height),
    };
  }

  private calcScaledScreenBounds(targetDisp: Display): IBounds {
    const primaryDisp = screen.getPrimaryDisplay();
    if (targetDisp === primaryDisp) {
      return {
        x: targetDisp.bounds.x * targetDisp.scaleFactor,
        y: targetDisp.bounds.y * targetDisp.scaleFactor,
        width: targetDisp.bounds.width * targetDisp.scaleFactor,
        height: targetDisp.bounds.height * targetDisp.scaleFactor,
      };
    }

    const scaled = (p: number, s: number) => {
      if (p >= 0) {
        return p * primaryDisp.scaleFactor;
      }

      const unscaledJoint = s + p;
      return (
        unscaledJoint * primaryDisp.scaleFactor - s * targetDisp.scaleFactor
      );
    };

    const { x, y, width, height } = targetDisp.bounds;
    return {
      x: scaled(x, width),
      y: scaled(y, height),
      width: width * targetDisp.scaleFactor,
      height: height * targetDisp.scaleFactor,
    };
  }
}
