import {
  CaptureContext,
  CaptureMode,
  CaptureOption,
} from '@core/entities/capture';

describe('Entities', () => {
  it('should still expose private fields when serialization', () => {
    const option: CaptureOption = {
      mode: CaptureMode.FULLSCREEN,
      screenIndex: 0,
    };

    // because nothing is private in js which typescript is transpiled to.
    const ctx = new CaptureContext(option);
    const serialized = JSON.parse(JSON.stringify(ctx));
    expect(serialized).toHaveProperty('createdAt');

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const createdAt = new Date(serialized['createdAt']);
    expect(createdAt).toBeDefined();
    expect(createdAt).toBeInstanceOf(Date);
  });
});
