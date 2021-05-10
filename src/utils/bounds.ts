/* eslint-disable import/prefer-default-export */

import { IScreenBounds } from '@presenters/redux/common/types';

// WORKAROUND to fix non-clickable area at the nearest borders
// Same issue here: https://github.com/electron/electron/issues/21929
export const SPARE_PIXELS = 5;

export const emptyBounds = (): IScreenBounds => {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};

export const isEmptyBounds = (bounds: IScreenBounds): boolean => {
  return bounds.width === 0 && bounds.height === 0;
};

const MIN_REQUIRED_SIZE = 200;
export const isCapturableBounds = (bounds: IScreenBounds): boolean => {
  return (
    bounds.width >= MIN_REQUIRED_SIZE && bounds.height >= MIN_REQUIRED_SIZE
  );
};
