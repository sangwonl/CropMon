import { mock, instance } from 'ts-mockito';

import { ScreenRecorder } from '../../components';
import { CaptureUseCase } from '../capture';

describe('CaptureUseCase', () => {
  const MockScreenRecorder: ScreenRecorder = mock<ScreenRecorder>();
  const mockRecorder = instance(MockScreenRecorder);

  it('should return capture context when prepre called', () => {
    const useCase = new CaptureUseCase(mockRecorder);
    const context = useCase.prepareCapture();
    expect(context).toBeDefined();
  });
});
