import 'reflect-metadata';

import { mock, instance, verify, when, capture } from 'ts-mockito';

import { CaptureMode, CaptureStatus } from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { StateManager } from '@core/interfaces/state';
import { IScreenRecorder } from '@core/interfaces/recorder';
import { IAnalyticsTracker } from '@core/interfaces/tracker';
import { IUiDirector } from '@core/interfaces/director';
import { CaptureUseCase } from '@core/usecases/capture';
import { PreferencesUseCase } from '@core/usecases/preferences';
import { INITIAL_SHORTCUT } from '@utils/shortcut';

describe('CaptureUseCase', () => {
  let mockedPrefsUseCase: PreferencesUseCase;
  let mockPrefsUseCase: PreferencesUseCase;

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
    mockedPrefsUseCase = mock(PreferencesUseCase);
    mockedStateManager = mock(StateManager);
    mockedScreenRecorder = mock<IScreenRecorder>();
    mockedUiDirector = mock<IUiDirector>();
    mockedAnalyticsTracker = mock<IAnalyticsTracker>();

    mockPrefsUseCase = instance(mockedPrefsUseCase);
    mockStateMgr = instance(mockedStateManager);
    mockRecorder = instance(mockedScreenRecorder);
    mockUiDirector = instance(mockedUiDirector);
    mockTracker = instance(mockedAnalyticsTracker);

    useCase = new CaptureUseCase(
      mockPrefsUseCase,
      mockStateMgr,
      mockRecorder,
      mockUiDirector,
      mockTracker
    );

    mockPrefs = {
      version: '0.0.1',
      recordHome: '/tmp/recordhome',
      openRecordHomeWhenRecordCompleted: true,
      shortcut: INITIAL_SHORTCUT,
    };
    when(mockedPrefsUseCase.fetchUserPreferences()).thenResolve(mockPrefs);
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', async () => {
      await useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });

      const [ctx] = capture(mockedScreenRecorder.record).last();
      expect(ctx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(ctx.outputPath).toContain('recordhome');

      verify(mockedPrefsUseCase.fetchUserPreferences()).once();
      verify(mockedScreenRecorder.record(ctx)).once();
    });
  });

  describe('finishCapture', () => {
    it('should call recorder finish method', async () => {
      await useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });

      const [ctx] = capture(mockedScreenRecorder.record).last();
      expect(ctx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(ctx.outputPath).toContain('recordhome');

      verify(mockedPrefsUseCase.fetchUserPreferences()).once();
      verify(mockedScreenRecorder.record(ctx)).once();

      await useCase.finishCapture();

      const updatedCtx = useCase.curCaptureContext();
      expect(updatedCtx).toBeDefined();
      expect(updatedCtx?.status).toEqual(CaptureStatus.FINISHED);
      verify(mockedScreenRecorder.finish(ctx)).once();
    });
  });
});
