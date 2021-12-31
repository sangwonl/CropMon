/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-explicit-any */

const { app, contextBridge } = require('electron');
// const path = require('path');
// const fs = require('fs');

contextBridge.exposeInMainWorld('remote', {
  getAppPath: (name) => app.getPath(name),
  // getAppTempPath: () => remote.app.getPath('temp'),
  // newBuffer: (blob) => Buffer.from(blob),
  // pathExt: (p) => path.extname(p),
  // pathDir: (p) => path.dirname(p),
  // pathJoin() {
  //   return path.join.apply(null, arguments);
  // },
  // fsExists: (p) => fs.existsSync(p),
  // fsMakeDir: (p) => fs.mkdirSync(p, { recursive: true }),
  // fsWriteFile: (p, data) => fs.writeFileSync(p, data),
  // ipcSend: (e, data) => ipcRenderer.send(e, data),
  // ipcOn: (ch, listener) => ipcRenderer.on(ch, listener),
  // getCapturerSources: (opts) => desktopCapturer.getSources(opts),
});

contextBridge.exposeInMainWorld('env', {
  platform: process.platform,
  stage: process.env.NODE_ENV,
  webpackPort: process.env.PORT,
});
