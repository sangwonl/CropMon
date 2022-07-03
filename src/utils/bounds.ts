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
  return screen
    .getAllDisplays()
    .map(({ id, bounds, scaleFactor }: Display) => ({
      id,
      bounds,
      scaleFactor,
    }));
};

const calcScreenBounds = (screens: Screen[]): Bounds => {
  let left = Number.MAX_SAFE_INTEGER;
  let top = Number.MAX_SAFE_INTEGER;
  let right = Number.MIN_SAFE_INTEGER;
  let bottom = Number.MIN_SAFE_INTEGER;

  screens.forEach(({ bounds }: Screen) => {
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

export const getAllScreensFromLeftTop = (): Screen[] => {
  const screens = getAllScreens();
  const screenBounds = calcScreenBounds(screens);
  return screens.map((s: Screen): Screen => {
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

export const getScreenOfCursor = (): Screen => {
  const cursorPoint = screen.getCursorScreenPoint();
  const screens = getAllScreens();

  const foundScreen = screens.find((s) => {
    return isPointInsideBounds(cursorPoint, s.bounds);
  });

  return foundScreen ?? screens[0];
};

export const sliceIntersectedBounds = (
  selectedBounds: Bounds,
  screenBounds: Bounds[]
): Bounds[] => {
  const intersectedSlices: Bounds[] = [];
  screenBounds.forEach((sBounds) => {
    const intersected = getIntersection(selectedBounds, sBounds);
    if (!intersected) {
      return;
    }

    intersectedSlices.push({
      ...intersected,
      x: intersected.x - sBounds.x,
      y: intersected.y - sBounds.y,
    });
  });

  return intersectedSlices;
};
