export interface IBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IScreen {
  id: number;
  bounds: IBounds;
}
