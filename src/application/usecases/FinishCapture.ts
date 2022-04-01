import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureStatus } from '@domain/models/common';

import { UseCase } from '@application/usecases/UseCase';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/capture/mode';
import CaptureSession from '@application/services/capture/session';
import PreferencesRepository from '@application/repositories/preferences';
import { UiDirector } from '@application/ports/director';
import { ScreenRecorder } from '@application/ports/recorder';

import { getTimeInSeconds } from '@utils/date';

@injectable()
export default class FinishCaptureUseCase implements UseCase<void> {
  constructor(
    private prefsRepo: PreferencesRepository,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    this.captureModeManager.disableCaptureMode();

    const curCaptureCtx = this.captureSession.getCurCaptureContext();
    if (!curCaptureCtx) {
      return;
    }

    this.hookManager.emit('capture-finishing', {
      captureContext: curCaptureCtx,
    });

    // stop recording
    let newStatus = curCaptureCtx.status;
    try {
      await this.screenRecorder.finish(curCaptureCtx);
      newStatus = CaptureStatus.FINISHED;
    } catch (e) {
      newStatus = CaptureStatus.ERROR;
    }

    const newCtx = {
      ...curCaptureCtx,
      status: newStatus,
      finishedAt: getTimeInSeconds(),
    };
    this.captureSession.updateCurCaptureContext(newCtx);

    // open folder where recoding file saved
    const prefs = await this.prefsRepo.fetchUserPreferences();
    if (
      newCtx.outputPath &&
      newCtx.status === CaptureStatus.FINISHED &&
      prefs.openRecordHomeWhenRecordCompleted
    ) {
      this.uiDirector.showItemInFolder(newCtx.outputPath);
    }

    this.hookManager.emit('capture-finished', { captureContext: newCtx });
  }
}
