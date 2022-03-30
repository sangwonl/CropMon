import { mock, instance, verify, when, capture } from 'ts-mockito';

import { CaptureMode, CaptureStatus } from '@core/entities/common';
import { IPreferences } from '@core/entities/preferences';
import { StateManager } from '@core/services/state';
import { IScreenRecorder } from '@core/services/recorder';
import { IUiDirector } from '@core/services/director';
import CaptureUseCase from '@core/usecases/capture';
import PreferencesUseCase from '@core/usecases/preferences';
import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';
import HookManager from '@core/services/hook';

describe('CaptureUseCase', () => {
  let mockedPrefsUseCase: PreferencesUseCase;
  let mockPrefsUseCase: PreferencesUseCase;

  let mockedStateManager: StateManager;
  let mockStateMgr: StateManager;

  let mockedHookManager: HookManager;
  let mockHookMgr: HookManager;

  let mockedScreenRecorder: IScreenRecorder;
  let mockRecorder: IScreenRecorder;

  let mockedUiDirector: IUiDirector;
  let mockUiDirector: IUiDirector;

  let useCase: CaptureUseCase;

  const defaultPrefs: IPreferences = {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    shortcut: 'Ctrl+Shift+S',
    recordHome: '/var/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordMicrophone: false,
    recordQualityMode: 'normal',
    outputFormat: 'mp4',
    captureMode: CaptureMode.AREA,
    colors: {
      selectingBackground: '#fefefe',
      selectingText: '#efefef',
      countdownBackground: '#fefefe',
      countdownText: '#efefef',
    },
  };

  beforeEach(() => {
    mockedPrefsUseCase = mock(PreferencesUseCase);
    mockedStateManager = mock(StateManager);
    mockedHookManager = mock(HookManager);
    mockedScreenRecorder = mock<IScreenRecorder>();
    mockedUiDirector = mock<IUiDirector>();

    mockPrefsUseCase = instance(mockedPrefsUseCase);
    mockStateMgr = instance(mockedStateManager);
    mockHookMgr = instance(mockedHookManager);
    mockRecorder = instance(mockedScreenRecorder);
    mockUiDirector = instance(mockedUiDirector);

    useCase = new CaptureUseCase(
      mockPrefsUseCase,
      mockStateMgr,
      mockHookMgr,
      mockRecorder,
      mockUiDirector
    );

    const mockPrefs = {
      ...defaultPrefs,
      version: '0.0.1',
      recordHome: '/tmp/recordhome',
      openRecordHomeWhenRecordCompleted: true,
      shortcut: DEFAULT_SHORTCUT_CAPTURE,
    };

    when(mockedPrefsUseCase.fetchUserPreferences()).thenResolve(mockPrefs);
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', async () => {
      await useCase.startCapture();

      const [ctx] = capture(mockedScreenRecorder.record).last();
      expect(ctx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(ctx.outputPath).toContain('recordhome');

      verify(mockedPrefsUseCase.fetchUserPreferences()).once();
      verify(mockedScreenRecorder.record(ctx)).once();
    });
  });

  describe('finishCapture', () => {
    it('should call recorder finish method', async () => {
      await useCase.startCapture();

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
