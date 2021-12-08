import {
  CaptureMode,
  ICaptureTarget,
  createCaptureContext,
} from '@core/entities/capture';

describe('Entities', () => {
  it('should still expose private fields when serialization', () => {
    const target: ICaptureTarget = {
      mode: CaptureMode.FULLSCREEN,
      bounds: undefined,
    };

    // because nothing is private in js which typescript is transpiled to.
    const ctx = createCaptureContext(target, '/home/videos');
    const serialized = JSON.parse(JSON.stringify(ctx));
    expect(serialized).toHaveProperty('createdAt');

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const createdAt = new Date(serialized['createdAt']);
    expect(createdAt).toBeDefined();
    expect(createdAt).toBeInstanceOf(Date);
  });
});
