/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Bounds } from '@domain/models/screen';
import { alignedBounds } from '@utils/bounds';

function simpleResizeTransform(srcBounds: Bounds): TransformStream {
  const visibleRect = alignedBounds(srcBounds);

  return new TransformStream({
    transform: async (
      frame: VideoFrame,
      controller: TransformStreamDefaultController
    ) => {
      const resizedFrame = new VideoFrame(frame as any, { visibleRect });
      frame.close();

      controller.enqueue(resizedFrame);
    },
  });
}

function resizeAndMergeTransform(
  srcBounds: Bounds,
  dstBounds: Bounds,
  canvasCtx: OffscreenCanvasRenderingContext2D,
  skipEnqueue: boolean
): TransformStream {
  const visibleRect = alignedBounds(srcBounds);

  return new TransformStream({
    transform: async (
      frame: VideoFrame,
      controller: TransformStreamDefaultController
    ) => {
      const resizedFrame = new VideoFrame(frame as any, { visibleRect });
      frame.close();

      canvasCtx.drawImage(
        resizedFrame,
        dstBounds.x,
        dstBounds.y,
        dstBounds.width,
        dstBounds.height
      );
      resizedFrame.close();

      if (!skipEnqueue) {
        controller.enqueue(
          new VideoFrame(canvasCtx.canvas as any, {
            timestamp: frame.timestamp!,
          })
        );
      }
    },
  });
}

function composeSimpleResizePipeline(
  writable: WritableStream<VideoFrame>,
  readable: ReadableStream<VideoFrame>,
  srcBounds: Bounds
) {
  readable.pipeThrough(simpleResizeTransform(srcBounds)).pipeTo(writable);
}

function composeResizeAndMergePipeline(
  writable: WritableStream<VideoFrame>,
  nullWritable: WritableStream<VideoFrame>,
  readables: ReadableStream<VideoFrame>[],
  boundsList: { srcBounds: Bounds; dstBounds: Bounds }[],
  canvasBounds: Bounds
) {
  const canvas = new OffscreenCanvas(canvasBounds.width, canvasBounds.height);
  const canvasCtx = canvas.getContext('2d')!;

  // 공용 캔바스를 하나 두고
  // N-1 개의 readables 들은 transform 까지만 pipe 함으로써 캔바스에 그리고
  // N 번째 readable 은 pipeTo(writable) 까지하여 캔바스로부터 VideoFrame 을 만드는 방식

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < readables.length - 1; i++) {
    const { srcBounds, dstBounds } = boundsList[i];
    readables[i]
      .pipeThrough(
        resizeAndMergeTransform(srcBounds, dstBounds, canvasCtx, true)
      )
      .pipeTo(nullWritable);
  }

  const lastReadableIdx = readables.length - 1;
  const { srcBounds, dstBounds } = boundsList[lastReadableIdx];
  readables[lastReadableIdx]
    .pipeThrough(
      resizeAndMergeTransform(srcBounds, dstBounds, canvasCtx, false)
    )
    .pipeTo(writable);
}

onmessage = (event) => {
  const { canvasBounds, boundsList, readables, writable, nullWritable } =
    event.data;

  // simple resize 왜 안되냐..
  // if (readables.length === 1) {
  //   composeSimpleResizePipeline(
  //     writable,
  //     readables[0],
  //     boundsList[0].srcBounds
  //   );
  // } else {
  composeResizeAndMergePipeline(
    writable,
    nullWritable,
    readables,
    boundsList,
    canvasBounds
  );
  // }
};
