import 'reflect-metadata';

import { mock, instance, verify, when } from 'ts-mockito';

import {
  CaptureMode,
  CaptureStatus,
  createCaptureContext,
} from '@core/entities/capture';
import { IPreferences } from '@core/entities/preferences';
import { IGlobalRegistry, IScreenRecorder } from '@core/components';
import { CaptureUseCase } from '@core/usecases/capture';

describe('CaptureUseCase', () => {
  let mockedGlobalRegistry: IGlobalRegistry;
  let mockRegistry: IGlobalRegistry;

  let mockedScreenRecorder: IScreenRecorder;
  let mockRecorder: IScreenRecorder;

  let useCase: CaptureUseCase;
  let mockPrefs: IPreferences;

  beforeEach(() => {
    mockedGlobalRegistry = mock(IGlobalRegistry);
    mockedScreenRecorder = mock<IScreenRecorder>();

    mockRegistry = instance(mockedGlobalRegistry);
    mockRecorder = instance(mockedScreenRecorder);

    useCase = new CaptureUseCase(mockRegistry, mockRecorder);

    mockPrefs = {
      recordHomeDir: '/tmp/recordhome',
      openRecordHomeDirWhenRecordCompleted: true,
    };
    when(mockedGlobalRegistry.getUserPreferences()).thenReturn(mockPrefs);
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', () => {
      const newCtx = useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      expect(newCtx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(newCtx.outputPath).toContain(mockPrefs.recordHomeDir);

      verify(mockedGlobalRegistry.getUserPreferences()).once();
      verify(mockedGlobalRegistry.setCaptureContext(newCtx)).once();
      verify(mockedScreenRecorder.record(newCtx)).once();
    });
  });

  describe('finishCapture', () => {
    it('should call recorder finish method', () => {
      const newCtx = useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      expect(newCtx.status).toEqual(CaptureStatus.IN_PROGRESS);
      expect(newCtx.outputPath).toContain(mockPrefs.recordHomeDir);

      verify(mockedGlobalRegistry.getUserPreferences()).once();
      verify(mockedGlobalRegistry.setCaptureContext(newCtx)).once();

      const capCtx = createCaptureContext({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      when(mockedGlobalRegistry.getCaptureContext()).thenReturn(capCtx);

      const updatedCtx = useCase.finishCapture();
      expect(updatedCtx.status).toEqual(CaptureStatus.FINISHED);
      verify(mockedScreenRecorder.finish(capCtx)).once();
    });
  });
});
