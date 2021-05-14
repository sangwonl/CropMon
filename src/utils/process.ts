export const isMac = () => process.platform === 'darwin';
export const isWin = () => process.platform === 'win32';

export const isMain = () => process.type === 'browser';
export const isRenderer = () => process.type === 'renderer';
export const isWorker = () => process.type === 'worker';

export const isProduction = () => process.env.NODE_ENV === 'production';
export const isDebugMode = () =>
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
