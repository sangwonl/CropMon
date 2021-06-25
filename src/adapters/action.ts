/* eslint-disable import/prefer-default-export */

import { injectable } from 'inversify';

import { CaptureMode } from '@core/entities/capture';
import { IBounds } from '@core/entities/screen';
import { AppUseCase } from '@core/usecases/app';
import { CaptureUseCase } from '@core/usecases/capture';

@injectable()
export class ActionDispatcher {
  constructor(
    private appUseCase: AppUseCase,
    private captureUseCase: CaptureUseCase
  ) {}

  checkForUpdates() {
    this.appUseCase.checkForUpdates();
  }

  showAboutPopup() {
    this.appUseCase.showAboutPopup();
  }

  enableCaptureSelection() {
    this.captureUseCase.enableCaptureSelection();
  }

  disableCaptureSelection() {
    this.captureUseCase.disableCaptureSelection();
  }

  startAreaSelection(screenId: number) {
    this.captureUseCase.startAreaSelection(screenId);
  }

  finishAreaSelection(bounds: IBounds) {
    this.captureUseCase.finishAreaSelection(bounds);
  }

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
