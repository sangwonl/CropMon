import { injectable } from 'inversify';

import { DomainException } from '@domain/exceptions';
import CaptureSession from '@domain/services/capture';

import type { UiState } from '@application/models/ui';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/mode';
import StateManager from '@application/services/state';
import type { UseCase } from '@application/usecases/UseCase';

@injectable()
export default class StartCaptureUseCase implements UseCase<void> {
  constructor(
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession,
  ) {}

  async execute() {
    try {
      this.updateUiForRecordingMode();

      const newCaptureCtx = await this.captureSession.startCapture();

      this.disableCaptureModeWhenFailToStartRecording();

      this.hookManager.emit('onCaptureStarting', {
        captureContext: newCaptureCtx,
        error: !this.captureSession.isInProgress(),
      });
    } catch (e) {
      // eslint-disable-next-line no-empty
      if (e instanceof DomainException) {
      }
    }
  }

  private updateUiForRecordingMode() {
    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          isRecording: true,
          isCountingDown: false,
        },
      };
    });
  }

  private disableCaptureModeWhenFailToStartRecording() {
    if (!this.captureSession.isInProgress()) {
      this.captureModeManager.disableCaptureMode();
    }
  }
}
