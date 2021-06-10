import 'reflect-metadata';

import { mock, instance, verify, when } from 'ts-mockito';

import {
  CaptureMode,
  CaptureStatus,
  createCaptureContext,
} from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { GlobalRegistry } from '@core/components/registry';
import { IScreenRecorder } from '@core/components/recorder';
import { CaptureUseCase } from '@core/usecases/capture';
import { IAnalyticsTracker } from '@core/components/tracker';

describe('CaptureUseCase', () => {
  let mockedGlobalRegistry: GlobalRegistry;
  let mockRegistry: GlobalRegistry;

  let mockedScreenRecorder: IScreenRecorder;
  let mockRecorder: IScreenRecorder;

  let mockedAnalyticsTracker: IAnalyticsTracker;
  let mockTracker: IAnalyticsTracker;

  let useCase: CaptureUseCase;
  let mockPrefs: IPreferences;

  beforeEach(() => {
    mockedGlobalRegistry = mock(GlobalRegistry);
    mockedScreenRecorder = mock<IScreenRecorder>();
    mockedAnalyticsTracker = mock<IAnalyticsTracker>();

    mockRegistry = instance(mockedGlobalRegistry);
    mockRecorder = instance(mockedScreenRecorder);
    mockTracker = instance(mockedAnalyticsTracker);

    useCase = new CaptureUseCase(mockRegistry, mockRecorder, mockTracker);

    mockPrefs = {
      version: '0.0.1',
      recordHomeDir: '/tmp/recordhome',
      openRecordHomeDirWhenRecordCompleted: true,
    };
    when(mockedGlobalRegistry.getUserPreferences()).thenReturn(mockPrefs);
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', async () => {
      const newCtx = await useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      expect(newCtx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(newCtx.outputPath).toContain('recordhome');

      verify(mockedGlobalRegistry.getUserPreferences()).once();
      verify(mockedGlobalRegistry.setCaptureContext(newCtx)).once();
      verify(mockedScreenRecorder.record(newCtx)).once();
    });
  });

  describe('finishCapture', () => {
    it('should call recorder finish method', async () => {
      const newCtx = await useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      expect(newCtx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(newCtx.outputPath).toContain('recordhome');

      verify(mockedGlobalRegistry.getUserPreferences()).once();
      verify(mockedGlobalRegistry.setCaptureContext(newCtx)).once();

      const capCtx = createCaptureContext({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      when(mockedGlobalRegistry.getCaptureContext()).thenReturn(capCtx);

      const updatedCtx = await useCase.finishCapture();
      expect(updatedCtx.status).toEqual(CaptureStatus.FINISHED);
      verify(mockedScreenRecorder.finish(capCtx)).once();
    });
  });
});
