export type Point = {
  x: number;
  y: number;
};

export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Screen = {
  id: number;
  bounds: Bounds;
  scaleFactor: number;
  isPrimary: boolean;
};
