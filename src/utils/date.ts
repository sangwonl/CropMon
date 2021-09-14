/* eslint-disable import/prefer-default-export */

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
