import 'reflect-metadata';

import { mock, instance, verify } from 'ts-mockito';

import { GlobalRegistry, ScreenRecorder } from '../../components';
import { CaptureUseCase } from '../capture';

describe('CaptureUseCase', () => {
  const MockGlobalRegistry: GlobalRegistry = mock(GlobalRegistry);
  const MockScreenRecorder: ScreenRecorder = mock<ScreenRecorder>();

  let mockRegistry: GlobalRegistry;
  let mockRecorder: ScreenRecorder;

  let useCase: CaptureUseCase;

  beforeEach(() => {
    mockRegistry = instance(MockGlobalRegistry);
    mockRecorder = instance(MockScreenRecorder);
    useCase = new CaptureUseCase(mockRegistry, mockRecorder);
  });

  it('should return capture context when prepre called', () => {
    const context = useCase.prepareCapture();
    expect(context).toBeDefined();
    verify(MockGlobalRegistry.setContext(context)).once();
  });
});
