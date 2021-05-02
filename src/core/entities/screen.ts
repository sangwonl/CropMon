/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

export class ScreenBounds {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }
}

export class ScreenInfo {
  id: number;
  bounds: ScreenBounds;

  constructor(id: number, bounds: ScreenBounds) {
    this.id = id;
    this.bounds = bounds;
  }
}
