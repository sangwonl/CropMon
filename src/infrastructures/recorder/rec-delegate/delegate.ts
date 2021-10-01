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

let mediaRecorder: MediaRecorder;
let recordState: 'initial' | 'recording' | 'stopped' = 'initial';
let tempFilePath: string;
let recordedChunks: Blob[] = [];
let totalRecordedChunks = 0;

interface IDrawable {
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

        return { videoElem, srcBounds, dstBounds };
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

  const canvasElem = document.createElement('canvas') as HTMLCanvasElement;
  canvasElem.width = targetBounds.width;
  canvasElem.height = targetBounds.height;

  const canvasCtx = canvasElem.getContext('2d')!;
  const interval = Math.floor(1000 / frameRate);

  const renderCapturedToCanvas = () => {
    if (recordState === 'stopped') {
      return;
    }

    if (recordState === 'recording') {
      drawables.forEach((d: any) => {
        canvasCtx.drawImage(
          d.videoElem,
          d.srcBounds.x,
          d.srcBounds.y,
          d.srcBounds.width,
          d.srcBounds.height,
          d.dstBounds.x,
          d.dstBounds.y,
          d.dstBounds.width,
          d.dstBounds.height
        );
      });
    }
  };

  // In electron browser window web content, we can't use requestAnimationFrame..
  setInterval(renderCapturedToCanvas, interval);

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
  const { videoBitrates } = recordCtx;

  const stream = await createStreamToRecord(recordCtx);
  const recOpts = recorderOpts(MEDIA_MIME_TYPE, videoBitrates);
  mediaRecorder = new MediaRecorder(stream, recOpts);
  mediaRecorder.ondataavailable = handleStreamDataAvailable;
  mediaRecorder.onstop = handleRecordStop;

  tempFilePath = getTempOutputPath();
  ensureTempDirPathExists(tempFilePath);

  setTimeout(() => {
    mediaRecorder.start(300);
    recordState = 'recording';
  });

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
