export const getNowAsYYYYMMDDHHmmss = () => {
  // https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
  const tzoffset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, -1);
  return localISOTime.split('.')[0].replace(/[-:T]/g, '');
};

export const getTimeInSeconds = () => {
  return Math.floor(new Date().getTime() / 1000);
};

/**
 * Returns duration in ms which is extracted from string
 *
 * @param durationStr - duration in string, e.g.) '00:00:05.84'
 * @returns duration in ms
 */
export const getDurationFromString = (durationStr: string): number => {
  const parts = durationStr.split(':');
  const hours = Number.parseInt(parts[0], 10);
  const minutes = Number.parseInt(parts[1], 10);
  const seconds = Number.parseFloat(parts[2]);
  const durationInSec = hours * 60 * 60 + minutes * 60 + seconds;
  return durationInSec * 1000;
};
