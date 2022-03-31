import { mock, instance, verify, when, capture } from 'ts-mockito';

import { CaptureMode, CaptureStatus } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';

import CaptureUseCase from '@application/usecases/capture';
import PreferencesUseCase from '@application/usecases/preferences';
import StateManager from '@application/services/state';
import HookManager from '@application/services/hook';
import { ScreenRecorder } from '@application/ports/recorder';
import { UiDirector } from '@application/ports/director';

import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';

describe('CaptureUseCase', () => {
  let mockedPrefsUseCase: PreferencesUseCase;
  let mockPrefsUseCase: PreferencesUseCase;

  let mockedStateManager: StateManager;
  let mockStateMgr: StateManager;

  let mockedHookManager: HookManager;
  let mockHookMgr: HookManager;

  let mockedScreenRecorder: ScreenRecorder;
  let mockRecorder: ScreenRecorder;

  let mockedUiDirector: UiDirector;
  let mockUiDirector: UiDirector;

  let useCase: CaptureUseCase;

  const defaultPrefs: Preferences = {
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
    mockedScreenRecorder = mock<ScreenRecorder>();
    mockedUiDirector = mock<UiDirector>();

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
