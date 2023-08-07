import { screen, type Display } from 'electron';

import type { Bounds, Point, Screen } from '@domain/models/screen';

export const MIN_REQUIRED_SIZE = 16; // limited by code macroblock size

export function emptyBounds(): Bounds {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
}

export function isEmptyBounds(bounds?: Bounds | null): boolean {
  return (
    bounds === undefined ||
    bounds === null ||
    bounds.width === 0 ||
    bounds.height === 0
  );
}

export function isCapturableBounds(bounds: Bounds): boolean {
  return (
    bounds.width >= MIN_REQUIRED_SIZE && bounds.height >= MIN_REQUIRED_SIZE
  );
}

export function getIntersection(a: Bounds, b: Bounds): Bounds | undefined {
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
}

export function isPointInsideBounds(pt: Point, bounds: Bounds): boolean {
  return (
    bounds.x <= pt.x &&
    pt.x <= bounds.x + bounds.width &&
    bounds.y <= pt.y &&
    pt.y <= bounds.y + bounds.height
  );
}

export function getAllScreens(): Screen[] {
  const primaryDisplay = screen.getPrimaryDisplay();
  return screen
    .getAllDisplays()
    .map(({ id, bounds, scaleFactor }: Display) => ({
      id,
      bounds,
      scaleFactor,
      isPrimary: id === primaryDisplay.id,
    }));
}

export function getPrimaryScreenId(): number {
  return screen.getPrimaryDisplay().id;
}

export function mergeScreenBounds(bounds: Bounds[]): Bounds {
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
}

export function getScreenCursorOn(): Screen {
  const cursorPoint = screen.getCursorScreenPoint();
  const screens = getAllScreens();

  const foundScreen = screens.find(s => {
    return isPointInsideBounds(cursorPoint, s.bounds);
  });

  return foundScreen ?? screens[0];
}

export function alignedBounds(bounds: Bounds) {
  // NOTE:
  // Invalid visibleRect issue with not-sample-aligned in plane 1.
  return {
    x: bounds.x % 2 === 0 ? bounds.x : bounds.x + 1,
    y: bounds.y % 2 === 0 ? bounds.y : bounds.y + 1,
    width: bounds.width % 2 === 0 ? bounds.width : bounds.width - 1,
    height: bounds.height % 2 === 0 ? bounds.height : bounds.height - 1,
  };
}
