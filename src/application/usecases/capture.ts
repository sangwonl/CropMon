import { inject, injectable } from 'inversify';
import path from 'path';

import TYPES from '@di/types';

import { CaptureStatus, CaptureMode } from '@domain/models/common';
import {
  CaptureContext,
  RecordOptions,
  CaptureOptions,
} from '@domain/models/capture';
import { Preferences } from '@domain/models/preferences';
import { Bounds } from '@domain/models/screen';
import { INITIAL_UI_STATE, UiState } from '@domain/models/ui';

import StateManager from '@application/services/state';
import HookManager from '@application/services/hook';
import PreferencesRepository from '@application/repositories/preferences';
import { UiDirector } from '@application/ports/director';
import { ScreenRecorder } from '@application/ports/recorder';

import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

@injectable()
export default class CaptureUseCase {
  private preparedCaptureOptions?: CaptureOptions;
  private lastCaptureCtx?: CaptureContext;

  constructor(
    private prefsRepo: PreferencesRepository,
    private stateManager: StateManager,
    private hookManager: HookManager,
    @inject(TYPES.ScreenRecorder) private screenRecorder: ScreenRecorder,
    @inject(TYPES.UiDirector) private uiDirector: UiDirector
  ) {}

  curCaptureContext(): CaptureContext | undefined {
    return this.lastCaptureCtx;
  }

  async enableCaptureMode(captureMode?: CaptureMode) {
    const prefs = await this.prefsRepo.fetchUserPreferences();

    const lastCaptureMode = prefs.captureMode;
    const activeCaptureMode = captureMode ?? lastCaptureMode;

    this.uiDirector.enableCaptureMode(
      activeCaptureMode,
      (screenBounds: Bounds, screenId?: number) => {
        this.stateManager.updateUiState((state: UiState): UiState => {
          return {
            ...state,
            controlPanel: {
              ...INITIAL_UI_STATE.controlPanel,
              captureMode: activeCaptureMode,
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

    this.hookManager.emit('capture-mode-enabled', {
      captureMode: activeCaptureMode,
    });
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

    this.hookManager.emit('capture-mode-disabled', {});
  }

  async changeCaptureOptions(options: CaptureOptions) {
    const prefs = await this.prefsRepo.fetchUserPreferences();

    if (prefs.captureMode !== options.target.mode) {
      this.enableCaptureMode(options.target.mode);
      prefs.captureMode = options.target.mode;
    }

    this.prefsRepo.applyRecOptionsToPrefs(prefs, options.recordOptions);

    await this.prefsRepo.updateUserPreference(prefs);

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        controlPanel: {
          captureMode: options.target.mode,
          outputAsGif:
            options.recordOptions.enableOutputAsGif ??
            prefs.outputFormat === 'gif',
          lowQualityMode:
            options.recordOptions.enableLowQualityMode ??
            prefs.recordQualityMode === 'low',
          microphone:
            options.recordOptions.enableMicrophone ?? prefs.recordMicrophone,
          confirmedToCaptureAsIs: false,
        },
      };
    });

    this.hookManager.emit('capture-options-changed', {});
  }

  startTargetSelection() {
    this.uiDirector.startTargetSelection();

    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          isSelecting: true,
        },
      };
    });

    this.hookManager.emit('capture-selection-starting', {});
  }

  async finishTargetSelection(targetBounds: Bounds) {
    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          selectedBounds: targetBounds,
          isSelecting: false,
        },
      };
    });

    this.stateManager.queryUiState((state: UiState): void => {
      this.preparedCaptureOptions = {
        target: {
          mode: state.controlPanel.captureMode,
          bounds: state.captureOverlay.selectedBounds,
          screenId: state.captureOverlay.selectedScreenId,
        },
        recordOptions: {
          enableOutputAsGif: state.controlPanel.outputAsGif,
          enableLowQualityMode: state.controlPanel.lowQualityMode,
          enableMicrophone: state.controlPanel.microphone,
        },
      };
    });

    this.hookManager.emit('capture-selection-finished', {});
  }

  async startCapture(): Promise<void> {
    if (!this.preparedCaptureOptions) {
      return;
    }

    // creating capture context and submit to recorder
    const prefs = await this.prefsRepo.fetchUserPreferences();
    const newCtx = this.createCaptureContext(
      this.preparedCaptureOptions,
      prefs
    );

    try {
      await this.screenRecorder.record(newCtx);
      newCtx.status = CaptureStatus.IN_PROGRESS;
    } catch (e) {
      newCtx.status = CaptureStatus.ERROR;
    }

    this.lastCaptureCtx = newCtx;

    // handle ui state
    const isRecording = newCtx.status === CaptureStatus.IN_PROGRESS;
    if (!isRecording) {
      this.disableCaptureMode();
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

  async startCaptureWithCurrentStates(): Promise<void> {
    this.stateManager.updateUiState((state: UiState): UiState => {
      return {
        ...state,
        controlPanel: {
          ...state.controlPanel,
          confirmedToCaptureAsIs: true,
        },
      };
    });
  }

  async finishCapture(): Promise<void> {
    this.disableCaptureMode();

    if (!this.lastCaptureCtx) {
      return;
    }
    const curCtx = this.lastCaptureCtx;

    this.hookManager.emit('capture-finishing', { captureContext: curCtx });

    // stop recording
    let newStatus = curCtx.status;
    try {
      await this.screenRecorder.finish(curCtx);
      newStatus = CaptureStatus.FINISHED;
    } catch (e) {
      newStatus = CaptureStatus.ERROR;
    }

    const newCtx = {
      ...curCtx,
      status: newStatus,
      finishedAt: getTimeInSeconds(),
    };
    this.lastCaptureCtx = newCtx;

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

  async toggleRecordOptions(recordOptions: RecordOptions): Promise<void> {
    const prefs = await this.prefsRepo.fetchUserPreferences();

    this.prefsRepo.applyRecOptionsToPrefs(prefs, recordOptions);

    await this.prefsRepo.updateUserPreference(prefs);
  }

  private createCaptureContext = (
    options: CaptureOptions,
    prefs: Preferences
  ): CaptureContext => {
    const fileName = getNowAsYYYYMMDDHHmmss();
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`
    );

    return {
      target: options.target,
      status: CaptureStatus.PREPARED,
      createdAt: getTimeInSeconds(),
      outputPath: output,
      outputFormat: options.recordOptions.enableOutputAsGif ? 'gif' : 'mp4',
      lowQualityMode: options.recordOptions.enableLowQualityMode ?? false,
      recordMicrophone: options.recordOptions.enableMicrophone ?? false,
    };
  };
}
