/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Bounds } from '@domain/models/screen';

const alignBounds = (bounds: Bounds) => ({
  // WORKAROUND:
  // Invalid visibleRect issue with not-sample-aligned in plane 1.
  x: bounds.x % 2 === 0 ? bounds.x : bounds.x + 1,
  y: bounds.y % 2 === 0 ? bounds.y : bounds.y + 1,
  width: bounds.x % 2 === 0 ? bounds.width : bounds.width - 1,
  height: bounds.y % 2 === 0 ? bounds.height : bounds.height - 1,
});

const getTransformProc = (
  srcBounds: Bounds,
  dstBounds: Bounds,
  canvasCtx: OffscreenCanvasRenderingContext2D,
  skipEnqueue: boolean
) => {
  return async (
    frame: VideoFrame,
    controller: TransformStreamDefaultController
  ) => {
    const newFrame = new VideoFrame(frame as any, {
      visibleRect: alignBounds(srcBounds),
    });
    frame.close();

    canvasCtx.drawImage(
      newFrame,
      dstBounds.x,
      dstBounds.y,
      dstBounds.width,
      dstBounds.height
    );
    newFrame.close();

    if (!skipEnqueue) {
      controller.enqueue(
        new VideoFrame(canvasCtx.canvas as any, {
          timestamp: frame.timestamp!,
        })
      );
    }
  };
};

onmessage = (event) => {
  const { canvasBounds, boundsList, readables, writable, nullWritable } =
    event.data;

  const canvas = new OffscreenCanvas(canvasBounds.width, canvasBounds.height);
  const canvasCtx = canvas.getContext('2d')!;

  // 공용 캔바스를 하나 두고
  // N-1 개의 readables 들은 transform 까지만 pipe 함으로써 캔바스에 그리고
  // N 번째 readable 은 pipeTo(writable) 까지하여 캔바스로부터 VideoFrame 을 만드는 방식

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < readables.length - 1; i++) {
    const { srcBounds, dstBounds } = boundsList[i];
    const transform = getTransformProc(srcBounds, dstBounds, canvasCtx, true);

    readables[i]
      .pipeThrough(new TransformStream({ transform }))
      .pipeTo(nullWritable);
  }

  const lastReadableIdx = readables.length - 1;
  const { srcBounds, dstBounds } = boundsList[lastReadableIdx];
  readables[lastReadableIdx]
    .pipeThrough(
      new TransformStream({
        transform: getTransformProc(srcBounds, dstBounds, canvasCtx, false),
      })
    )
    .pipeTo(writable);
};
