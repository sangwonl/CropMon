import 'reflect-metadata';

import { mock, instance, verify, when, capture } from 'ts-mockito';

import {
  CaptureMode,
  CaptureStatus,
  createCaptureContext,
} from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { CaptureUseCase } from '@core/usecases/capture';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { IUiDirector } from '@core/interfaces/director';

describe('CaptureUseCase', () => {
  let mockedStateManager: StateManager;
  let mockStateMgr: StateManager;

  let mockedScreenRecorder: IScreenRecorder;
  let mockRecorder: IScreenRecorder;

  let mockedUiDirector: IUiDirector;
  let mockUiDirector: IUiDirector;

  let mockedAnalyticsTracker: IAnalyticsTracker;
  let mockTracker: IAnalyticsTracker;

  let useCase: CaptureUseCase;
  let mockPrefs: IPreferences;

  beforeEach(() => {
    mockedStateManager = mock(StateManager);
    mockedScreenRecorder = mock<IScreenRecorder>();
    mockedUiDirector = mock<IUiDirector>();
    mockedAnalyticsTracker = mock<IAnalyticsTracker>();

    mockStateMgr = instance(mockedStateManager);
    mockRecorder = instance(mockedScreenRecorder);
    mockUiDirector = instance(mockedUiDirector);
    mockTracker = instance(mockedAnalyticsTracker);

    useCase = new CaptureUseCase(
      mockStateMgr,
      mockRecorder,
      mockUiDirector,
      mockTracker
    );

    mockPrefs = {
      version: '0.0.1',
      recordHomeDir: '/tmp/recordhome',
      openRecordHomeWhenRecordCompleted: true,
      shortcut: 'Super+Shift+E',
    };
    when(mockedStateManager.getUserPreferences()).thenReturn(mockPrefs);
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', async () => {
      await useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });

      const [ctx] = capture(mockedStateManager.setCaptureContext).last();
      expect(ctx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(ctx.outputPath).toContain('recordhome');

      verify(mockedStateManager.getUserPreferences()).once();
      verify(mockedStateManager.setCaptureContext(ctx)).once();
      verify(mockedScreenRecorder.record(ctx)).once();
    });
  });

  describe('finishCapture', () => {
    it('should call recorder finish method', async () => {
      await useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });

      const [ctx] = capture(mockedStateManager.setCaptureContext).last();
      expect(ctx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(ctx.outputPath).toContain('recordhome');

      verify(mockedStateManager.getUserPreferences()).once();
      verify(mockedStateManager.setCaptureContext(ctx)).once();

      const capCtx = createCaptureContext({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      when(mockedStateManager.getCaptureContext()).thenReturn(capCtx);

      await useCase.finishCapture();

      const [updatedCtx] = capture(mockedStateManager.setCaptureContext).last();
      expect(updatedCtx.status).toEqual(CaptureStatus.FINISHED);
      verify(mockedScreenRecorder.finish(capCtx)).once();
    });
  });
});
