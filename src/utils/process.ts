export const isMac = () => process.platform === 'darwin';
export const isWin = () => process.platform === 'win32';

export const isMain = () => process.type === 'browser';
export const isRenderer = () => process.type === 'renderer';
export const isWorker = () => process.type === 'worker';
