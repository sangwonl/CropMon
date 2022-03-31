export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Screen {
  id: number;
  bounds: Bounds;
  scaleFactor: number;
}
