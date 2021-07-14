import { IBounds, IScreen } from '@core/entities/screen';

export interface ITargetSlice {
  screen: IScreen; // based origin (0, 0)
  bounds: IBounds; // intersected bounds only in this screen
}

export interface IRecordContext {
  targetSlices: ITargetSlice[];
  targetBounds: IBounds;
}
