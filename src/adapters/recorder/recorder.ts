/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { app, desktopCapturer, ipcMain, systemPreferences } from 'electron';
import logger from 'electron-log';
import { injectable } from 'inversify';

import { getAllScreens, getIntersection, isEmptyBounds } from '@utils/bounds';

import { CaptureContext } from '@domain/models/capture';
import { Bounds, Screen } from '@domain/models/screen';
import { ScreenRecorder } from '@domain/services/recorder';

import RecorderDelegate from '@adapters/recorder/rec-delegate';
import {
  RecordContext,
  TargetSlice,
} from '@adapters/recorder/rec-delegate/types';

const FRAMERATE = 30;

@injectable()
export default class ElectronScreenRecorder implements ScreenRecorder {
  delegate?: RecorderDelegate;

  constructor() {
    app
      .whenReady()
      .then(() => this.renewBuildRenderer())
      .catch((e) => {
        logger.info(e);
      });
  }

  renewBuildRenderer() {
    this.delegate?.destroy();
    this.delegate = new RecorderDelegate();
    // this.delegate.webContents.openDevTools();
  }

  async record(ctx: CaptureContext): Promise<void> {
    const recordCtx = await this.createRecordContext(ctx);
    if (!recordCtx) {
      return Promise.reject(Error('fail to create record context'));
    }

    if (recordCtx.recordMicrophone) {
      recordCtx.recordMicrophone =
        systemPreferences.getMediaAccessStatus('microphone') === 'granted';
    }

    return new Promise((resolve, reject) => {
      const onRecordingStarted = (_event: any) => {
        clearIpcListeners();
        resolve();
      };

      const onRecordingFailed = (_event: any, _data: any) => {
        clearIpcListeners();
        reject(Error('recording failed'));
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

  async finish(ctx: CaptureContext): Promise<void> {
    const { outputPath, outputFormat, recordMicrophone: enableMic } = ctx;

    return new Promise((resolve, reject) => {
      const onRecordingDone = async (_event: any, data: any) => {
        this.delegate?.webContents.send('start-post-process', {
          tempPath: data.tempFilePath,
          outputPath,
          outputFormat,
          enableMic,
        });
      };

      const onPostProcessDone = async () => {
        clearIpcListeners();
        resolve();
        this.renewBuildRenderer();
      };

      const onRecordingFailed = (_event: any, _data: any) => {
        clearIpcListeners();
        reject(Error('recording failed'));
        this.renewBuildRenderer();
      };

      const setupIpcListeners = () => {
        ipcMain.on('recording-done', onRecordingDone);
        ipcMain.on('recording-failed', onRecordingFailed);
        ipcMain.on('post-process-done', onPostProcessDone);
      };

      const clearIpcListeners = () => {
        ipcMain.off('recording-done', onRecordingDone);
        ipcMain.off('recording-failed', onRecordingFailed);
        ipcMain.off('post-process-done', onPostProcessDone);
      };

      setupIpcListeners();

      this.delegate?.webContents.send('stop-record', { outputPath });
    });
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
