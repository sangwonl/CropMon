/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import fs from 'fs';
import os from 'os';
import path from 'path';

import { ipcRenderer } from 'electron';
import logger from 'electron-log';
import ffmpeg from 'fluent-ffmpeg';

import { mergeScreenBounds } from '@utils/bounds';
import { getDurationFromString, getNowAsYYYYMMDDHHmmss } from '@utils/date';
import { isProduction, isWin } from '@utils/process';

import diContainer from '@di/containers/renderer';
import TYPES from '@di/types';

import { CaptureMode, OutputFormat } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';

import { PlatformApi } from '@application/ports/platform';

import {
  RecordContext,
  TargetSlice,
} from '@adapters/recorder/rec-delegate/types';

type Drawable = {
  videoStream: MediaStream;
  srcBounds: Bounds;
  dstBounds: Bounds;
};

type DrawContext = {
  canvasBounds: Bounds;
  frameRate: number;
  drawables: Drawable[];
};

type RecordState = 'initial' | 'recording' | 'stopping' | 'stopped';

const RECORD_TIMESLICE_MS = 200;
const NUM_CHUNKS_TO_FLUSH = 50;
const CHUNK_HANLER_INTERVAL = 1000;
const MEDIA_MIME_TYPE = 'video/webm; codecs=h264,opus';
// const MEDIA_MIME_TYPE = 'video/webm; codecs=vp8,opus';
// const MEDIA_MIME_TYPE = 'video/webm; codecs=vp9,opus';

const gPlatformApi = diContainer.get<PlatformApi>(TYPES.PlatformApi);

class MediaRecordDelegatee {
  private mediaRecorder?: MediaRecorder;
  private recordState: RecordState = 'initial';
  private tempFilePath?: string;
  private recordedChunks: Blob[] = [];
  private totalRecordedChunks = 0;
  private chunkHandler?: ReturnType<typeof setInterval>;
  private tranformWorker: Worker;
  private recordStartedAt?: number;

  constructor() {
    this.tranformWorker = new Worker(this.getWorkerPath());
  }

  start = async (recordCtx: RecordContext) => {
    const { videoBitrates } = recordCtx;

    const stream = await this.createStreamToRecord(recordCtx);
    const recOpts = this.recorderOpts(MEDIA_MIME_TYPE, videoBitrates);
    this.mediaRecorder = new MediaRecorder(stream, recOpts);
    this.mediaRecorder.onstart = this.handleRecordStart;
    this.mediaRecorder.ondataavailable = this.handleStreamDataAvailable;
    this.mediaRecorder.onstop = this.handleRecordStop;

    this.tempFilePath = this.getTempOutputPath();
    this.ensureTempDirPathExists(this.tempFilePath);

    setTimeout(() => {
      this.mediaRecorder?.start(RECORD_TIMESLICE_MS);
      this.recordStartedAt = new Date().getTime();
    });
  };

  stop = () => {
    if (this.mediaRecorder === undefined) {
      ipcRenderer.send('recording-failed', {
        message: 'invalid media recorder state',
      });
      return;
    }

    if (this.totalRecordedChunks === 0) {
      ipcRenderer.send('recording-failed', {
        message: 'empty recorded chunks',
      });
      return;
    }

    this.recordState = 'stopping';
  };

  private recorderOpts(mimeType?: string, videoBitrates?: number) {
    const mType = mimeType ?? MEDIA_MIME_TYPE;
    if (videoBitrates !== undefined) {
      return {
        mimeType: mType,
        videoBitsPerSecond: videoBitrates,
      };
    }
    return { mimeType: mType };
  }

  private getAudioConstraint(): any {
    return {
      audio: true,
    };
  }

  private getVideoConstraint(srcId: string, bounds: Bounds): any {
    return {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: srcId,
          minWidth: bounds.width,
          minHeight: bounds.height,
          maxWidth: bounds.width,
          maxHeight: bounds.height,
        },
      },
    };
  }

  private createDrawContext = async (
    recordCtx: RecordContext
  ): Promise<DrawContext> => {
    const { scaleDownFactor, frameRate, targetSlices } = recordCtx;

    const wholeTargetBounds = mergeScreenBounds(
      targetSlices.map(({ targetBounds }) => targetBounds)
    );

    const canvasBounds = {
      x: 0,
      y: 0,
      width: Math.floor(wholeTargetBounds.width * scaleDownFactor),
      height: Math.floor(wholeTargetBounds.height * scaleDownFactor),
    };

    const sliceToDrawable = async (slice: TargetSlice): Promise<Drawable> => {
      const { mediaSourceId, screenBounds, targetBounds } = slice;

      const constraints = this.getVideoConstraint(mediaSourceId, screenBounds);
      const videoStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      const srcBounds: Bounds = {
        ...targetBounds,
        x: targetBounds.x - screenBounds.x,
        y: targetBounds.y - screenBounds.y,
      };

      const dstBounds: Bounds = {
        x: Math.floor((targetBounds.x - wholeTargetBounds.x) * scaleDownFactor),
        y: Math.floor((targetBounds.y - wholeTargetBounds.y) * scaleDownFactor),
        width: Math.floor(targetBounds.width * scaleDownFactor),
        height: Math.floor(targetBounds.height * scaleDownFactor),
      };

      return { videoStream, srcBounds, dstBounds };
    };

    const drawables = await Promise.all(targetSlices.map(sliceToDrawable));

    return { canvasBounds, frameRate, drawables };
  };

  private createBypassStream(drawContext: DrawContext): MediaStream {
    const [screenDrawable] = drawContext.drawables;
    return screenDrawable.videoStream;
  }

  private createTransformStream = (drawContext: DrawContext): MediaStream => {
    const { canvasBounds } = drawContext;

    const generator = new MediaStreamTrackGenerator({ kind: 'video' });
    const { writable } = generator;

    const readables = drawContext.drawables.map(({ videoStream }) => {
      const [track] = videoStream.getVideoTracks();
      const { readable } = new MediaStreamTrackProcessor({ track });
      return readable;
    });

    const boundsList = drawContext.drawables.map(({ srcBounds, dstBounds }) => {
      return {
        srcBounds,
        dstBounds,
      };
    });

    const { writable: nullWritable } = new MediaStreamTrackGenerator({
      kind: 'video',
    });

    this.tranformWorker.postMessage(
      { canvasBounds, boundsList, readables, writable, nullWritable },
      [...readables, writable, nullWritable as any]
    );

    return new MediaStream([generator]);
  };

  private attachAudioStreamForMic = async (stream: MediaStream) => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia(
        this.getAudioConstraint()
      );

      const tracks = audioStream.getAudioTracks();
      if (tracks.length > 0) {
        tracks.forEach((t: MediaStreamTrack) => stream.addTrack(t));
      }
    } catch (e) {
      logger.error('no available audio stream found', e);
    }

    return stream;
  };

  private createStreamToRecord = async (
    recordCtx: RecordContext
  ): Promise<MediaStream> => {
    const { outputFormat, recordMicrophone } = recordCtx;

    const drawContext = await this.createDrawContext(recordCtx);
    const videoStream =
      recordCtx.captureMode === CaptureMode.SCREEN
        ? this.createBypassStream(drawContext)
        : this.createTransformStream(drawContext);

    if (recordMicrophone && outputFormat !== 'gif') {
      await this.attachAudioStreamForMic(videoStream);
    }

    return videoStream;
  };

  private flushChunksToFile = async (numChunks: number) => {
    const chunks = this.recordedChunks.splice(0, numChunks);
    if (chunks.length === 0) {
      return;
    }

    const blob = new Blob(chunks, { type: MEDIA_MIME_TYPE });
    const buffer = Buffer.from(await blob.arrayBuffer());
    await fs.promises.appendFile(this.tempFilePath!, buffer);
  };

  private handleStreamDataAvailable = (event: BlobEvent) => {
    this.recordedChunks.push(event.data);
    this.totalRecordedChunks += 1;
  };

  private handleRecordedChunks = async () => {
    switch (this.recordState) {
      case 'recording':
        await this.flushChunksToFile(NUM_CHUNKS_TO_FLUSH);
        break;

      case 'stopping':
        await this.flushChunksToFile(this.recordedChunks.length);
        this.mediaRecorder?.stop();
        break;

      case 'stopped':
        clearInterval(this.chunkHandler);
        break;

      default:
        break;
    }
  };

  private handleRecordStart = (_event: Event) => {
    this.recordState = 'recording';

    this.chunkHandler = setInterval(
      this.handleRecordedChunks,
      CHUNK_HANLER_INTERVAL
    );

    ipcRenderer.send('recording-started', {});
  };

  private handleRecordStop = (_event: Event) => {
    this.recordState = 'stopped';

    const recordStoppedAt = new Date().getTime();
    const totalRecordTime = recordStoppedAt - this.recordStartedAt!;

    ipcRenderer.send('recording-done', {
      tempFilePath: this.tempFilePath,
      totalRecordTime,
    });
  };

  private getTempOutputPath() {
    const fileName = getNowAsYYYYMMDDHHmmss();
    return path.join(
      gPlatformApi.getPath('temp'),
      'kropsaurus',
      'recording',
      `tmp-${fileName}.webm`
    );
  }

  private getWorkerPath(): string {
    if (isProduction()) {
      return '../dist/renderer.recorder.worker.prod.js';
    }

    const port = process.env.PORT || 1212;
    return `http://localhost:${port}/dist/renderer.recorder.worker.dev.js`;
  }

  private ensureTempDirPathExists(tempPath: string) {
    const dirPath = path.dirname(tempPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

type ProgressEvent = {
  // {frames: 169, currentFps: 0, currentKbps: 235.8, targetSize: 168, timemark: '00:00:05.84'}
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
};

class PostProcessorDelegate {
  async postProcess(
    tempPath: string,
    outputPath: string,
    outputFormat: OutputFormat,
    enableMic: boolean,
    onProgress: (progress: ProgressEvent) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const finalizer = () => {
        fs.unlink(tempPath, () => {});
        resolve();
      };

      const ffmpegCmd = ffmpeg(tempPath).setFfmpegPath(this.getFfmpegPath());
      if (outputFormat === 'gif') {
        ffmpegCmd
          .outputFormat('gif')
          .videoFilter(
            'fps=14,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'
          );
      } else if (enableMic) {
        ffmpegCmd.videoCodec('copy').audioCodec('aac');
      } else {
        ffmpegCmd.videoCodec('copy');
      }

      ffmpegCmd
        .output(outputPath)
        .on('progress', onProgress)
        .on('end', finalizer)
        .run();
    });
  }

  private getFfmpegPath(): string {
    const appPath = gPlatformApi.getPath('app');

    const ffmpegFilename = `${
      isWin() ? 'ffmpeg.exe' : 'ffmpeg'
    }-${os.platform()}-${os.arch()}`;

    return isProduction()
      ? path.join(appPath, '..', 'bin', ffmpegFilename)
      : path.join(
          appPath,
          '..',
          '..',
          'node_modules',
          'ffmpeg-static',
          ffmpegFilename
        );
  }
}

const recorder = new MediaRecordDelegatee();
const postProc = new PostProcessorDelegate();

ipcRenderer.on('start-record', async (_event, data) => {
  await recorder.start(data.recordContext);
});

ipcRenderer.on('stop-record', (_event, _data) => {
  recorder.stop();
});

ipcRenderer.on('start-post-process', async (_event, data) => {
  const { tempPath, outputPath, outputFormat, enableMic, totalRecordTime } =
    data;
  const handleProgress = (progress: ProgressEvent) => {
    const currentFrameTime = getDurationFromString(progress.timemark);
    const percent = Math.round((currentFrameTime / totalRecordTime) * 100);
    ipcRenderer.send('post-processing', { progress: { percent } });
  };

  await postProc.postProcess(
    tempPath,
    outputPath,
    outputFormat,
    enableMic,
    handleProgress
  );

  ipcRenderer.send('post-process-done');
});
