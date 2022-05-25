/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */

import { injectable } from 'inversify';
import { app, desktopCapturer, ipcMain, systemPreferences } from 'electron';
import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import {
  createFFmpeg,
  CreateFFmpegOptions,
  fetchFile,
  FFmpeg,
} from '@ffmpeg/ffmpeg';

import { OutputFormat } from '@domain/models/common';
import { Bounds, Screen } from '@domain/models/screen';
import { CaptureContext } from '@domain/models/capture';
import { ScreenRecorder } from '@domain/services/recorder';

import {
  IRecordContext,
  TargetSlice,
} from '@adapters/recorder/rec-delegate/types';
import RecorderDelegate from '@adapters/recorder/rec-delegate';

import { isProduction } from '@utils/process';
import {
  emptyBounds,
  getAllScreensFromLeftTop,
  getIntersection,
  isEmptyBounds,
} from '@utils/bounds';

type ScreenAndBoundsTuple = [Screen, Bounds];

const FRAMERATE = 30;
const FRAMERATE_LOW = 30;
const VIDEO_BITRATES_LOW = 850000;
const SCALE_DOWN_FACTOR_LOW = 0.65;

@injectable()
export default class ElectronScreenRecorder implements ScreenRecorder {
  ffmpeg?: FFmpeg;
  delegate?: RecorderDelegate;

  constructor() {
    this.initializeFFmpeg();

    app
      .whenReady()
      .then(() => this.renewBuildRenderer())
      .catch((_e) => {});
  }

  renewBuildRenderer() {
    this.delegate?.destroy();
    this.delegate = new RecorderDelegate();
    // this.delegate.webContents.openDevTools();
  }

  async record(ctx: CaptureContext): Promise<void> {
    const recordCtx = await this.createRecordContext(ctx);
    if (!recordCtx) {
      return Promise.reject();
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

  async finish(ctx: CaptureContext): Promise<void> {
    const { outputPath, outputFormat, recordMicrophone: enableMic } = ctx;

    return new Promise((resolve, reject) => {
      const onRecordingFileSaved = async (_event: any, data: any) => {
        await this.postProcess(
          data.tempFilePath,
          outputPath,
          outputFormat,
          enableMic
        );

        clearIpcListeners();
        resolve();
        this.renewBuildRenderer();
      };

      const onRecordingFailed = (_event: any, _data: any) => {
        clearIpcListeners();
        reject();
        this.renewBuildRenderer();
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

      this.delegate?.webContents.send('stop-record', { outputPath });
    });
  }

  private async createRecordContext(
    ctx: CaptureContext
  ): Promise<IRecordContext | null> {
    const { outputFormat, recordMicrophone } = ctx;
    const {
      mode: captureMode,
      bounds: targetBounds,
      screenId: targetScreenId,
    } = ctx.target;

    if (!targetBounds || isEmptyBounds(targetBounds)) {
      return null;
    }

    const sources = await desktopCapturer.getSources({ types: ['screen'] });

    const screens = getAllScreensFromLeftTop();

    const targetSlices = screens
      .map(
        (screen): ScreenAndBoundsTuple => [
          screen,
          getIntersection(screen.bounds, targetBounds) ?? emptyBounds(),
        ]
      )
      .filter(([_, bounds]: ScreenAndBoundsTuple) => !isEmptyBounds(bounds))
      .map(([screen, bounds]: ScreenAndBoundsTuple): TargetSlice => {
        const sourceId =
          sources.find((src) => {
            return (
              (targetScreenId &&
                src.display_id === targetScreenId.toString()) ||
              src.display_id === screen.id.toString()
            );
          })?.id ?? sources[0].id;

        return { sourceId, screen, bounds };
      });

    if (targetSlices.length === 0) {
      return null;
    }

    // WORKAROUND: For browser large pixels canvas issue & transcoding lag
    // https://stackoverflow.com/a/11585939
    // const screenBounds = getOverlayScreenBounds();
    // const screenArea = screenBounds.width * screenBounds.height;
    // const targetArea = targetBounds.width * targetBounds.height;
    // const targetAreaRate = targetArea / screenArea;
    // let scaleDownFactor = targetAreaRate < 0.5 ? 1.0 : 0.7;

    let scaleDownFactor = 1.0;
    let frameRate = FRAMERATE;
    let videoBitrates;

    if (ctx.lowQualityMode) {
      scaleDownFactor *= SCALE_DOWN_FACTOR_LOW;
      frameRate = FRAMERATE_LOW;
      videoBitrates = VIDEO_BITRATES_LOW;
    }

    return {
      captureMode,
      targetSlices,
      targetBounds,
      outputFormat,
      recordMicrophone,
      frameRate,
      scaleDownFactor,
      videoBitrates,
    };
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
    this.ffmpeg?.load();
  }

  private async postProcess(
    tempPath: string,
    outputPath: string,
    outputFormat: OutputFormat,
    enableMic: boolean
  ) {
    await this.postProcessWithFFmpeg(
      tempPath,
      outputPath,
      outputFormat,
      enableMic
    );
  }

  private async postProcessWithFFmpeg(
    tempPath: string,
    outputPath: string,
    outputFormat: OutputFormat,
    enableMic: boolean
  ) {
    const memInputName = path.basename(tempPath);
    const memOutputName = path.basename(outputPath);

    try {
      this.ffmpeg?.FS('writeFile', memInputName, await fetchFile(tempPath));

      await this.ffmpeg?.run(
        ...this.chooseFFmpegArgs(
          outputFormat,
          enableMic,
          memInputName,
          memOutputName
        )
      );

      const outStream = this.ffmpeg?.FS('readFile', memOutputName);
      if (outStream) {
        await fs.promises.writeFile(outputPath, outStream);
      }
    } catch (e) {
      log.error(e);
    } finally {
      fs.unlink(tempPath, () => {});
    }
  }

  private chooseFFmpegArgs = (
    outFmt: OutputFormat,
    mic: boolean,
    input: string,
    output: string
  ): string[] => {
    if (outFmt === 'gif') {
      return this.ffmpegArgsForGif(input, output);
    }
    if (mic) {
      return this.ffmpegArgsForMic(input, output);
    }
    return this.ffmpegArgsForNoMic(input, output);
  };

  private ffmpegArgsForNoMic = (input: string, output: string): string[] => [
    '-i',
    input,
    '-c:v',
    'copy',
    output,
  ];

  private ffmpegArgsForMic = (input: string, output: string): string[] => [
    '-i',
    input,
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    output,
  ];

  // https://superuser.com/questions/556029/how-do-i-convert-a-video-to-gif-using-ffmpeg-with-reasonable-quality
  private ffmpegArgsForGif = (input: string, output: string): string[] => [
    '-i',
    input,
    '-vf',
    'fps=10,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
    '-f',
    'gif',
    output,
  ];
}
