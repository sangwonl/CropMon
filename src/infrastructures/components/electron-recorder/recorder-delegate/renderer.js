/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable radix */

// const MEDIA_MIME_TYPE = 'video/webm; codecs=vp9';
const MEDIA_MIME_TYPE = 'video/webm; codecs=h264';

let recordedChunks = [];
let mediaRecorder;
let outputPath;

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

  window.injected.ipcSend('recording-file-saved', { tempFilePath: tempPath });
};

const getTargetSource = async (screenId) => {
  const inputSources = await window.injected.getCapturerSources({
    types: ['screen'],
  });
  return inputSources.find((s) => parseInt(s.display_id) === screenId);
};

const getMediaConstraint = (sourceId, screenBounds) => {
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

const withCanvasProcess = (stream, screenBounds, targetBounds) => {
  const videoElem = document.getElementById('video');
  videoElem.videoWidth = screenBounds.width;
  videoElem.videoHeight = screenBounds.height;
  videoElem.srcObject = stream;
  videoElem.play();

  const canvasElem = document.getElementById('canvas');
  canvasElem.width = targetBounds.width;
  canvasElem.height = targetBounds.width;

  const canvasCtx = canvasElem.getContext('2d');
  const render = () => {
    canvasCtx.drawImage(
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

  return canvasElem.captureStream(30);
};

window.injected.ipcOn('start-record', async (_event, data) => {
  const { screenId, screenBounds, targetBounds } = data;

  const targetSource = await getTargetSource(screenId);
  if (targetSource === undefined) {
    window.injected.ipcSend('recording-failed', {
      message: 'failed to find input source matched to screen id',
    });
    return;
  }

  const constraints = getMediaConstraint(targetSource.id, screenBounds);
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  if (stream === undefined) {
    window.injected.ipcSend('recording-failed', {
      message: 'fail to get user media',
    });
    return;
  }

  const canvasStream = withCanvasProcess(stream, screenBounds, targetBounds);
  const recorderOpts = { mimeType: MEDIA_MIME_TYPE };
  mediaRecorder = new MediaRecorder(canvasStream, recorderOpts);
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;

  recordedChunks = [];
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

  mediaRecorder.stop();
});
