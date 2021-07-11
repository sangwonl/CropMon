/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable import/prefer-default-export */

import { Display, screen } from 'electron';

import { IBounds } from '@core/entities/screen';

// WORKAROUND: to fix non-clickable area at the nearest borders
// Same issue here: https://github.com/electron/electron/issues/21929
export const SPARE_PIXELS = 40;

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

export const calcAllScreenBounds = (): IBounds => {
  let left = Number.MAX_SAFE_INTEGER;
  let top = Number.MAX_SAFE_INTEGER;
  let right = Number.MIN_SAFE_INTEGER;
  let bottom = Number.MIN_SAFE_INTEGER;

  screen.getAllDisplays().forEach((d: Display) => {
    const { bounds: b, scaleFactor: s } = d;
    left = Math.min(left, b.x);
    top = Math.min(top, b.y);
    right = Math.floor(Math.max(right, b.x + b.width * s));
    bottom = Math.floor(Math.max(bottom, b.y + b.height * s));
  });

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};
