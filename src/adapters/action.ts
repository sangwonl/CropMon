/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';

import { CaptureMode } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { CaptureUseCase } from '@core/usecases/capture';

@injectable()
export class ActionDispatcher {
  constructor(private captureUseCase: CaptureUseCase) {}

  startCapture(screenId: number, bounds?: IBounds | undefined) {
    this.captureUseCase.startCapture({
      mode: CaptureMode.AREA,
      screenId,
      bounds,
    });
  }

  finishCapture() {
    this.captureUseCase.finishCapture();
  }
}
