/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */

import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import { ipcRenderer } from 'electron';

import diContainer from '@di/containers/renderer';
import TYPES from '@di/types';

import { CaptureMode } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';

import { PlatformApi } from '@application/ports/platform';

import {
  IRecordContext,
  TargetSlice,
} from '@adapters/recorder/rec-delegate/types';

import { getNowAsYYYYMMDDHHmmss } from '@utils/date';
import { mergeScreenBounds } from '@utils/bounds';

const MEDIA_MIME_TYPE = 'video/webm; codecs=h264,opus';
// const MEDIA_MIME_TYPE = 'video/webm; codecs=vp8,opus';

const RECORD_TIMESLICE_MS = 100;
const NUM_CHUNKS_TO_FLUSH = 50;
const CHUNK_HANLER_INTERVAL = 1000;

let gMediaRecorder: MediaRecorder;
let gRecordState: 'initial' | 'recording' | 'stopping' | 'stopped' = 'initial';
let gTempFilePath: string;
let gRecordedChunks: Blob[] = [];
let gTotalRecordedChunks = 0;
let gRecordStoppingTime = Number.MAX_VALUE;
let gChunkHandler: any;

interface Drawable {
  videoElem: HTMLVideoElement;
  srcBounds: Bounds;
  dstBounds: Bounds;
}

interface IDrawContext {
  canvasBounds: Bounds;
  frameRate: number;
  drawables: Drawable[];
}

const platformApi = diContainer.get<PlatformApi>(TYPES.PlatformApi);

const recorderOpts = (mimeType?: string, videoBitrates?: number) => {
  const mType = mimeType ?? MEDIA_MIME_TYPE;
  if (videoBitrates !== undefined) {
    return {
      mimeType: mType,
      videoBitsPerSecond: videoBitrates,
    };
  }
  return { mimeType: mType };
};

const getTempOutputPath = () => {
  const fileName = getNowAsYYYYMMDDHHmmss();
  return path.join(
    platformApi.getAppPath('temp'),
    'kropsaurus',
    'recording',
    `tmp-${fileName}.webm`
  );
};

const ensureTempDirPathExists = (tempPath: string) => {
  const dirPath = path.dirname(tempPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getAudioConstraint = (): any => {
  return {
    audio: true,
  };
};

const getVideoConstraint = (srcId: string, bounds: Bounds): any => {
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
};

const createDrawContext = async (
  recordCtx: IRecordContext
): Promise<IDrawContext> => {
  const { scaleDownFactor, frameRate, targetSlices } = recordCtx;

  const canvasBounds = {
    ...mergeScreenBounds(
      targetSlices.map(({ targetBounds }) => ({
        x: Math.floor(targetBounds.x * scaleDownFactor),
        y: Math.floor(targetBounds.y * scaleDownFactor),
        width: Math.floor(targetBounds.width * scaleDownFactor),
        height: Math.floor(targetBounds.height * scaleDownFactor),
      }))
    ),
    x: 0,
    y: 0,
  };

  const drawables = await Promise.all(
    targetSlices.map(
      async ({
        mediaSourceId,
        screenBounds,
        targetBounds,
      }: TargetSlice): Promise<Drawable> => {
        const constraints = getVideoConstraint(mediaSourceId, screenBounds);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        const videoElem = document.createElement('video') as HTMLVideoElement;
        videoElem.srcObject = stream;
        videoElem.play();

        const srcBounds: Bounds = { ...targetBounds };
        const dstBounds: Bounds = {
          x: Math.floor(
            (screenBounds.x + srcBounds.x - targetBounds.x) * scaleDownFactor
          ),
          y: Math.floor(
            (screenBounds.y + srcBounds.y - targetBounds.y) * scaleDownFactor
          ),
          width: Math.floor(srcBounds.width * scaleDownFactor),
          height: Math.floor(srcBounds.height * scaleDownFactor),
        };

        return { videoElem, srcBounds, dstBounds };
      }
    )
  );

  return {
    canvasBounds,
    frameRate,
    drawables,
  };
};

const createBypassStream = (drawContext: IDrawContext): MediaStream => {
  const [screenDrawable] = drawContext.drawables;
  return screenDrawable.videoElem.srcObject as MediaStream;
};

const createCanvasStream = (drawContext: IDrawContext): MediaStream => {
  const { canvasBounds, frameRate, drawables } = drawContext;

  // WORKAROUND - completely no evidence for this setting
  const MAX_FPS = 30;
  const MIN_FPS = 10;
  const BASE_PIXELS = 1280 * 720;
  const pixelRatio = BASE_PIXELS / (canvasBounds.width * canvasBounds.height);
  const targetFps = Math.floor(frameRate * pixelRatio);
  const fps = Math.max(Math.min(targetFps, MAX_FPS), MIN_FPS);
  const frameDuration = Math.floor(1000 / fps);

  const canvasElem = document.createElement('canvas') as any;
  canvasElem.width = canvasBounds.width;
  canvasElem.height = canvasBounds.height;

  const canvasCtx = canvasElem.getContext('2d');
  const canvasStream = canvasElem.captureStream(0);
  const [canvasTrack] = canvasStream.getVideoTracks();

  let frameElapsed = 0;
  let prevTime = 0;
  const renderCapturedToCanvas = () => {
    const now = performance.now();
    const dTime = Math.ceil(now - prevTime);
    frameElapsed += dTime;

    if (dTime >= frameDuration || frameElapsed >= frameDuration) {
      drawables.forEach((d: any) => {
        canvasCtx.drawImage(
          d.videoElem,
          d.srcBounds.x,
          d.srcBounds.y,
          d.srcBounds.width,
          d.srcBounds.height,
          d.dstBounds.x,
          d.dstBounds.y,
          d.dstBounds.width,
          d.dstBounds.height
        );
      });

      canvasTrack.requestFrame();

      frameElapsed = 0;
    }

    prevTime = now;

    if (gRecordState !== 'stopped') {
      requestAnimationFrame(renderCapturedToCanvas);
    }
  };

  requestAnimationFrame(renderCapturedToCanvas);

  return canvasStream;
};

const attachAudioStreamForMic = async (stream: MediaStream) => {
  try {
    const audioStream = await navigator.mediaDevices.getUserMedia(
      getAudioConstraint()
    );

    const tracks = audioStream.getAudioTracks();
    if (tracks.length > 0) {
      tracks.forEach((t: MediaStreamTrack) => stream.addTrack(t));
    }
  } catch (error) {
    log.error('no available audio stream found', error);
  }

  return stream;
};

const createStreamToRecord = async (
  recordCtx: IRecordContext
): Promise<MediaStream> => {
  const { outputFormat, recordMicrophone } = recordCtx;

  const drawContext = await createDrawContext(recordCtx);
  const videoStream =
    recordCtx.captureMode === CaptureMode.SCREEN
      ? createBypassStream(drawContext)
      : createCanvasStream(drawContext);

  if (recordMicrophone && outputFormat !== 'gif') {
    await attachAudioStreamForMic(videoStream);
  }

  return videoStream;
};

const flushChunksToFile = async (numChunks: number) => {
  const chunks = gRecordedChunks.splice(0, numChunks);
  if (chunks.length === 0) {
    return;
  }

  const blob = new Blob(chunks, { type: MEDIA_MIME_TYPE });
  const buffer = Buffer.from(await blob.arrayBuffer());
  await fs.promises.appendFile(gTempFilePath, buffer);
};

const handleStreamDataAvailable = async (event: BlobEvent) => {
  const LOOSE_TIME = RECORD_TIMESLICE_MS * 2;
  if (
    event.data.size > 0 &&
    gRecordStoppingTime + LOOSE_TIME >= event.timeStamp
  ) {
    gRecordedChunks.push(event.data);
    gTotalRecordedChunks += 1;
  }
};

const handleRecordedChunks = async () => {
  switch (gRecordState) {
    case 'recording':
      await flushChunksToFile(NUM_CHUNKS_TO_FLUSH);
      break;

    case 'stopping':
      await flushChunksToFile(gRecordedChunks.length);
      gMediaRecorder.stop();
      break;

    case 'stopped':
      clearInterval(gChunkHandler);
      break;

    default:
      break;
  }
};

const handleRecordStart = (_event: Event) => {
  gRecordState = 'recording';

  gChunkHandler = setInterval(handleRecordedChunks, CHUNK_HANLER_INTERVAL);
};

const handleRecordStop = async (_event: Event) => {
  gRecordState = 'stopped';

  ipcRenderer.send('recording-file-saved', { tempFilePath: gTempFilePath });
};

ipcRenderer.on('start-record', async (_event, data) => {
  const recordCtx: IRecordContext = data.recordContext;
  const { videoBitrates } = recordCtx;

  const stream = await createStreamToRecord(recordCtx);
  const recOpts = recorderOpts(MEDIA_MIME_TYPE, videoBitrates);
  gMediaRecorder = new MediaRecorder(stream, recOpts);
  gMediaRecorder.onstart = handleRecordStart;
  gMediaRecorder.ondataavailable = handleStreamDataAvailable;
  gMediaRecorder.onstop = handleRecordStop;

  gTempFilePath = getTempOutputPath();
  ensureTempDirPathExists(gTempFilePath);

  setTimeout(() => gMediaRecorder.start(RECORD_TIMESLICE_MS));
  ipcRenderer.send('recording-started', {});
});

ipcRenderer.on('stop-record', async (_event, _data) => {
  if (gMediaRecorder === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'invalid media recorder state',
    });
    return;
  }

  if (gTotalRecordedChunks === 0) {
    ipcRenderer.send('recording-failed', {
      message: 'empty recorded chunks',
    });
    return;
  }

  gRecordState = 'stopping';
  gRecordStoppingTime = performance.now();
});
