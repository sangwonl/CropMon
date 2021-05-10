/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable import/prefer-default-export */

interface IBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

  static fromBounds(bounds: IBounds): ScreenBounds {
    return new ScreenBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  scaleBy(scaleFactor: number): ScreenBounds {
    return new ScreenBounds(
      this.x * scaleFactor,
      this.y * scaleFactor,
      this.width * scaleFactor,
      this.height * scaleFactor
    );
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
