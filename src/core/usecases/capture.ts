/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import assert from 'assert';
import path from 'path';
import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import {
  CaptureStatus,
  ICaptureOption,
  ICaptureContext,
  CaptureMode,
} from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { IRecordingOptions, IUiState } from '@core/entities/ui';
import { IBounds } from '@core/entities/screen';
import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IHookManager } from '@core/interfaces/hook';
import { IUiDirector } from '@core/interfaces/director';
import { IAnalyticsTracker } from '@core/interfaces/tracker';

import { PreferencesUseCase } from './preferences';

@injectable()
export class CaptureUseCase {
  private lastCaptureCtx: ICaptureContext | undefined;

  constructor(
    private prefsUseCase: PreferencesUseCase,
    private stateManager: StateManager,
    @inject(TYPES.ScreenRecorder) private screenRecorder: IScreenRecorder,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.HookManager) private hookManager: IHookManager,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  curCaptureContext(): ICaptureContext | undefined {
    return this.lastCaptureCtx;
  }

  enableCaptureSelection() {
    const screenBounds = this.uiDirector.enableCaptureSelectionMode();

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          selectedBounds: undefined,
          isSelecting: true,
          isRecording: false,
        },
        captureOverlay: {
          show: true,
          bounds: screenBounds,
        },
      };
    });
  }

  disableCaptureSelection() {
    this.uiDirector.disableCaptureSelectionMode();

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          selectedBounds: undefined,
          isSelecting: false,
          isRecording: false,
        },
        captureOverlay: {
          ...state.captureOverlay,
          show: false,
        },
      };
    });
  }

  startAreaSelection() {
    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          ...state.captureArea,
          selectedBounds: undefined,
        },
      };
    });
  }

  async finishAreaSelectionAndStartCapture(bounds: IBounds) {
    await this.startCapture({ mode: CaptureMode.AREA, bounds });
  }

  private async startCapture(option: ICaptureOption): Promise<void> {
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
    if (isRecording) {
      this.uiDirector.enableRecordingMode();
    } else {
      this.disableCaptureSelection();
    }

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          ...state.captureArea,
          selectedBounds: option.bounds,
          isRecording,
        },
      };
    });

    await this.uiDirector.refreshTrayState(prefs, isRecording);

    // hook
    this.hookManager.emit('capture-starting', { captureContext: newCtx });
  }

  private createCaptureContext = (
    option: ICaptureOption,
    prefs: IPreferences
  ): ICaptureContext => {
    const { mode, bounds } = option;
    const fileName = dayjs().format('YYYYMMDDHHmmss');
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`
    );

    return {
      target: { mode, bounds },
      status: CaptureStatus.PREPARED,
      createdAt: dayjs().second(),
      outputPath: output,
      outputFormat: prefs.outputFormat,
      lowQualityMode: prefs.recordQualityMode === 'low',
      recordMicrophone: prefs.recordMicrophone,
    };
  };

  async finishCapture(): Promise<void> {
    this.disableCaptureSelection();

    // stop recording
    const curCtx = this.lastCaptureCtx;
    assert(curCtx !== undefined);

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
      finishedAt: dayjs().second(),
    };
    this.lastCaptureCtx = newCtx;

    // handle ui state
    const prefs = await this.prefsUseCase.fetchUserPreferences();
    if (
      newCtx.outputPath &&
      newCtx.status === CaptureStatus.FINISHED &&
      prefs.openRecordHomeWhenRecordCompleted
    ) {
      this.uiDirector.showItemInFolder(newCtx.outputPath);
    }

    await this.uiDirector.refreshTrayState(prefs, false);

    // hook
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
