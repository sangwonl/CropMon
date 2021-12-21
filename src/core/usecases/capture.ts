/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import path from 'path';
import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import { CaptureStatus, CaptureMode } from '@core/entities/common';
import {
  ICaptureContext,
  IRecordOptions,
  ICaptureOptions,
} from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { INITIAL_UI_STATE, IUiState } from '@core/entities/ui';
import { IBounds } from '@core/entities/screen';
import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IHookManager } from '@core/interfaces/hook';
import { IUiDirector } from '@core/interfaces/director';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

@injectable()
export class CaptureUseCase {
  private preparedCaptureOptions?: ICaptureOptions;
  private lastCaptureCtx?: ICaptureContext;

  constructor(
    private prefsUseCase: PreferencesUseCase,
    private stateManager: StateManager,
    @inject(TYPES.ScreenRecorder) private screenRecorder: IScreenRecorder,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.HookManager) private hookManager: IHookManager
  ) {}

  curCaptureContext(): ICaptureContext | undefined {
    return this.lastCaptureCtx;
  }

  async enableCaptureMode(captureMode?: CaptureMode) {
    const prefs = await this.prefsUseCase.fetchUserPreferences();

    const lastCaptureMode = prefs.captureMode;
    const activeCaptureMode = captureMode ?? lastCaptureMode;

    this.uiDirector.enableCaptureMode(
      activeCaptureMode,
      (screenBounds: IBounds, screenId?: number) => {
        this.stateManager.updateUiState((state: IUiState): IUiState => {
          return {
            ...state,
            controlPanel: {
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

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureOverlay: {
          ...INITIAL_UI_STATE.captureOverlay,
        },
      };
    });

    this.hookManager.emit('capture-mode-disabled', {});
  }

  async changeCaptureOptions(options: ICaptureOptions) {
    const prefs = await this.prefsUseCase.fetchUserPreferences();

    if (prefs.captureMode !== options.target.mode) {
      this.enableCaptureMode(options.target.mode);
      prefs.captureMode = options.target.mode;
    }

    this.prefsUseCase.applyRecOptionsToPrefs(prefs, options.recordOptions);

    await this.prefsUseCase.updateUserPreference(prefs);

    this.stateManager.updateUiState((state: IUiState): IUiState => {
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
        },
      };
    });
  }

  startTargetSelection() {
    this.uiDirector.startTargetSelection();

    this.stateManager.updateUiState((state: IUiState): IUiState => {
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

  async finishTargetSelection(targetBounds: IBounds) {
    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          selectedBounds: targetBounds,
          selectedScreenId: state.captureOverlay.selectedScreenId,
          isSelecting: false,
        },
      };
    });

    this.stateManager.queryUiState((state: IUiState): void => {
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
    const prefs = await this.prefsUseCase.fetchUserPreferences();
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
      this.stateManager.updateUiState((state: IUiState): IUiState => {
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
    const prefs = await this.prefsUseCase.fetchUserPreferences();
    if (
      newCtx.outputPath &&
      newCtx.status === CaptureStatus.FINISHED &&
      prefs.openRecordHomeWhenRecordCompleted
    ) {
      this.uiDirector.showItemInFolder(newCtx.outputPath);
    }

    this.hookManager.emit('capture-finished', { captureContext: newCtx });
  }

  async toggleRecordOptions(recordOptions: IRecordOptions): Promise<void> {
    const prefs = await this.prefsUseCase.fetchUserPreferences();

    this.prefsUseCase.applyRecOptionsToPrefs(prefs, recordOptions);

    await this.prefsUseCase.updateUserPreference(prefs);
  }

  private createCaptureContext = (
    options: ICaptureOptions,
    prefs: IPreferences
  ): ICaptureContext => {
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
