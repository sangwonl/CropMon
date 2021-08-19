/* eslint-disable no-console */
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

// const MEDIA_MIME_TYPE = 'video/webm; codecs=h264';
const MEDIA_MIME_TYPE = 'video/webm; codecs=h264,opus';
const NUM_CHUNKS_TO_FLUSH = 100;

const recorderOpts = (mimeType?: string, videoBitrates?: number) => {
  if (videoBitrates !== undefined) {
    return {
      mimeType: mimeType ?? MEDIA_MIME_TYPE,
      videoBitsPerSecond: videoBitrates,
    };
  }
  return { mimeType };
};

let mediaRecorder: MediaRecorder;
let recordState: 'initial' | 'recording' | 'stopped' = 'initial';
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

const getAudioConstraint = (): any => {
  return {
    audio: true,
  };
};

const getVideoConstraint = (srcId: string, bounds: IBounds): any => {
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
      const constraints = getVideoConstraint(source!.id, s.bounds);
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
  scaleDownFactor: number
): MediaStream => {
  const canvasElem = document.createElement('canvas') as HTMLCanvasElement;
  canvasElem.width = Math.floor(w * scaleDownFactor);
  canvasElem.height = Math.floor(h * scaleDownFactor);

  const canvasCtx = canvasElem.getContext('2d')!;
  const interval = Math.floor(1000 / frameRate);

  const renderCapturedToCanvas = () => {
    if (recordState === 'stopped') {
      return;
    }

    if (recordState === 'recording') {
      drawCtx.forEach((ctx: any) => {
        canvasCtx.drawImage(
          ctx.videoElem,
          ctx.srcBounds.x,
          ctx.srcBounds.y,
          ctx.srcBounds.width,
          ctx.srcBounds.height,
          Math.floor(ctx.dstBounds.x * scaleDownFactor),
          Math.floor(ctx.dstBounds.y * scaleDownFactor),
          Math.floor(ctx.dstBounds.width * scaleDownFactor),
          Math.floor(ctx.dstBounds.height * scaleDownFactor)
        );
      });
    }

    setTimeout(renderCapturedToCanvas, interval);
  };

  // In electron browser window web content, we can't use renderFrame..
  setTimeout(renderCapturedToCanvas);

  return (canvasElem as any).captureStream(frameRate);
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
    console.error('no available audio stream found', error);
  }

  return stream;
};

const flushChunksToFile = async (chunks: Blob[]) => {
  const blob = new Blob(chunks, { type: MEDIA_MIME_TYPE });
  const buffer = Buffer.from(await blob.arrayBuffer());
  await fs.promises.appendFile(tempFilePath, buffer);
};

const handleStreamDataAvailable = async (event: BlobEvent) => {
  if (recordState !== 'recording') {
    return;
  }

  recordedChunks.push(event.data);
  totalRecordedChunks += 1;

  if (recordedChunks.length >= NUM_CHUNKS_TO_FLUSH) {
    const chunks = recordedChunks;
    recordedChunks = [];
    await flushChunksToFile(chunks);
  }
};

const handleRecordStop = async (_event: Event) => {
  recordState = 'stopped';
  await flushChunksToFile(recordedChunks);
  ipcRenderer.send('recording-file-saved', { tempFilePath });
};

ipcRenderer.on('start-record', async (_event, data) => {
  const recordCtx: IRecordContext = data.recordContext;
  const {
    targetBounds: { width, height },
    outputFormat,
    recordMicrophone,
    scaleDownFactor,
    frameRate,
    videoBitrates,
  } = recordCtx;

  const drawCtx = await createDrawCtx(recordCtx);
  const canvasStream = withCanvasProcess(
    width,
    height,
    drawCtx,
    frameRate,
    scaleDownFactor
  );

  if (recordMicrophone && outputFormat !== 'gif') {
    await attachAudioStreamForMic(canvasStream);
  }

  const recOpts = recorderOpts(MEDIA_MIME_TYPE, videoBitrates);
  mediaRecorder = new MediaRecorder(canvasStream, recOpts);
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;

  tempFilePath = getTempOutputPath();
  ensureTempDirPathExists(tempFilePath);

  setTimeout(() => {
    mediaRecorder.start(500);
    recordState = 'recording';
  }, 500);

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

  mediaRecorder.stop();
});
