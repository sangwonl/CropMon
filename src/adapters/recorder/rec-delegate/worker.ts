/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Bounds } from '@domain/models/screen';

function simpleResizeTransform(srcBounds: Bounds): TransformStream {
  return new TransformStream({
    transform: async (
      frame: VideoFrame,
      controller: TransformStreamDefaultController,
    ) => {
      const resizedFrame = new VideoFrame(frame as any, {
        visibleRect: srcBounds,
      });

      controller.enqueue(resizedFrame);

      frame.close();
    },
  });
}

function composeSimpleResizePipeline(
  readable: ReadableStream<VideoFrame>,
  writable: WritableStream<VideoFrame>,
  srcBounds: Bounds,
) {
  readable.pipeThrough(simpleResizeTransform(srcBounds)).pipeTo(writable);
}

function onTransformStream(
  frame: VideoFrame,
  controller: TransformStreamDefaultController,
  canvasCtx: OffscreenCanvasRenderingContext2D,
  srcBounds: Bounds,
  dstBounds: Bounds,
  skipEnqueue: boolean,
) {
  const resizedFrame = new VideoFrame(frame as any, { visibleRect: srcBounds });

  canvasCtx.drawImage(
    resizedFrame,
    dstBounds.x,
    dstBounds.y,
    dstBounds.width,
    dstBounds.height,
  );

  resizedFrame.close();

  if (!skipEnqueue) {
    controller.enqueue(
      new VideoFrame(canvasCtx.canvas as any, {
        timestamp: frame.timestamp!,
      }),
    );
  }

  frame.close();
}

function resizeAndMergeTransform(
  srcBounds: Bounds,
  dstBounds: Bounds,
  canvasCtx: OffscreenCanvasRenderingContext2D,
  skipEnqueue: boolean,
): TransformStream {
  return new TransformStream({
    transform: async (
      frame: VideoFrame,
      controller: TransformStreamDefaultController,
    ) => {
      onTransformStream(
        frame,
        controller,
        canvasCtx,
        srcBounds,
        dstBounds,
        skipEnqueue,
      );
    },
  });
}

function composeResizeAndMergePipeline(
  canvas: OffscreenCanvas,
  readables: ReadableStream<VideoFrame>[],
  nullWritables: WritableStream<VideoFrame>[],
  writable: WritableStream<VideoFrame>,
  boundsList: { srcBounds: Bounds; dstBounds: Bounds }[],
) {
  const canvasCtx = canvas.getContext('2d')!;

  // 공용 캔바스를 하나 두고
  // N-1 개의 readables 들은 transform 까지만 pipe 함으로써 캔바스에 그리고
  // N 번째 readable 은 pipeTo(writable) 까지하여 캔바스로부터 VideoFrame 을 만드는 방식

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < readables.length - 1; i++) {
    const { srcBounds, dstBounds } = boundsList[i];
    readables[i]
      .pipeThrough(
        resizeAndMergeTransform(srcBounds, dstBounds, canvasCtx, true),
      )
      .pipeTo(nullWritables[i]);
  }

  const lastReadableIdx = readables.length - 1;
  const { srcBounds, dstBounds } = boundsList[lastReadableIdx];
  readables[lastReadableIdx]
    .pipeThrough(
      resizeAndMergeTransform(srcBounds, dstBounds, canvasCtx, false),
    )
    .pipeTo(writable);
}

function processWithPipeline(data: any) {
  const { canvas, readables, nullWritables, writable, boundsList } = data;

  if (readables.length === 1) {
    composeSimpleResizePipeline(
      readables[0],
      writable,
      boundsList[0].srcBounds,
    );
  } else {
    composeResizeAndMergePipeline(
      canvas,
      readables,
      nullWritables,
      writable,
      boundsList,
    );
  }
}

onmessage = (event) => {
  const { data } = event;
  if (data.type === 'pipeline') {
    processWithPipeline(data);
  }
};
