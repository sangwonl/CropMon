/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable radix */

import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';

import { IBounds } from '@core/entities/screen';
import { getApp } from '@utils/remote';

// const MEDIA_MIME_TYPE = 'video/webm; codecs=vp9';
const MEDIA_MIME_TYPE = 'video/webm; codecs=h264';

const recordedChunks: Array<Blob> = [];
let mediaRecorder: MediaRecorder;

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

const getMediaConstraint = (screenBounds: IBounds): any => {
  return {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        minWidth: screenBounds.width,
        minHeight: screenBounds.height,
        maxWidth: screenBounds.width,
        maxHeight: screenBounds.height,
      },
    },
  };
};

const withCanvasProcess = (
  stream: MediaStream,
  targetBounds: IBounds,
  frameRate: number
): MediaStream => {
  const videoElem = document.createElement('video') as HTMLVideoElement;
  videoElem.srcObject = stream;
  videoElem.play();

  const canvasElem = document.createElement('canvas') as HTMLCanvasElement;
  canvasElem.width = targetBounds.width;
  canvasElem.height = targetBounds.height;

  const canvasCtx = canvasElem.getContext('2d');
  const render = () => {
    canvasCtx!.drawImage(
      videoElem,
      targetBounds.x,
      targetBounds.y,
      targetBounds.width,
      targetBounds.height,
      0,
      0,
      targetBounds.width,
      targetBounds.height
    );
  };

  // In electron browser window web content, we can't use renderFrame..
  setInterval(render, Math.floor(1000 / frameRate));

  return (canvasElem as any).captureStream(frameRate);
};

const handleStreamDataAvailable = (event: BlobEvent) => {
  recordedChunks.push(event.data);
};

const handleRecordStop = async (_event: Event) => {
  const tempPath = getTempOutputPath();
  ensureTempDirPathExists(tempPath);

  const blob = new Blob(recordedChunks, { type: MEDIA_MIME_TYPE });
  const buffer = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync(tempPath, buffer);

  ipcRenderer.send('recording-file-saved', { tempFilePath: tempPath });
};

const shrinkBoundsIfTooLarge = (data: any): any => {
  const { screenBounds, targetBounds } = data;
  const baseShrinkRate = 1.0;

  const maxSize = 3840 * 2160; // 4K
  const screenSize = screenBounds.width * screenBounds.height;
  if (screenSize <= maxSize) {
    return { screenBounds, targetBounds };
  }

  const ratio = (1.0 - (screenSize - maxSize) / screenSize) * baseShrinkRate;
  return {
    screenBounds: {
      x: Math.floor(screenBounds.x * ratio),
      y: Math.floor(screenBounds.y * ratio),
      width: Math.floor(screenBounds.width * ratio),
      height: Math.floor(screenBounds.height * ratio),
    },
    targetBounds: {
      x: Math.floor(targetBounds.x * ratio),
      y: Math.floor(targetBounds.y * ratio),
      width: Math.floor(targetBounds.width * ratio),
      height: Math.floor(targetBounds.height * ratio),
    },
  };
};

ipcRenderer.on('start-record', async (_event, data) => {
  const { screenBounds, targetBounds } = shrinkBoundsIfTooLarge(data);

  const constraints = getMediaConstraint(screenBounds);
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  if (stream === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'fail to get user media',
    });
    return;
  }

  const frameRate = 24;
  const canvasStream = withCanvasProcess(stream, targetBounds, frameRate);
  const recorderOpts = { mimeType: MEDIA_MIME_TYPE };
  mediaRecorder = new MediaRecorder(canvasStream, recorderOpts);
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;

  setTimeout(() => mediaRecorder.start(1000), 100);
  ipcRenderer.send('recording-started', {});
});

ipcRenderer.on('stop-record', async (_event, _data) => {
  if (mediaRecorder === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'invalid media recorder state',
    });
    return;
  }

  if (recordedChunks.length === 0) {
    ipcRenderer.send('recording-failed', {
      message: 'empty recorded chunks',
    });
    return;
  }

  mediaRecorder.stop();
});
