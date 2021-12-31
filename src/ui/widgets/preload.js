const { contextBridge, screen } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('remote', {
  getCursorScreenPoint: () => {
    if (process.platform === 'darwin') {
      // because mac doesn't support dipToScreenPoint
      return screen.getCursorScreenPoint();
    }
    return screen.dipToScreenPoint(screen.getCursorScreenPoint());
  },
});

contextBridge.exposeInMainWorld('env', {
  platform: process.platform,
  stage: process.env.NODE_ENV,
  webpackPort: process.env.PORT,
});
