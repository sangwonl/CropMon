import { mock, instance, verify, when, capture } from 'ts-mockito';

import { CaptureMode, CaptureStatus } from '@domain/models/common';
import { Preferences } from '@domain/models/preferences';

import StartCaptureUseCase from '@application/usecases/StartCapture';
import FinishCaptureUseCase from '@application/usecases/FinishCapture';
import PreferencesRepository from '@adapters/repositories/preferences';
import CaptureModeManager from '@application/services/ui/mode';
import CaptureSession from '@domain/services/capture';
import StateManager from '@application/services/ui/state';
import HookManager from '@application/services/hook';
import { ScreenRecorder } from '@domain/services/recorder';
import { UiDirector } from '@application/ports/director';

import { DEFAULT_SHORTCUT_CAPTURE } from '@utils/shortcut';

describe('CaptureUseCase', () => {
  let mockedPrefsRepo: PreferencesRepository;

  let mockedStateManager: StateManager;
  let mockStateMgr: StateManager;

  let mockedHookManager: HookManager;
  let mockHookMgr: HookManager;

  let mockedCaptModeManager: CaptureModeManager;
  let mockCaptModeMgr: CaptureModeManager;

  let mockedCaptSession: CaptureSession;
  let mockCaptSession: CaptureSession;

  let mockedScreenRecorder: ScreenRecorder;
  let mockRecorder: ScreenRecorder;

  let mockedUiDirector: UiDirector;
  let mockUiDirector: UiDirector;

  let startCaptUseCase: StartCaptureUseCase;
  let finishCaptUseCase: FinishCaptureUseCase;

  const defaultPrefs: Preferences = {
    initialLoaded: false,
    version: '0.0.1',
    runAtStartup: true,
    shortcut: 'Ctrl+Shift+S',
    recordHome: '/var/capture',
    openRecordHomeWhenRecordCompleted: true,
    showCountdown: false,
    recordMicrophone: false,
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
    mockedPrefsRepo = mock(PreferencesRepository);
    mockedStateManager = mock(StateManager);
    mockedHookManager = mock(HookManager);
    mockedCaptModeManager = mock(CaptureModeManager);
    mockedCaptSession = mock(CaptureSession);
    mockedScreenRecorder = mock<ScreenRecorder>();
    mockedUiDirector = mock<UiDirector>();

    mockStateMgr = instance(mockedStateManager);
    mockHookMgr = instance(mockedHookManager);
    mockCaptModeMgr = instance(mockedCaptModeManager);
    mockCaptSession = instance(mockedCaptSession);
    mockRecorder = instance(mockedScreenRecorder);
    mockUiDirector = instance(mockedUiDirector);

    startCaptUseCase = new StartCaptureUseCase(
      mockUiDirector,
      mockStateMgr,
      mockHookMgr,
      mockCaptModeMgr,
      mockCaptSession
    );

    finishCaptUseCase = new FinishCaptureUseCase(
      mockUiDirector,
      mockHookMgr,
      mockCaptModeMgr,
      mockCaptSession
    );

    const mockPrefs = {
      ...defaultPrefs,
      version: '0.0.1',
      recordHome: '/tmp/recordhome',
      openRecordHomeWhenRecordCompleted: true,
      shortcut: DEFAULT_SHORTCUT_CAPTURE,
    };

    when(mockedPrefsRepo.fetchUserPreferences()).thenResolve(mockPrefs);
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', async () => {
      await startCaptUseCase.execute();

      const [ctx] = capture(mockedScreenRecorder.record).last();
      expect(ctx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(ctx.outputPath).toContain('recordhome');

      verify(mockedPrefsRepo.fetchUserPreferences()).once();
      verify(mockedScreenRecorder.record(ctx)).once();
    });
  });

  describe('finishCapture', () => {
    it('should call recorder finish method', async () => {
      await startCaptUseCase.execute();

      const [ctx] = capture(mockedScreenRecorder.record).last();
      expect(ctx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(ctx.outputPath).toContain('recordhome');

      verify(mockedPrefsRepo.fetchUserPreferences()).once();
      verify(mockedScreenRecorder.record(ctx)).once();

      await finishCaptUseCase.execute();

      const updatedCtx = mockCaptSession.getCurCaptureContext();
      expect(updatedCtx).toBeDefined();
      expect(updatedCtx?.status).toEqual(CaptureStatus.FINISHED);
      verify(mockedScreenRecorder.finish(ctx)).once();
    });
  });
});
