/* eslint-disable max-classes-per-file */
/* eslint-disable prefer-const */

import fs from 'fs';
import os from 'os';
import path from 'path';

import { ipcRenderer } from 'electron';
import logger from 'electron-log';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';

import { alignedBounds, mergeScreenBounds } from '@utils/bounds';
import { getDurationFromString, getNowAsYYYYMMDDHHmmss } from '@utils/date';
import { isProduction, isWin } from '@utils/process';

import diContainer from '@di/containers';
import '@di/containers/renderer';
import TYPES from '@di/types';

import {
  CaptureMode,
  type AudioSource,
  type OutputFormat,
} from '@domain/models/common';
import type { Bounds } from '@domain/models/screen';

import type { PlatformApi } from '@application/ports/platform';

import type {
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

  public start = async (recordCtx: RecordContext) => {
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

  public stop = () => {
    if (this.mediaRecorder === undefined) {
      ipcRenderer.send('onRecordingFailed', {
        message: 'invalid media recorder state',
      });
      return;
    }

    if (this.totalRecordedChunks === 0) {
      ipcRenderer.send('onRecordingFailed', {
        message: 'empty recorded chunks',
      });
      return;
    }

    this.recordState = 'stopping';
  };

  public fetchAudioSources = async (): Promise<AudioSource[]> => {
    const deviceIds = new Set();
    const audioSources: AudioSource[] = [];

    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach(d => {
      if (
        d.deviceId === 'default' ||
        d.kind !== 'audioinput' ||
        deviceIds.has(d.deviceId)
      ) {
        return;
      }

      deviceIds.add(d.deviceId);

      audioSources.push({
        id: d.deviceId,
        name: d.label,
        active: false,
      });
    });

    return audioSources;
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

  private getAudioConstraint(audioSource: AudioSource): unknown {
    return {
      audio: {
        deviceId: audioSource.id,
      },
      video: false,
    };
  }

  private getVideoConstraint(
    srcId: string,
    bounds: Bounds,
    frameRate?: number,
  ): unknown {
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
          maxFrameRate: frameRate,
        },
      },
    };
  }

  private createDrawContext = async (
    recordCtx: RecordContext,
  ): Promise<DrawContext> => {
    const { scaleDownFactor, frameRate, targetSlices } = recordCtx;

    const wholeTargetBounds = mergeScreenBounds(
      targetSlices.map(({ targetBounds }) => targetBounds),
    );

    const canvasBounds = {
      x: 0,
      y: 0,
      width: Math.floor(wholeTargetBounds.width * scaleDownFactor),
      height: Math.floor(wholeTargetBounds.height * scaleDownFactor),
    };

    const sliceToDrawable = async (slice: TargetSlice): Promise<Drawable> => {
      const { mediaSourceId, screenBounds, targetBounds } = slice;

      const videoStream = await navigator.mediaDevices.getUserMedia(
        this.getVideoConstraint(
          mediaSourceId,
          screenBounds,
          frameRate,
        ) as MediaStreamConstraints,
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

    const canvas = document.createElement('canvas');
    const alignedCanvasBounds = alignedBounds(canvasBounds);
    canvas.width = alignedCanvasBounds.width;
    canvas.height = alignedCanvasBounds.height;

    const offscreenCanvas = canvas.transferControlToOffscreen();

    const generator = new MediaStreamTrackGenerator({ kind: 'video' });
    const { writable } = generator;

    const readables = drawContext.drawables.map(({ videoStream }) => {
      const [track] = videoStream.getVideoTracks();
      const { readable } = new MediaStreamTrackProcessor({ track });
      return readable;
    });

    const boundsList = drawContext.drawables.map(({ srcBounds, dstBounds }) => {
      return {
        srcBounds: alignedBounds(srcBounds),
        dstBounds: alignedBounds(dstBounds),
      };
    });

    const nullWritables = drawContext.drawables.map(() => {
      const { writable: nullWritable } = new MediaStreamTrackGenerator({
        kind: 'video',
      });
      return nullWritable;
    });

    this.tranformWorker.postMessage(
      {
        type: 'pipeline',
        frameRate: drawContext.frameRate,
        boundsList,
        readables,
        nullWritables,
        writable,
        canvas: offscreenCanvas,
      },
      [...readables, ...nullWritables, writable, offscreenCanvas],
    );

    return new MediaStream([generator]);
  };

  private createCanvasStream = (drawContext: DrawContext): MediaStream => {
    const { canvasBounds } = drawContext;

    const canvas = document.createElement('canvas');
    const alignedCanvasBounds = alignedBounds(canvasBounds);
    canvas.width = alignedCanvasBounds.width;
    canvas.height = alignedCanvasBounds.height;

    const canvasCtx = canvas.getContext('2d');
    const canvasStream = canvas.captureStream(drawContext.frameRate);

    const videos = drawContext.drawables.map(({ videoStream }) => {
      const video = document.createElement('video');
      video.srcObject = videoStream;
      video.play();
      return video;
    });

    const alignedBoundsList = drawContext.drawables.map(
      ({ srcBounds, dstBounds }) => {
        return {
          srcBounds: alignedBounds(srcBounds),
          dstBounds: alignedBounds(dstBounds),
        };
      },
    );

    function drawVideosOnCanvas() {
      videos.forEach((video, i) => {
        const { srcBounds, dstBounds } = alignedBoundsList[i];

        canvasCtx?.drawImage(
          video,
          srcBounds.x,
          srcBounds.y,
          srcBounds.width,
          srcBounds.height,
          dstBounds.x,
          dstBounds.y,
          dstBounds.width,
          dstBounds.height,
        );
      });

      requestAnimationFrame(drawVideosOnCanvas);
    }

    drawVideosOnCanvas();

    return canvasStream;
  };

  private attachAudioTrack = async (
    stream: MediaStream,
    audioSource: AudioSource,
  ): Promise<void> => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia(
        this.getAudioConstraint(audioSource) as MediaStreamConstraints,
      );

      const tracks = audioStream.getAudioTracks();
      if (tracks.length > 0) {
        tracks.forEach((t: MediaStreamTrack) => stream.addTrack(t));
      }
    } catch (e) {
      logger.error('no available audio stream found', e);
    }
  };

  private createStreamToRecord = async (
    recordCtx: RecordContext,
  ): Promise<MediaStream> => {
    const { outputFormat, recordAudio, audioSources } = recordCtx;

    const drawContext = await this.createDrawContext(recordCtx);
    let videoStream: MediaStream;
    if (recordCtx.captureMode === CaptureMode.SCREEN) {
      videoStream = this.createBypassStream(drawContext);
    } else if (drawContext.drawables.length >= 1) {
      videoStream = this.createTransformStream(drawContext);
    } else {
      // will never be reached
      videoStream = this.createCanvasStream(drawContext);
    }

    if (outputFormat === 'gif' || !recordAudio) {
      return videoStream;
    }

    await Promise.all(
      audioSources.map(s => this.attachAudioTrack(videoStream, s)),
    );

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleRecordStart = (_event: Event) => {
    this.recordState = 'recording';

    this.chunkHandler = setInterval(
      this.handleRecordedChunks,
      CHUNK_HANLER_INTERVAL,
    );

    ipcRenderer.send('onRecordingStarted', {});
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleRecordStop = (_event: Event) => {
    this.recordState = 'stopped';

    const recordStoppedAt = new Date().getTime();
    const totalRecordTime = recordStoppedAt - this.recordStartedAt!;

    ipcRenderer.send('onRecordingDone', {
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
      `tmp-${fileName}.webm`,
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
  private ffmpegCmd?: FfmpegCommand;

  async postProcess(
    tempPath: string,
    outputPath: string,
    outputFormat: OutputFormat,
    enableMic: boolean,
    // eslint-disable-next-line no-unused-vars
    onProgress: (progress: ProgressEvent) => void,
  ): Promise<void> {
    return new Promise(resolve => {
      const finalizer = () => {
        fs.unlink(tempPath, () => {});
        resolve();
      };

      this.ffmpegCmd = ffmpeg(tempPath).setFfmpegPath(this.getFfmpegPath());
      if (outputFormat === 'gif') {
        this.ffmpegCmd
          .outputFormat('gif')
          .videoFilter(
            'fps=14,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
          );
      } else if (enableMic) {
        this.ffmpegCmd.videoCodec('copy').audioCodec('aac');
      } else {
        this.ffmpegCmd.videoCodec('copy');
      }

      this.ffmpegCmd
        .output(outputPath)
        .on('progress', onProgress)
        .on('end', finalizer)
        .run();
    });
  }

  stopProcess(): void {
    this.ffmpegCmd?.kill('SIGINT');
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
          ffmpegFilename,
        );
  }
}

const recorder = new MediaRecordDelegatee();
const postProc = new PostProcessorDelegate();

ipcRenderer.on('startRecord', async (_event, data) => {
  await recorder.start(data.recordContext);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcRenderer.on('stopRecord', (_event, _data) => {
  recorder.stop();
});

ipcRenderer.on('startPostProcess', async (_event, data) => {
  const { tempPath, outputPath, outputFormat, enableMic, totalRecordTime } =
    data;
  const handleProgress = (progress: ProgressEvent) => {
    const currentFrameTime = getDurationFromString(progress.timemark);
    const percent = Math.round((currentFrameTime / totalRecordTime) * 100);
    ipcRenderer.send('onPostProcessing', { progress: { percent } });
  };

  await postProc.postProcess(
    tempPath,
    outputPath,
    outputFormat,
    enableMic,
    handleProgress,
  );

  ipcRenderer.send('onPostProcessDone', { aborted: false });
});

ipcRenderer.on('abortPostProcess', () => {
  postProc.stopProcess();

  ipcRenderer.send('onPostProcessDone', { aborted: true });
});

ipcRenderer.on('fetchAudioSources', async () => {
  const audioSources = await recorder.fetchAudioSources();
  ipcRenderer.send('onAudioSourcesFetched', { audioSources });
});
