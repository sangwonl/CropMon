/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable radix */

import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { desktopCapturer, ipcRenderer } from 'electron';

import { IBounds, IScreen } from '@core/entities/screen';
import { getApp } from '@utils/remote';
import { calcWholeScreenBounds, getIntersection } from '@utils/bounds';

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

const intersectedScreens = (screens: IScreen[], target: IBounds): IScreen[] => {
  return screens.filter((s) => getIntersection(s.bounds, target) !== undefined);
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

const getAllVideoStreams = async (
  screens: IScreen[]
): Promise<MediaStream[]> => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  return Promise.all(
    screens.map((s: IScreen) => {
      const source = sources.find((src) => src.display_id === s.id.toString());
      const constraints = getMediaConstraint(source!.id, s.bounds);
      return navigator.mediaDevices.getUserMedia(constraints);
    })
  );
};

const withCanvasProcess = (
  targetBounds: IBounds,
  targetScreens: IScreen[],
  streams: MediaStream[],
  frameRate: number
): MediaStream => {
  const canvasElem = document.createElement('canvas') as HTMLCanvasElement;
  canvasElem.width = targetBounds.width;
  canvasElem.height = targetBounds.height;
  const canvasCtx = canvasElem.getContext('2d');

  const drawCtx: any[] = targetScreens.map((s: IScreen, i: number) => {
    const videoElem = document.createElement('video') as HTMLVideoElement;
    videoElem.srcObject = streams[i];
    videoElem.play();

    const intersected = getIntersection(s.bounds, targetBounds)!;

    const srcBounds: IBounds = {
      ...intersected,
      x: intersected.x - targetScreens[i].bounds.x,
      y: intersected.y - targetScreens[i].bounds.y,
    };
    const dstBounds: IBounds = {
      ...srcBounds,
      x: targetScreens[i].bounds.x + srcBounds.x - targetBounds.x,
      y: targetScreens[i].bounds.y + srcBounds.y - targetBounds.y,
    };

    return {
      videoElem,
      srcBounds,
      dstBounds,
    };
  });

  const render = () => {
    drawCtx.forEach((ctx: any) => {
      canvasCtx!.drawImage(
        ctx.videoElem,
        ctx.srcBounds.x,
        ctx.srcBounds.y,
        ctx.srcBounds.width,
        ctx.srcBounds.height,
        ctx.dstBounds.x,
        ctx.dstBounds.y,
        ctx.dstBounds.width,
        ctx.dstBounds.height
      );
    });
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

ipcRenderer.on('start-record', async (_event, data) => {
  const { screens, targetBounds } = data;

  const screenBounds = calcWholeScreenBounds(screens);
  const screensFromZero = screens.map((s: IScreen): IScreen => {
    return {
      ...s,
      bounds: {
        ...s.bounds,
        x: s.bounds.x - screenBounds.x,
        y: s.bounds.y - screenBounds.y,
      },
    };
  });

  const targetScreens = intersectedScreens(screensFromZero, targetBounds);
  const streams = await getAllVideoStreams(targetScreens);
  if (streams === undefined || streams.length !== targetScreens.length) {
    ipcRenderer.send('recording-failed', {
      message: 'fail to create streams',
    });
    return;
  }

  const frameRate = 24;
  const canvasStream = withCanvasProcess(
    targetBounds,
    targetScreens,
    streams,
    frameRate
  );
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
