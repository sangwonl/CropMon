/* eslint-disable no-restricted-globals */

let gDrawContext;
let gFrameRate;
let gRenderDataQueue;
let gRenderStop = false;
let gPrevFrameTime = 0;

const setup = (data) => {
  const { offscreenCanvas, frameRate } = data;
  gDrawContext = offscreenCanvas.getContext('2d');
  gFrameRate = frameRate;
  gPrevFrameTime = 0;
  gRenderDataQueue = [];
};

let gLastRenderCapturedTime = 0;
const renderCapturedImage = (frameTime) => {
  gLastRenderCapturedTime += frameTime;

  const renderData = gRenderDataQueue.shift();
  if (!renderData) {
    return;
  }

  const frameInterval = 1000 / gFrameRate;
  if (gLastRenderCapturedTime < frameInterval) {
    return;
  }

  renderData.forEach((d) => {
    gDrawContext.drawImage(
      d.imageBitmap,
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

  gLastRenderCapturedTime = 0;
};

const render = (time) => {
  if (gPrevFrameTime === 0) {
    gPrevFrameTime = time;
  }

  const frameTime = time - gPrevFrameTime;

  renderCapturedImage(frameTime);

  if (!gRenderStop || gRenderDataQueue.length > 0) {
    requestAnimationFrame(render);
  } else {
    postMessage({ type: 'stopped' });
  }

  gPrevFrameTime = time;
};

addEventListener('message', (event) => {
  if (event.data.type === 'setup') {
    setup(event.data);
    requestAnimationFrame(render);
  } else if (event.data.type === 'stop') {
    gRenderStop = true;
  } else if (event.data.type === 'render' && gDrawContext) {
    gRenderDataQueue.push(event.data.renderData);
  }
});
