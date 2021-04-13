import 'reflect-metadata';

import { mock, instance, verify, when } from 'ts-mockito';

import { GlobalRegistry, ScreenRecorder } from '../../components';
import {
  CaptureMode,
  CaptureStatus,
  CaptureContext,
} from '../../entities/capture';

import { CaptureUseCase } from '../capture';

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

  describe('prepareCapture', () => {
    it('should return capture context and save it to registry', () => {
      const context = useCase.prepareCapture({
        mode: CaptureMode.FULLSCREEN,
        screenIndex: 0,
      });
      expect(context).toBeDefined();
      expect(context.createdAt).toBeInstanceOf(Date);
      expect(context.target).toBeDefined();
      expect(context.target.mode).toEqual(CaptureMode.FULLSCREEN);
      verify(mockedGlobalRegistry.setContext(context)).once();
    });
  });

  describe('startCapture', () => {
    it('should get current context from registry and call record with it', () => {
      const capCtx = CaptureContext.create({
        mode: CaptureMode.FULLSCREEN,
        screenIndex: 0,
      });
      when(mockedGlobalRegistry.currentContext()).thenReturn(capCtx);

      const newCtx = useCase.startCapture();
      expect(newCtx.status).toEqual(CaptureStatus.IN_PROGRESS);
      verify(mockedGlobalRegistry.currentContext()).once();
      verify(mockedScreenRecorder.record(newCtx)).once();
    });
  });
});
