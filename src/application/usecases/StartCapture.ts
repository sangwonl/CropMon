import { injectable } from 'inversify';

import { DomainException } from '@domain/exceptions';
import CaptureSession from '@domain/services/capture';

import { UseCase } from '@application/usecases/UseCase';
import { UiState } from '@application/models/ui';
import StateManager from '@application/services/ui/state';
import HookManager from '@application/services/hook';
import CaptureModeManager from '@application/services/ui/mode';

@injectable()
export default class StartCaptureUseCase implements UseCase<void> {
  constructor(
    private stateManager: StateManager,
    private hookManager: HookManager,
    private captureModeManager: CaptureModeManager,
    private captureSession: CaptureSession
  ) {}

  async execute() {
    try {
      this.updateUiForRecordingMode();

      const newCaptureCtx = await this.captureSession.startCapture();

      this.disableCaptureModeWhenFailToStartRecording();

      this.hookManager.emit('capture-starting', {
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
