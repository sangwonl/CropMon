/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable radix */

import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { desktopCapturer, ipcRenderer } from 'electron';

import { IBounds } from '@core/entities/screen';
import { getApp } from '@utils/remote';

import { IRecordContext, ITargetSlice } from './types';

const MEDIA_MIME_TYPE = 'video/webm; codecs=h264';
const NUM_CHUNKS_TO_FLUSH = 200;

let mediaRecorder: MediaRecorder;
let recordState: 'initial' | 'recording' | 'will-stop' | 'stopped' = 'initial';
let tempFilePath: string;
let recordedChunks: Blob[] = [];
let totalRecordedChunks = 0;

const getTempOutputPath = () => {
  const fileName = dayjs().format('YYYYMMDDHHmmss');
  return path.join(
    getApp().getPath('temp'),
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

const getMediaConstraint = (srcId: string, bounds: IBounds): any => {
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

const createDrawCtx = async (recordCtx: IRecordContext): Promise<any[]> => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  return Promise.all(
    recordCtx.targetSlices.map(async ({ screen: s, bounds }: ITargetSlice) => {
      const source = sources.find((src) => src.display_id === s.id.toString());
      const constraints = getMediaConstraint(source!.id, s.bounds);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const videoElem = document.createElement('video') as HTMLVideoElement;
      videoElem.srcObject = stream;
      videoElem.play();

      const srcBounds: IBounds = {
        ...bounds,
        x: bounds.x - s.bounds.x,
        y: bounds.y - s.bounds.y,
      };

      const dstBounds: IBounds = {
        ...srcBounds,
        x: s.bounds.x + srcBounds.x - recordCtx.targetBounds.x,
        y: s.bounds.y + srcBounds.y - recordCtx.targetBounds.y,
      };

      return { videoElem, srcBounds, dstBounds };
    })
  );
};

const withCanvasProcess = (
  w: number,
  h: number,
  drawCtx: any[],
  frameRate: number,
  projectionRate: number
): MediaStream => {
  const canvasElem = document.createElement('canvas') as HTMLCanvasElement;
  canvasElem.width = Math.floor(w * projectionRate);
  canvasElem.height = Math.floor(h * projectionRate);

  const render = () => {
    const canvasCtx = canvasElem.getContext('2d')!;
    drawCtx.forEach((ctx: any) => {
      canvasCtx.drawImage(
        ctx.videoElem,
        ctx.srcBounds.x,
        ctx.srcBounds.y,
        ctx.srcBounds.width,
        ctx.srcBounds.height,
        Math.floor(ctx.dstBounds.x * projectionRate),
        Math.floor(ctx.dstBounds.y * projectionRate),
        Math.floor(ctx.dstBounds.width * projectionRate),
        Math.floor(ctx.dstBounds.height * projectionRate)
      );
    });
  };

  // In electron browser window web content, we can't use renderFrame..
  setInterval(render, Math.floor(1000 / frameRate));

  return (canvasElem as any).captureStream(frameRate);
};

const handleStreamDataAvailable = async (event: BlobEvent) => {
  if (recordState === 'stopped') {
    return;
  }

  recordedChunks.push(event.data);
  totalRecordedChunks += 1;

  if (
    recordedChunks.length >= NUM_CHUNKS_TO_FLUSH ||
    recordState === 'will-stop'
  ) {
    const chunks = recordedChunks;
    recordedChunks = [];

    const blob = new Blob(chunks, { type: MEDIA_MIME_TYPE });
    const buffer = Buffer.from(await blob.arrayBuffer());
    await fs.promises.appendFile(tempFilePath, buffer);
  }

  if (recordState === 'will-stop') {
    mediaRecorder.stop();
  }
};

const handleRecordStop = async (_event: Event) => {
  recordState = 'stopped';
  ipcRenderer.send('recording-file-saved', { tempFilePath });
};

ipcRenderer.on('start-record', async (_event, data) => {
  const recordCtx: IRecordContext = data.recordContext;
  const {
    targetBounds: { width, height },
    projectionRate,
    frameRate,
  } = recordCtx;

  const drawCtx = await createDrawCtx(recordCtx);
  const canvasStream = withCanvasProcess(
    width,
    height,
    drawCtx,
    frameRate,
    projectionRate
  );

  const recorderOpts = { mimeType: MEDIA_MIME_TYPE };
  mediaRecorder = new MediaRecorder(canvasStream, recorderOpts);
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;

  tempFilePath = getTempOutputPath();
  ensureTempDirPathExists(tempFilePath);

  mediaRecorder.start(1000);
  recordState = 'recording';
  ipcRenderer.send('recording-started', {});
});

ipcRenderer.on('stop-record', async (_event, _data) => {
  if (mediaRecorder === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'invalid media recorder state',
    });
    return;
  }

  if (totalRecordedChunks === 0) {
    ipcRenderer.send('recording-failed', {
      message: 'empty recorded chunks',
    });
    return;
  }

  recordState = 'will-stop';
});
