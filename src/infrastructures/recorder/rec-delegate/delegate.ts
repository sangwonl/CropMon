/* eslint-disable promise/always-return */
/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable radix */

import fs from 'fs';
import path from 'path';
import { desktopCapturer, ipcRenderer } from 'electron';

import { IBounds } from '@core/entities/screen';
import { getAppPath } from '@utils/remote';
import { getNowAsYYYYMMDDHHmmss } from '@utils/date';

import { IRecordContext, ITargetSlice } from './types';

// const MEDIA_MIME_TYPE = 'video/webm; codecs=h264';
const MEDIA_MIME_TYPE = 'video/webm; codecs=h264,opus';
const NUM_CHUNKS_TO_FLUSH = 100;

let gMediaRecorder: MediaRecorder;
let gRecordState: 'initial' | 'recording' | 'stopping' | 'stopped' = 'initial';
let gTempFilePath: string;
let gRecordedChunks: Blob[] = [];
let gTotalRecordedChunks = 0;

interface IDrawable {
  id: string;
  videoElem: HTMLVideoElement;
  srcBounds: IBounds;
  dstBounds: IBounds;
}

interface IDrawContext {
  targetBounds: IBounds;
  frameRate: number;
  drawables: IDrawable[];
}

const recorderOpts = (mimeType?: string, videoBitrates?: number) => {
  if (videoBitrates !== undefined) {
    return {
      mimeType: mimeType ?? MEDIA_MIME_TYPE,
      videoBitsPerSecond: videoBitrates,
    };
  }
  return { mimeType };
};

const getTempOutputPath = () => {
  const fileName = getNowAsYYYYMMDDHHmmss();
  return path.join(
    getAppPath('temp'),
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

const createDrawContext = async (
  recordCtx: IRecordContext
): Promise<IDrawContext> => {
  const { targetBounds, scaleDownFactor, frameRate, targetSlices } = recordCtx;

  const scaledTargetBounds = {
    x: 0,
    y: 0,
    width: targetBounds.width * scaleDownFactor,
    height: targetBounds.height * scaleDownFactor,
  };

  const sources = await desktopCapturer.getSources({ types: ['screen'] });
  const drawables = await Promise.all(
    targetSlices.map(
      async ({ screen, bounds }: ITargetSlice): Promise<IDrawable> => {
        const source = sources.find(
          (src) => src.display_id === screen.id.toString()
        );
        const constraints = getVideoConstraint(source!.id, screen.bounds);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        const videoElem = document.createElement('video') as HTMLVideoElement;
        videoElem.srcObject = stream;
        videoElem.play();

        const srcBounds: IBounds = {
          ...bounds,
          x: bounds.x - screen.bounds.x,
          y: bounds.y - screen.bounds.y,
        };

        const dstBounds: IBounds = {
          x: Math.floor(
            (screen.bounds.x + srcBounds.x - recordCtx.targetBounds.x) *
              recordCtx.scaleDownFactor
          ),
          y: Math.floor(
            (screen.bounds.y + srcBounds.y - recordCtx.targetBounds.y) *
              recordCtx.scaleDownFactor
          ),
          width: Math.floor(srcBounds.width * recordCtx.scaleDownFactor),
          height: Math.floor(srcBounds.height * recordCtx.scaleDownFactor),
        };

        return { id: source!.id, videoElem, srcBounds, dstBounds };
      }
    )
  );

  return {
    targetBounds: scaledTargetBounds,
    frameRate,
    drawables,
  };
};

const withCanvasProcess = (drawContext: IDrawContext): MediaStream => {
  const { targetBounds, frameRate, drawables } = drawContext;

  const imageCaptures: Map<string, ImageCapture> = new Map();
  drawables.forEach((d: IDrawable) => {
    const stream = d.videoElem.srcObject as MediaStream;
    const [track] = stream.getVideoTracks();
    imageCaptures.set(d.id, new ImageCapture(track));
  });

  const canvasElem = document.createElement('canvas') as any;
  canvasElem.width = targetBounds.width;
  canvasElem.height = targetBounds.height;
  const offscreenCanvas = canvasElem.transferControlToOffscreen();

  const drawWorker = new Worker('./worker.js');
  drawWorker.onmessage = (event: MessageEvent) => {
    if (event.data.type === 'stopped') {
      gMediaRecorder.stop();
    }
  };

  drawWorker.postMessage({ type: 'setup', offscreenCanvas, frameRate }, [
    offscreenCanvas,
  ]);

  let renderTimer: any;
  const renderCapturedToCanvas = () => {
    if (gRecordState === 'stopping') {
      clearInterval(renderTimer);
      drawWorker.postMessage({ type: 'stop' });
      return;
    }

    if (gRecordState === 'recording') {
      const promises = drawables.map(async (d: IDrawable) => {
        const imageBitmap = await imageCaptures.get(d.id)!.grabFrame();
        const { srcBounds, dstBounds } = d;
        return { imageBitmap, srcBounds, dstBounds };
      });

      Promise.all(promises)
        .then((renderData: any) => {
          drawWorker.postMessage({ type: 'render', renderData });
        })
        .catch(() => {});
    }
  };

  // In electron browser window web content, we can't use requestAnimationFrame..
  const interval = 1000 / frameRate;
  renderTimer = setInterval(renderCapturedToCanvas, interval);

  return canvasElem.captureStream(frameRate);
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

const createStreamToRecord = async (
  recordCtx: IRecordContext
): Promise<MediaStream> => {
  const { outputFormat, recordMicrophone } = recordCtx;

  const drawContext = await createDrawContext(recordCtx);
  const canvasStream = withCanvasProcess(drawContext);

  if (recordMicrophone && outputFormat !== 'gif') {
    await attachAudioStreamForMic(canvasStream);
  }

  return canvasStream;
};

const flushChunksToFile = async (chunks: Blob[]) => {
  if (chunks === undefined || chunks.length === 0) {
    return;
  }

  const blob = new Blob(chunks, { type: MEDIA_MIME_TYPE });
  const buffer = Buffer.from(await blob.arrayBuffer());
  await fs.promises.appendFile(gTempFilePath, buffer);
};

const handleStreamDataAvailable = async (event: BlobEvent) => {
  gRecordedChunks.push(event.data);
  gTotalRecordedChunks += 1;

  if (gRecordedChunks.length >= NUM_CHUNKS_TO_FLUSH) {
    const chunks = gRecordedChunks;
    gRecordedChunks = [];
    await flushChunksToFile(chunks);
  }
};

const handleRecordStop = async (_event: Event) => {
  gRecordState = 'stopped';
  await flushChunksToFile(gRecordedChunks);
  ipcRenderer.send('recording-file-saved', { tempFilePath: gTempFilePath });
};

ipcRenderer.on('start-record', async (_event, data) => {
  const recordCtx: IRecordContext = data.recordContext;
  const { videoBitrates } = recordCtx;

  const stream = await createStreamToRecord(recordCtx);
  const recOpts = recorderOpts(MEDIA_MIME_TYPE, videoBitrates);
  gMediaRecorder = new MediaRecorder(stream, recOpts);
  gMediaRecorder.ondataavailable = handleStreamDataAvailable;
  gMediaRecorder.onstop = handleRecordStop;

  gTempFilePath = getTempOutputPath();
  ensureTempDirPathExists(gTempFilePath);

  setTimeout(() => {
    gMediaRecorder.start(300);
    gRecordState = 'recording';
  });

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
});
