/* eslint-disable import/prefer-default-export */

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const isEmptySize = (bounds: Bounds): boolean => {
  return bounds.width === 0 && bounds.height === 0;
};

const MIN_REQUIRED_SIZE = 200;
export const isCapturableSize = (bounds: Bounds): boolean => {
  return (
    bounds.width >= MIN_REQUIRED_SIZE && bounds.height >= MIN_REQUIRED_SIZE
  );
};
