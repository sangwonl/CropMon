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

const getTargetSource = async (screenId: number) => {
  const inputSources = await desktopCapturer.getSources({
    types: ['screen'],
  });
  return inputSources.find((s) => parseInt(s.display_id) === screenId);
};

const getMediaConstraint = (sourceId: string, screenBounds: IBounds): any => {
  return {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
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
  targetBounds: IBounds
): MediaStream => {
  const videoElem = document.getElementById('video') as HTMLVideoElement;
  videoElem.srcObject = stream;
  videoElem.play();

  const canvasElem = document.getElementById('canvas') as HTMLCanvasElement;
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
  setInterval(render, 33);

  return (canvasElem as any).captureStream(30);
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

ipcRenderer.on('start-record', async (_event, data) => {
  const { screenId, screenBounds, targetBounds } = data;

  const targetSource = await getTargetSource(screenId);
  if (targetSource === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'failed to find input source matched to screen id',
    });
    return;
  }

  const constraints = getMediaConstraint(targetSource.id, screenBounds);
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  if (stream === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'fail to get user media',
    });
    return;
  }

  const canvasStream = withCanvasProcess(stream, targetBounds);
  const recorderOpts = { mimeType: MEDIA_MIME_TYPE };
  mediaRecorder = new MediaRecorder(canvasStream, recorderOpts);
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;

  setTimeout(() => {
    mediaRecorder.start(1000);
  }, 1000);
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
