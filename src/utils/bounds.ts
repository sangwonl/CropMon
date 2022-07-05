import { Display, screen } from 'electron';

import { Bounds, Point, Screen } from '@domain/models/screen';

export const MIN_REQUIRED_SIZE = 16; // limited by code macroblock size

export const emptyBounds = (): Bounds => {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};

export const isEmptyBounds = (bounds?: Bounds | null): boolean => {
  return (
    bounds === undefined ||
    bounds === null ||
    bounds.width === 0 ||
    bounds.height === 0
  );
};

export const isCapturableBounds = (bounds: Bounds): boolean => {
  return (
    bounds.width >= MIN_REQUIRED_SIZE && bounds.height >= MIN_REQUIRED_SIZE
  );
};

export const getIntersection = (a: Bounds, b: Bounds): Bounds | undefined => {
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

export const isPointInsideBounds = (pt: Point, bounds: Bounds): boolean => {
  return (
    bounds.x <= pt.x &&
    pt.x <= bounds.x + bounds.width &&
    bounds.y <= pt.y &&
    pt.y <= bounds.y + bounds.height
  );
};

export const getAllScreens = (): Screen[] => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return screen
    .getAllDisplays()
    .map(({ id, bounds, scaleFactor }: Display) => ({
      id,
      bounds,
      scaleFactor,
      isPrimary: id === primaryDisplay.id,
    }));
};

export const getPrimaryScreenId = (): number => {
  return screen.getPrimaryDisplay().id;
};

export const mergeScreenBounds = (bounds: Bounds[]): Bounds => {
  let left = Number.MAX_SAFE_INTEGER;
  let top = Number.MAX_SAFE_INTEGER;
  let right = Number.MIN_SAFE_INTEGER;
  let bottom = Number.MIN_SAFE_INTEGER;

  bounds.forEach((b: Bounds) => {
    left = Math.min(left, b.x);
    top = Math.min(top, b.y);
    right = Math.max(right, b.x + b.width);
    bottom = Math.max(bottom, b.y + b.height);
  });

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const getScreenCursorOn = (): Screen => {
  const cursorPoint = screen.getCursorScreenPoint();
  const screens = getAllScreens();

  const foundScreen = screens.find((s) => {
    return isPointInsideBounds(cursorPoint, s.bounds);
  });

  return foundScreen ?? screens[0];
};
