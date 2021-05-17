/* eslint-disable import/prefer-default-export */

import { IBounds } from '@core/entities/screen';

// WORKAROUND: to fix non-clickable area at the nearest borders
// Same issue here: https://github.com/electron/electron/issues/21929
export const SPARE_PIXELS = 5;

export const emptyBounds = (): IBounds => {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};

export const isEmptyBounds = (bounds: IBounds): boolean => {
  return bounds.width === 0 && bounds.height === 0;
};

const MIN_REQUIRED_SIZE = 200;
export const isCapturableBounds = (bounds: IBounds): boolean => {
  return (
    bounds.width >= MIN_REQUIRED_SIZE && bounds.height >= MIN_REQUIRED_SIZE
  );
};
