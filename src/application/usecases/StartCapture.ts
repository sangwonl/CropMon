import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureStatus } from '@domain/models/common';
import { UiState } from '@domain/models/ui';

import StateManager from '@application/services/state';
import HookManager from '@application/services/hook';
import CaptureSession from '@application/services/capture/session';
import CaptureModeManager from '@application/services/capture/mode';
import PreferencesRepository from '@application/repositories/preferences';
import { UiDirector } from '@application/ports/director';
import { ScreenRecorder } from '@application/ports/recorder';

import { UseCase } from './UseCase';

@injectable()
export default class StartCaptureUseCase implements UseCase<void> {
  constructor(
    private prefsRepo: PreferencesRepository,
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  async execute() {
    const preparedCaptureOptions = this.captureSession.getCurCaptureOptions();
    if (!preparedCaptureOptions) {
      return;
    }

    // creating capture context and submit to recorder
    const prefs = await this.prefsRepo.fetchUserPreferences();
    const newCtx = this.captureSession.createCaptureContext(
      preparedCaptureOptions,
      prefs
    );

    try {
      await this.screenRecorder.record(newCtx);
      newCtx.status = CaptureStatus.IN_PROGRESS;
    } catch (e) {
      newCtx.status = CaptureStatus.ERROR;
    }

    // handle ui state
    const isRecording = newCtx.status === CaptureStatus.IN_PROGRESS;
    if (!isRecording) {
      this.captureModeManager.disableCaptureMode();
    } else {
      this.uiDirector.enableRecordingMode();
      this.stateManager.updateUiState((state: UiState): UiState => {
        return {
          ...state,
          captureOverlay: {
            ...state.captureOverlay,
            isRecording,
          },
        };
      });
    }

    // hook
    this.hookManager.emit('capture-starting', { captureContext: newCtx });
  }
}
