/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable radix */

// const MEDIA_MIME_TYPE = 'video/webm; codecs=vp9';
const MEDIA_MIME_TYPE = 'video/webm; codecs=h264';

let recordedChunks = [];
let mediaRecorder;

let outputPath;
let targetBounds;
let displayBounds;

const getTempOutputPath = () => {
  const fileName = window.injected.dateString('YYYYMMDDHHmmss');
  return window.injected.pathJoin(
    window.injected.getAppTempPath(),
    'kropsaurus',
    'recording',
    `tmp-${fileName}.webm`
  );
};

const handleStreamDataAvailable = (event) => {
  recordedChunks.push(event.data);
};

const ensureTempDirPathExists = (tempPath) => {
  const dirPath = window.injected.pathDir(tempPath);
  if (!window.injected.fsExists(dirPath)) {
    window.injected.fsMakeDir(dirPath);
  }
};

const handleRecordStop = async (_event) => {
  const tempPath = getTempOutputPath();
  ensureTempDirPathExists(tempPath);

  const blob = new Blob(recordedChunks, { type: MEDIA_MIME_TYPE });
  const buffer = window.injected.newBuffer(await blob.arrayBuffer());
  window.injected.fsWriteFile(tempPath, buffer);

  // await cropWithFfmpeg(tempPath);

  window.injected.ipcSend('recording-file-saved', { tempFilePath: tempPath });
};

window.injected.ipcOn('start-record', async (_event, data) => {
  const { screenId, screenWidth, screenHeight } = data;

  const inputSources = await window.injected.getCapturerSources({
    types: ['screen'],
  });

  const targetSource = inputSources.find(
    (s) => parseInt(s.display_id) === screenId
  );
  if (targetSource === undefined) {
    window.injected.ipcSend('recording-failed', {
      message: 'failed to find input source matched to screen id',
    });
  }

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: targetSource.id,
        minWidth: screenWidth,
        minHeight: screenHeight,
        maxWidth: screenWidth,
        maxHeight: screenHeight,
      },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  if (stream === undefined) {
    window.injected.ipcSend('recording-failed', {
      message: 'fail to get user media',
    });
    return;
  }

  recordedChunks = [];

  mediaRecorder = new MediaRecorder(stream, { mimeType: MEDIA_MIME_TYPE });
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;
  mediaRecorder.start();

  window.injected.ipcSend('recording-started', {});
});

window.injected.ipcOn('stop-record', async (_event, data) => {
  if (mediaRecorder === undefined) {
    window.injected.ipcSend('recording-failed', {
      message: 'invalid media recorder state',
    });
    return;
  }

  outputPath = data.outputPath;
  targetBounds = data.targetBounds;
  displayBounds = data.displayBounds;

  mediaRecorder.stop();
});
