import { systemPreferences } from 'electron';
import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';

import { CaptureMode } from '@domain/models/common';
import type { Screen } from '@domain/models/screen';
import type { PreferencesRepository } from '@domain/repositories/preferences';
import type { RecorderSource } from '@domain/services/recorder';

import { INITIAL_UI_STATE, type UiState } from '@application/models/ui';
import type { UiDirector } from '@application/ports/director';
import { StateManager } from '@application/services/state';

@injectable()
export class CaptureModeManager {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @inject(TYPES.PreferencesRepository)
    private prefsRepo: PreferencesRepository,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector,
    @inject(TYPES.RecorderSource) private recorderSource: RecorderSource,
    private stateManager: StateManager,
  ) {}

  async enableCaptureMode(captureMode: CaptureMode) {
    const prefs = await this.prefsRepo.fetchPreferences();

    const micGranted =
      systemPreferences.getMediaAccessStatus('microphone') === 'granted';

    const enabledAudioSrcIds = prefs.audioSources
      .filter(s => s.active)
      .map(s => s.id);

    const audioSources = await this.recorderSource.fetchAudioSources();
    audioSources.forEach(s => {
      s.active = micGranted && enabledAudioSrcIds.includes(s.id);
    });

    this.uiDirector.enableCaptureMode(
      captureMode,
      async (screens: Screen[], screenCursorOn?: Screen) => {
        const screenMap: { [screenId: number]: Screen } = {};
        screens.forEach(s => {
          screenMap[s.id] = s;
        });

        this.stateManager.updateUiState((state: UiState): UiState => {
          return {
            ...state,
            controlPanel: {
              ...INITIAL_UI_STATE.controlPanel,
              show: true,
              captureMode,
              outputFormat: prefs.outputFormat,
              recordAudio: prefs.recordAudio,
              audioSources,
            },
            captureOverlay: {
              ...INITIAL_UI_STATE.captureOverlay,
              show: true,
              showCountdown: prefs.showCountdown,
              screens: screenMap,
              selectedScreenId: screenCursorOn?.id,
              selectingBounds: screenCursorOn
                ? screenMap[screenCursorOn.id].bounds
                : undefined,
            },
            captureAreaColors: prefs.colors,
          };
        });
      },
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
        controlPanel: {
          ...INITIAL_UI_STATE.controlPanel,
        },
      };
    });
  }
}
