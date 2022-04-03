import { inject, injectable } from 'inversify';

import TYPES from '@di/types';

import { CaptureMode } from '@domain/models/common';
import { Bounds } from '@domain/models/screen';

import { INITIAL_UI_STATE, UiState } from '@application/models/ui';
import StateManager from '@application/services/state';
import { UiDirector } from '@application/ports/director';

import PreferencesRepository from '@adapters/repositories/preferences';

@injectable()
export default class CaptureModeManager {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository) private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    private stateManager: StateManager
  ) {}

  async enableCaptureMode(captureMode: CaptureMode) {
    const prefs = await this.prefsRepo.fetchUserPreferences();
    this.uiDirector.enableCaptureMode(
      captureMode,
      async (screenBounds: Bounds, screenId?: number) => {
        this.stateManager.updateUiState((state: UiState): UiState => {
          return {
            ...state,
            controlPanel: {
              ...INITIAL_UI_STATE.controlPanel,
              captureMode,
              outputAsGif: prefs.outputFormat === 'gif',
              lowQualityMode: prefs.recordQualityMode === 'low',
              microphone: prefs.recordMicrophone,
            },
            captureOverlay: {
              ...INITIAL_UI_STATE.captureOverlay,
              show: true,
              showCountdown: prefs.showCountdown,
              bounds: screenBounds,
              selectedScreenId: screenId,
            },
            captureAreaColors: prefs.colors,
          };
        });
      }
    );
  }

  disableCaptureMode() {
    this.uiDirector.disableCaptureMode();

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...INITIAL_UI_STATE.captureOverlay,
        },
      };
    });
  }
}
