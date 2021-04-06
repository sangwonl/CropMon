export const isMain = () => process.type === 'browser';
export const isRenderer = () => process.type === 'renderer';
export const isWorker = () => process.type === 'worker';
