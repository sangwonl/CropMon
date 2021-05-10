import 'reflect-metadata';

import { mock, instance, verify, when } from 'ts-mockito';

import { CaptureMode, CaptureStatus, CaptureContext } from '@core/entities';
import { GlobalRegistry, ScreenRecorder } from '@core/components';
import { CaptureUseCase } from '@core/usecases/capture';

describe('CaptureUseCase', () => {
  let mockedGlobalRegistry: GlobalRegistry;
  let mockRegistry: GlobalRegistry;

  let mockedScreenRecorder: ScreenRecorder;
  let mockRecorder: ScreenRecorder;

  let useCase: CaptureUseCase;

  beforeEach(() => {
    mockedGlobalRegistry = mock(GlobalRegistry);
    mockedScreenRecorder = mock<ScreenRecorder>();

    mockRegistry = instance(mockedGlobalRegistry);
    mockRecorder = instance(mockedScreenRecorder);

    useCase = new CaptureUseCase(mockRegistry, mockRecorder);
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', () => {
      const newCtx = useCase.startCapture({
        mode: CaptureMode.FULLSCREEN,
        screenId: 0,
      });
      expect(newCtx.status).toEqual(CaptureStatus.IN_PROGRESS);
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
      verify(mockedGlobalRegistry.setCaptureContext(newCtx)).once();

      const capCtx = new CaptureContext({
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
