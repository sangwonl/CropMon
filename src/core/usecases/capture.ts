/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import path from 'path';
import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import {
  CaptureStatus,
  ICaptureOption,
  ICaptureContext,
  IRecordingOptions,
} from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { INITIAL_UI_STATE, IUiState } from '@core/entities/ui';
import { IBounds } from '@core/entities/screen';
import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IHookManager } from '@core/interfaces/hook';
import { IUiDirector } from '@core/interfaces/director';
import { getNowAsYYYYMMDDHHmmss, getTimeInSeconds } from '@utils/date';

import { PreferencesUseCase } from './preferences';

@injectable()
export class CaptureUseCase {
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

  async enableCaptureSelection() {
    const screenBounds = this.uiDirector.enableCaptureSelectionMode();

    const prefs = await this.prefsUseCase.fetchUserPreferences();

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureOverlay: {
          ...INITIAL_UI_STATE.captureOverlay,
          show: true,
          showCountdown: prefs.showCountdown,
          bounds: screenBounds,
        },
        captureAreaColors: prefs.colors,
      };
    });

    this.hookManager.emit('capture-selection-starting', {});
  }

  disableCaptureSelection() {
    this.uiDirector.disableCaptureSelectionMode();

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureOverlay: {
          ...INITIAL_UI_STATE.captureOverlay,
        },
      };
    });

    this.hookManager.emit('capture-selection-finished', {});
  }

  startAreaSelection() {
    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          isSelecting: true,
        },
      };
    });
  }

  async finishAreaSelection(bounds: IBounds) {
    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          selectedBounds: bounds,
          isSelecting: false,
        },
      };
    });
  }

  async startCapture(option: ICaptureOption): Promise<void> {
    // creating capture context and submit to recorder
    const prefs = await this.prefsUseCase.fetchUserPreferences();
    const newCtx = this.createCaptureContext(option, prefs);

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
      this.disableCaptureSelection();
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

  private createCaptureContext = (
    option: ICaptureOption,
    prefs: IPreferences
  ): ICaptureContext => {
    const { mode, bounds } = option;
    const fileName = getNowAsYYYYMMDDHHmmss();
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`
    );

    return {
      target: { mode, bounds },
      status: CaptureStatus.PREPARED,
      createdAt: getTimeInSeconds(),
      outputPath: output,
      outputFormat: prefs.outputFormat,
      lowQualityMode: prefs.recordQualityMode === 'low',
      recordMicrophone: prefs.recordMicrophone,
    };
  };

  async finishCapture(): Promise<void> {
    this.disableCaptureSelection();

    if (this.lastCaptureCtx === undefined) {
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

  async toggleRecordingOptions(recOptions: IRecordingOptions): Promise<void> {
    const prefs = await this.prefsUseCase.fetchUserPreferences();

    if (recOptions.enableLowQualityMode !== undefined) {
      prefs.recordQualityMode = recOptions.enableLowQualityMode
        ? 'low'
        : 'normal';
    }

    if (recOptions.enableOutputAsGif !== undefined) {
      prefs.outputFormat = recOptions.enableOutputAsGif ? 'gif' : 'mp4';
    }

    if (recOptions.enableRecordMicrophone !== undefined) {
      prefs.recordMicrophone = recOptions.enableRecordMicrophone;
    }

    await this.prefsUseCase.updateUserPreference(prefs);
  }
}
