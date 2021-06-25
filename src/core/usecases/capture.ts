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
} from '@core/entities/capture';
import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IUiDirector } from '@core/interfaces/director';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { ICaptureOverlays, IUiState } from '@core/entities/ui';
import { IBounds, IScreenInfo } from '@core/entities/screen';

@injectable()
export class CaptureUseCase {
  constructor(
    private stateManager: StateManager,
    @inject(TYPES.ScreenRecorder) private screenRecorder: IScreenRecorder,
    @inject(TYPES.UiDirector) private uiDirector: IUiDirector,
    @inject(TYPES.AnalyticsTracker) private tracker: IAnalyticsTracker
  ) {}

  enableCaptureSelection = () => {
    const screenInfos = this.uiDirector.enableCaptureSelectionMode();
    const captureOverlays: ICaptureOverlays = {};
    screenInfos.forEach((si: IScreenInfo) => {
      captureOverlays[si.id] = { show: true, screenInfo: si };
    });

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          ...state.captureArea,
          screenIdOnSelection: undefined,
          selectedBounds: undefined,
        },
        captureOverlays,
      };
    });
  };

  disableCaptureSelection = () => {
    this.uiDirector.disableCaptureSelectionMode();

    this.stateManager.updateUiState((state: IUiState): IUiState => {
      const captureOverlays: ICaptureOverlays = {};
      Object.keys(state.captureOverlays).forEach((k) => {
        // https://stackoverflow.com/questions/14667713/how-to-convert-a-string-to-number-in-typescript
        const screenId: number = +k;
        const overlay = state.captureOverlays[screenId];
        captureOverlays[screenId] = { ...overlay, show: false };
      });

      return {
        ...state,
        captureArea: {
          screenIdOnSelection: undefined,
          selectedBounds: undefined,
          isRecording: false,
        },
        captureOverlays,
      };
    });
  };

  startAreaSelection = (screenId: number) => {
    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          ...state.captureArea,
          screenIdOnSelection: screenId,
          selectedBounds: undefined,
        },
      };
    });
  };

  finishAreaSelection = (bounds: IBounds) => {
    this.stateManager.updateUiState((state: IUiState): IUiState => {
      return {
        ...state,
        captureArea: {
          ...state.captureArea,
          selectedBounds: bounds,
        },
      };
    });
  };

  startCapture = async (option: ICaptureOption): Promise<void> => {
    const ctx = createCaptureContext(option);
    ctx.outputPath = this.getOutputPath();

    try {
      await this.screenRecorder.record(ctx);
      ctx.status = CaptureStatus.IN_PROGRESS;
      this.tracker.eventL('capture', 'start-capture', 'success');
    } catch (e) {
      ctx.status = CaptureStatus.ERROR;
      this.tracker.eventL('capture', 'start-capture', 'fail');
    }

    this.stateManager.setCaptureContext(ctx);

    if (ctx.status === CaptureStatus.IN_PROGRESS) {
      this.uiDirector.enableRecordingMode();
    } else {
      this.uiDirector.disableCaptureSelectionMode();
    }

    this.uiDirector.refreshAppTrayState();
  };

  pauseCapture = () => {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
  };

  resumeCapture = () => {
    // eslint-disable-next-line no-console
    console.log(this.screenRecorder);
  };

  finishCapture = async (): Promise<void> => {
    this.uiDirector.disableCaptureSelectionMode();

    const curCtx = this.stateManager.getCaptureContext();
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
    this.stateManager.setCaptureContext(newCtx);

    const prefs = this.stateManager.getUserPreferences();
    if (
      newCtx.outputPath &&
      newCtx.status === CaptureStatus.FINISHED &&
      prefs?.openRecordHomeWhenRecordCompleted
    ) {
      this.uiDirector.showItemInFolder(newCtx.outputPath);
    }

    this.uiDirector.refreshAppTrayState();
  };

  private getOutputPath(): string {
    const userPrefs = this.stateManager.getUserPreferences();
    const fileName = dayjs().format('YYYYMMDDHHmmss');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return path.join(userPrefs!.recordHomeDir, `${fileName}.mp4`);
    // return path.join(userPrefs!.recordHomeDir, `${fileName}.webm`);
  }
}
