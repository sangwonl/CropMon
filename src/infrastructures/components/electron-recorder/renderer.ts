/* eslint-disable radix */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */

import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import { ipcRenderer, desktopCapturer, remote } from 'electron';

// const MEDIA_MIME_TYPE = 'video/webm; codecs=vp9';
const MEDIA_MIME_TYPE = 'video/webm; codecs=h264';

let recordedChunks: Array<Blob> = [];
let mediaRecorder: MediaRecorder;

const getTempOutputPath = (): string => {
  const fileName = dayjs().format('YYYYMMDDHHmmss');
  return path.join(
    remote.app.getPath('temp'),
    'kropsaurus',
    'recording',
    `tmp-${fileName}.webm`
  );
};

const handleStreamDataAvailable = (event: BlobEvent) => {
  recordedChunks.push(event.data);
};

const ensureTempDirPathExists = (tempPath: string) => {
  const dirPath = path.dirname(tempPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const handleRecordStop = async (_event: Event) => {
  const blob = new Blob(recordedChunks, { type: MEDIA_MIME_TYPE });
  const buffer = Buffer.from(await blob.arrayBuffer());

  const tempPath = getTempOutputPath();
  ensureTempDirPathExists(tempPath);

  fs.writeFile(tempPath, buffer, () => {
    ipcRenderer.send('recording-file-saved', {
      filePath: tempPath,
    });
  });
};

ipcRenderer.on('start-record', async (_event, data) => {
  const { screenId, screenWidth, screenHeight } = data;

  const inputSources = await desktopCapturer.getSources({
    types: ['screen'],
  });

  const targetSource = inputSources.find(
    (s) => parseInt(s.display_id) === screenId
  );
  if (targetSource === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'failed to find input source matched to screen id',
    });
  }

  const constraints: any = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: targetSource!.id,
        minWidth: screenWidth,
        minHeight: screenHeight,
        maxWidth: screenWidth,
        maxHeight: screenHeight,
      },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  if (stream === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'fail to get user media',
    });
    return;
  }

  recordedChunks = [];

  mediaRecorder = new MediaRecorder(stream, { mimeType: MEDIA_MIME_TYPE });
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;
  mediaRecorder.start();

  ipcRenderer.send('recording-started', {});
});

ipcRenderer.on('stop-record', async (_event, _message) => {
  if (mediaRecorder === undefined) {
    ipcRenderer.send('recording-failed', {
      message: 'invalid media recorder state',
    });
    return;
  }
  mediaRecorder.stop();
});
