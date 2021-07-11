/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import 'reflect-metadata';

import path from 'path';
import assert from 'assert';
import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types';
import {
  CaptureStatus,
  ICaptureOption,
  createCaptureContext,
  ICaptureContext,
} from '@core/entities/capture';
import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IUiDirector } from '@core/interfaces/director';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { IUiState } from '@core/entities/ui';
import { IBounds } from '@core/entities/screen';

import { PreferencesUseCase } from './preferences';

@injectable()
export class CaptureUseCase {
  private lastCaptureCtx: ICaptureContext | undefined;

  constructor(
    private prefsUseCase: PreferencesUseCase,
    private stateManager: StateManager,
    @inject(TYPES.ScreenRecorder) private screenRecorder: IScreenRecorder,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
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

  finishAreaSelection(bounds: IBounds) {
    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          ...state.captureArea,
          selectedBounds: bounds,
        },
      };
    });
  }

  async startCapture(option: ICaptureOption): Promise<void> {
    const prefs = await this.prefsUseCase.fetchUserPreferences();
    const newCtx = createCaptureContext(option, prefs.recordHome);

    try {
      await this.screenRecorder.record(newCtx);
      newCtx.status = CaptureStatus.IN_PROGRESS;
      this.tracker.eventL('capture', 'start-capture', 'success');
    } catch (e) {
      newCtx.status = CaptureStatus.ERROR;
      this.tracker.eventL('capture', 'start-capture', 'fail');
    }

    this.lastCaptureCtx = newCtx;

    const isRecording = newCtx.status === CaptureStatus.IN_PROGRESS;
    if (isRecording) {
      this.uiDirector.enableRecordingMode();
    } else {
      this.disableCaptureSelection();
    }

    await this.uiDirector.refreshTrayState(prefs, isRecording);
  }

  async finishCapture(): Promise<void> {
    this.disableCaptureSelection();

    const curCtx = this.lastCaptureCtx;
    assert(curCtx !== undefined);

    let newStatus = curCtx.status;
    try {
      await this.screenRecorder.finish(curCtx);
      newStatus = CaptureStatus.FINISHED;

      const duration = dayjs().second() - curCtx.createdAt;
      this.tracker.eventLV('capture', 'finish-capture', 'duration', duration);
    } catch (e) {
      newStatus = CaptureStatus.ERROR;
      this.tracker.eventL('capture', 'finish-capture', 'fail');
    }

    const newCtx = { ...curCtx, status: newStatus };
    this.lastCaptureCtx = newCtx;

    const prefs = await this.prefsUseCase.fetchUserPreferences();
    if (
      newCtx.outputPath &&
      newCtx.status === CaptureStatus.FINISHED &&
      prefs.openRecordHomeWhenRecordCompleted
    ) {
      this.uiDirector.showItemInFolder(newCtx.outputPath);
    }

    await this.uiDirector.refreshTrayState(prefs, false);
  }
}
