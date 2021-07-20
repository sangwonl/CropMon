/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable import/prefer-default-export */

import { Display, screen } from 'electron';

import { IBounds, IScreen } from '@core/entities/screen';

import { isMac } from './process';

// WORKAROUND: to fix non-clickable area at the nearest borders
// Same issue here: https://github.com/electron/electron/issues/21929
export const SPARE_PIXELS = 0;
export const MIN_REQUIRED_SIZE = 200;

export const emptyBounds = (): IBounds => {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};

export const isEmptyBounds = (bounds: IBounds | undefined): boolean => {
  return bounds === undefined || bounds.width === 0 || bounds.height === 0;
};

export const isCapturableBounds = (bounds: IBounds): boolean => {
  return (
    bounds.width >= MIN_REQUIRED_SIZE && bounds.height >= MIN_REQUIRED_SIZE
  );
};

export const getIntersection = (
  a: IBounds,
  b: IBounds
): IBounds | undefined => {
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  if (left > right || top > bottom) {
    return undefined;
  }
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const getAllScreens = (): IScreen[] => {
  return screen.getAllDisplays().map(mapDisplayToScreen);
};

export const getAllScreensFromLeftTop = (): IScreen[] => {
  const screens = getAllScreens();
  const screenBounds = unscaledScreenBounds(screens);
  return screens.map((s: IScreen): IScreen => {
    return {
      ...s,
      bounds: {
        ...s.bounds,
        x: s.bounds.x - screenBounds.x,
        y: s.bounds.y - screenBounds.y,
      },
    };
  });
};

export const getOverlayScreenBounds = (): IBounds => {
  if (isMac()) {
    return unscaledScreenBounds(getAllScreens());
  }
  return scaledScreenBounds(getAllScreens());
};

export const adjustSelectionBounds = (bounds: IBounds): IBounds => {
  if (isMac()) {
    return bounds;
  }
  const screenBounds = unscaledScreenBounds(getAllScreens());
  return {
    ...bounds,
    x: bounds.x - screenBounds.x,
    y: bounds.y - screenBounds.y,
  };
};

const mapDisplayToScreen = (d: Display): IScreen => {
  return {
    id: d.id,
    bounds: d.bounds,
    scaleFactor: d.scaleFactor,
  };
};

export const unscaledScreenBounds = (screens: IScreen[]): IBounds => {
  let left = Number.MAX_SAFE_INTEGER;
  let top = Number.MAX_SAFE_INTEGER;
  let right = Number.MIN_SAFE_INTEGER;
  let bottom = Number.MIN_SAFE_INTEGER;

  screens.forEach(({ bounds }: IScreen) => {
    left = Math.min(left, bounds.x);
    top = Math.min(top, bounds.y);
    right = Math.max(right, bounds.x + bounds.width);
    bottom = Math.max(bottom, bounds.y + bounds.height);
  });

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

const scaledScreenBounds = (screens: IScreen[]): IBounds => {
  const leftToRight = screens.sort((a: IScreen, b: IScreen) => {
    return a.bounds.x - b.bounds.x;
  });

  const left = leftToRight[0].bounds.x;
  let right = left;
  leftToRight.forEach((s: IScreen) => {
    right += Math.floor(s.bounds.width * s.scaleFactor);
  });

  const topToBottom = screens.sort((a: IScreen, b: IScreen) => {
    return a.bounds.y - b.bounds.y;
  });

  const top = topToBottom[0].bounds.y;
  let bottom = top;
  topToBottom.forEach((s: IScreen) => {
    bottom += Math.floor(s.bounds.height * s.scaleFactor);
  });

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};
