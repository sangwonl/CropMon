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

const inferVideoCodec = (outPath) => {
  const ext = window.injected.pathExt(outPath);
  switch (ext) {
    case '.webm':
      return 'libvpx-vp9';
    case '.mp4':
      return 'libx264';
    default:
      return 'libx264';
  }
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

const cropWithFfmpeg = async (tempPath) => {
  const skipCrop =
    targetBounds.width === displayBounds.width &&
    targetBounds.height === displayBounds.height;
  if (skipCrop) {
    return;
  }

  const { x, y, width, height } = targetBounds;
  await window.injected.ffmpegRun(
    '-i',
    tempPath,
    '-vf',
    `crop=${width}:${height}:${x}:${y}`,
    '-c:v',
    `${inferVideoCodec(outputPath)}`,
    '-r',
    '30',
    outputPath
  );
};

const handleRecordStop = async (_event) => {
  const tempPath = getTempOutputPath();
  ensureTempDirPathExists(tempPath);

  const blob = new Blob(recordedChunks, { type: MEDIA_MIME_TYPE });
  const buffer = window.injected.newBuffer(await blob.arrayBuffer());
  window.injected.fsWriteFile(tempPath, buffer);

  await cropWithFfmpeg(tempPath);

  window.injected.ipcSend('recording-file-saved', {});
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
