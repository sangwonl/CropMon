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

export const getWholeScreenBounds = (): IBounds => {
  let left = Number.MAX_SAFE_INTEGER;
  let top = Number.MAX_SAFE_INTEGER;
  let right = Number.MIN_SAFE_INTEGER;
  let bottom = Number.MIN_SAFE_INTEGER;

  const { scaleFactor: primScale } = screen.getPrimaryDisplay();
  screen.getAllDisplays().forEach((d: Display) => {
    const { bounds: b, scaleFactor: s } = d;
    left = Math.min(left, Math.floor(b.x * (s / primScale)));
    top = Math.min(top, Math.floor(b.y * (s / primScale)));
    right = Math.max(right, Math.floor((b.x + b.width) * (s / primScale)));
    bottom = Math.max(bottom, Math.floor((b.y + b.height) * (s / primScale)));
  });

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const adjustSelectionBounds = (bounds: IBounds): IBounds => {
  const screenBounds = getWholeScreenBounds();
  const { scaleFactor: primScale } = screen.getPrimaryDisplay();

  let totalWidth = 0;
  let totalHeight = 0;

  screen.getAllDisplays().forEach((d: Display) => {
    const { bounds: b, scaleFactor: s } = d;
    totalWidth += Math.floor(b.width * (s / primScale));
    totalHeight += Math.floor(b.height * (s / primScale));
  });

  const horzJoint = totalWidth - screenBounds.width;
  const vertJoint = totalHeight - screenBounds.height;

  return {
    x: bounds.x - Math.floor(horzJoint / primScale),
    y: bounds.y - Math.floor(vertJoint / primScale),
    width: bounds.width,
    height: bounds.height,
  };
};
