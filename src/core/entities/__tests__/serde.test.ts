import {
  CaptureMode,
  ICaptureOption,
  createCaptureContext,
} from '@core/entities/capture';

describe('Entities', () => {
  it('should still expose private fields when serialization', () => {
    const option: ICaptureOption = {
      mode: CaptureMode.FULLSCREEN,
      screenId: 0,
    };

    // because nothing is private in js which typescript is transpiled to.
    const ctx = createCaptureContext(option);
    const serialized = JSON.parse(JSON.stringify(ctx));
    expect(serialized).toHaveProperty('createdAt');

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const createdAt = new Date(serialized['createdAt']);
    expect(createdAt).toBeDefined();
    expect(createdAt).toBeInstanceOf(Date);
  });
});
