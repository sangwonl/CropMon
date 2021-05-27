/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */

const {
  remote,
  ipcRenderer,
  desktopCapturer,
  contextBridge,
} = require('electron');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const { createFFmpeg } = require('@ffmpeg/ffmpeg');

contextBridge.exposeInMainWorld('injected', {
  dateString: (fmt) => dayjs().format(fmt),
  getAppTempPath: () => remote.app.getPath('temp'),
  newBuffer: (blob) => Buffer.from(blob),
  pathExt: (p) => path.extname(p),
  pathDir: (p) => path.dirname(p),
  pathJoin() {
    return path.join.apply(null, arguments);
  },
  fsExists: (p) => fs.existsSync(p),
  fsMakeDir: (p) => fs.mkdirSync(p, { recursive: true }),
  fsWriteFile: (p, data) => fs.writeFileSync(p, data),
  ipcSend: (e, data) => ipcRenderer.send(e, data),
  ipcOn: (ch, listener) => ipcRenderer.on(ch, listener),
  getCapturerSources: (opts) => desktopCapturer.getSources(opts),
  async ffmpegRun() {
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    await ffmpeg.run.apply(null, arguments);
  },
});
