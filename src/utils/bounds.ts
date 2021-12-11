/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable import/prefer-default-export */

import { Display, Rectangle, screen } from 'electron';

import { IBounds, IPoint, IScreen } from '@core/entities/screen';
import { isMac } from '@utils/process';

export const MIN_REQUIRED_SIZE = 16; // limited by code macroblock size

export const emptyBounds = (): IBounds => {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};

export const isEmptyBounds = (bounds?: IBounds | null): boolean => {
  return (
    bounds === undefined ||
    bounds === null ||
    bounds.width === 0 ||
    bounds.height === 0
  );
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

export const isPointInsideBounds = (pt: IPoint, bounds: IBounds): boolean => {
  return (
    bounds.x <= pt.x &&
    pt.x <= bounds.x + bounds.width &&
    bounds.y <= pt.y &&
    pt.y <= bounds.y + bounds.height
  );
};

export const getAllScreensFromLeftTop = (): IScreen[] => {
  const screens = getAllScreens();
  const screenBounds = calcScreenBounds(screens);
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

export const getWholeScreenBounds = (): IBounds => {
  return calcScreenBounds(getAllScreens());
};

export const adjustSelectionBounds = (bounds: IBounds): IBounds => {
  const screenBounds = getWholeScreenBounds();
  return {
    ...bounds,
    x: bounds.x - screenBounds.x,
    y: bounds.y - screenBounds.y,
  };
};

export const getScreenOfCursor = (): IScreen => {
  const cursorPoint = getCursorScreenPoint();
  return screen
    .getAllDisplays()
    .map(mapDisplayToScreen)
    .find((s) => {
      return isPointInsideBounds(
        cursorPoint,
        screen.dipToScreenRect(null, s.bounds as Rectangle)
      );
    })!;
};

const getAllScreens = (): IScreen[] => {
  const screens = screen.getAllDisplays().map(mapDisplayToScreen);
  if (isMac()) {
    return screens;
  }
  return screens.map((s: IScreen) => {
    return {
      ...s,
      bounds: screen.dipToScreenRect(null, s.bounds as Rectangle) as IBounds,
    };
  });
};

const mapDisplayToScreen = ({ id, bounds, scaleFactor }: Display): IScreen => {
  return { id, bounds, scaleFactor };
};

const calcScreenBounds = (screens: IScreen[]): IBounds => {
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

const getCursorScreenPoint = () => {
  if (isMac()) {
    // because mac doesn't support dipToScreenPoint
    return screen.getCursorScreenPoint();
  }
  return screen.dipToScreenPoint(screen.getCursorScreenPoint());
};
