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
import {
  CaptureStatus,
  ICaptureTarget,
  ICaptureContext,
  IRecordOptions,
  CaptureMode,
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
  private preparedTarget?: ICaptureTarget;
  private preparedRecordOptions?: IRecordOptions;

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

    const lastCaptureMode = CaptureMode.AREA; // prefs.lastCaptureMode;

    const activeCaptureMode = captureMode ?? lastCaptureMode;

    this.uiDirector.enableCaptureMode(
      activeCaptureMode,
      (screenBounds: IBounds) => {
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
      }
    );

    this.hookManager.emit('capture-selection-starting', {
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

    this.hookManager.emit('capture-selection-finished', {});
  }

  startTargetSelection() {
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

  async finishTargetSelection(
    target: ICaptureTarget,
    recordOptions: IRecordOptions
  ) {
    this.preparedTarget = target;
    this.preparedRecordOptions = recordOptions;

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureOverlay: {
          ...state.captureOverlay,
          selectedBounds: target.bounds ?? null,
          selectedScreenId: target.screenId ?? null,
          isSelecting: false,
        },
      };
    });
  }

  async startCapture(): Promise<void> {
    if (!this.preparedTarget || !this.preparedRecordOptions) {
      return;
    }

    // creating capture context and submit to recorder
    const prefs = await this.prefsUseCase.fetchUserPreferences();
    const newCtx = this.createCaptureContext(
      this.preparedTarget,
      this.preparedRecordOptions,
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

    if (recordOptions.enableLowQualityMode !== undefined) {
      prefs.recordQualityMode = recordOptions.enableLowQualityMode
        ? 'low'
        : 'normal';
    }

    if (recordOptions.enableOutputAsGif !== undefined) {
      prefs.outputFormat = recordOptions.enableOutputAsGif ? 'gif' : 'mp4';
    }

    if (recordOptions.enableRecordMicrophone !== undefined) {
      prefs.recordMicrophone = recordOptions.enableRecordMicrophone;
    }

    await this.prefsUseCase.updateUserPreference(prefs);
  }

  private createCaptureContext = (
    target: ICaptureTarget,
    recordOptions: IRecordOptions,
    prefs: IPreferences
  ): ICaptureContext => {
    const fileName = getNowAsYYYYMMDDHHmmss();
    const output = path.join(
      prefs.recordHome,
      `${fileName}.${prefs.outputFormat}`
    );

    return {
      target,
      status: CaptureStatus.PREPARED,
      createdAt: getTimeInSeconds(),
      outputPath: output,
      outputFormat: recordOptions.enableOutputAsGif ? 'gif' : 'mp4',
      lowQualityMode: recordOptions.enableLowQualityMode ?? false,
      recordMicrophone: recordOptions.enableRecordMicrophone ?? false,
    };
  };
}
