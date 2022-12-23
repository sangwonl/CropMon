/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { app, desktopCapturer, ipcMain, systemPreferences } from 'electron';
import logger from 'electron-log';
import { injectable } from 'inversify';

import { getAllScreens, getIntersection, isEmptyBounds } from '@utils/bounds';

import { CaptureContext } from '@domain/models/capture';
import { AudioSource } from '@domain/models/common';
import { Bounds, Screen } from '@domain/models/screen';
import { Progress } from '@domain/models/ui';
import { RecorderSource, ScreenRecorder } from '@domain/services/recorder';

import RecorderDelegate from '@adapters/recorder/rec-delegate';
import {
  RecordContext,
  TargetSlice,
} from '@adapters/recorder/rec-delegate/types';

const FRAMERATE = 30;

@injectable()
export default class ElectronScreenRecorder
  implements ScreenRecorder, RecorderSource
{
  delegate?: RecorderDelegate;

  constructor() {
    app
      .whenReady()
      .then(() => this.renewBuildRenderer())
      .catch((e) => {
        logger.info(e);
      });
  }

  public fetchAudioSources(): Promise<AudioSource[]> {
    return new Promise((resolve, reject) => {
      ipcMain.once('onAudioSourcesFetched', async (_event: any, data: any) => {
        resolve(data.audioSources);
      });

      this.delegate?.webContents.send('fetchAudioSources', {});
    });
  }

  public async record(ctx: CaptureContext): Promise<void> {
    const recordCtx = await this.createRecordContext(ctx);
    if (!recordCtx) {
      return Promise.reject(Error('fail to create record context'));
    }

    if (recordCtx.recordMicrophone) {
      recordCtx.recordMicrophone =
        systemPreferences.getMediaAccessStatus('microphone') === 'granted';
    }

    return new Promise((resolve, reject) => {
      ipcMain.once('onRecordingStarted', (_event: any) => {
        resolve();
      });

      ipcMain.once('onRecordingFailed', (_event: any, _data: any) => {
        reject(Error('recording failed'));
      });

      this.delegate?.webContents.send('startRecord', {
        recordContext: recordCtx,
      });
    });
  }

  public async finish(
    ctx: CaptureContext,
    onRecordDone: () => void,
    onPostProgress: (progres: Progress) => void
  ): Promise<void> {
    const { outputPath, outputFormat, recordMicrophone: enableMic } = ctx;

    return new Promise((resolve, reject) => {
      ipcMain.once('onRecordingDone', async (_event: any, data: any) => {
        onRecordDone();

        this.delegate?.webContents.send('startPostProcess', {
          tempPath: data.tempFilePath,
          outputPath,
          outputFormat,
          enableMic,
          totalRecordTime: data.totalRecordTime,
        });
      });

      ipcMain.once('onRecordingFailed', (_event: any, _data: any) => {
        reject(Error('recording failed'));
        this.renewBuildRenderer();
      });

      ipcMain.once('onPostProcessing', (_event: any, data: any) => {
        onPostProgress({ percent: data.progress.percent });
      });

      ipcMain.once('onPostProcessDone', async (_event: any, data: any) => {
        if (!data.aborted) {
          resolve();
        } else {
          reject(Error('recording aborted'));
        }
        this.renewBuildRenderer();
      });

      this.delegate?.webContents.send('stopRecord', { outputPath });
    });
  }

  public abortPostProcess(): void {
    this.delegate?.webContents.send('abortPostProcess', {});
  }

  private renewBuildRenderer(): void {
    this.delegate?.destroy();
    this.delegate = new RecorderDelegate();
    // this.delegate.webContents.openDevTools();
  }

  private getSourceByScreenId(
    screenId: number,
    sources: Electron.DesktopCapturerSource[]
  ) {
    // eslint-disable-next-line no-restricted-syntax
    for (const source of sources) {
      if (source.display_id === screenId.toString()) {
        return source;
      }
    }
    return undefined;
  }

  private getScreenById(screenId: number, screens: Screen[]) {
    // eslint-disable-next-line no-restricted-syntax
    for (const screen of screens) {
      if (screen.id === screenId) {
        return screen;
      }
    }
    return undefined;
  }

  private getTargetSlicesForScreenMode(
    targetScreenId: number,
    screens: Screen[],
    sources: Electron.DesktopCapturerSource[]
  ) {
    const targetSlices: TargetSlice[] = [];
    const source = this.getSourceByScreenId(targetScreenId, sources);
    const screen = this.getScreenById(targetScreenId, screens);
    if (source && screen) {
      targetSlices.push({
        mediaSourceId: source.id,
        targetBounds: { ...screen.bounds },
        screenBounds: { ...screen.bounds },
      });
    }
    return targetSlices;
  }

  private getTargetSlicesForAreaMode(
    targetBounds: Bounds,
    screens: Screen[],
    sources: Electron.DesktopCapturerSource[]
  ) {
    const targetSlices: TargetSlice[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const screen of screens) {
      const intersected = getIntersection(targetBounds, screen.bounds);
      if (intersected && !isEmptyBounds(intersected)) {
        const source = this.getSourceByScreenId(screen.id, sources);
        if (source) {
          targetSlices.push({
            mediaSourceId: source.id,
            targetBounds: intersected,
            screenBounds: { ...screen.bounds },
          });
        }
      }
    }
    return targetSlices;
  }

  private async createRecordContext(
    ctx: CaptureContext
  ): Promise<RecordContext | null> {
    const { outputFormat, recordMicrophone } = ctx;
    const {
      mode: captureMode,
      bounds: targetBounds,
      screenId: targetScreenId,
    } = ctx.target;

    if (!targetBounds || isEmptyBounds(targetBounds)) {
      return null;
    }

    const screens = getAllScreens();
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    const targetSlices = targetScreenId
      ? this.getTargetSlicesForScreenMode(targetScreenId, screens, sources)
      : this.getTargetSlicesForAreaMode(targetBounds, screens, sources);

    if (targetSlices.length === 0) {
      return null;
    }

    const scaleDownFactor = 1.0;
    const frameRate = FRAMERATE;

    return {
      captureMode,
      targetSlices,
      outputFormat,
      recordMicrophone,
      frameRate,
      scaleDownFactor,
    };
  }
}
