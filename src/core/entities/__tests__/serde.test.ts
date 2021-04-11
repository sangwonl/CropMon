import { CaptureContext, CaptureMode, CaptureOption } from '../capture';

describe('Entities', () => {
  it('should still expose private fields when serialization', () => {
    const option = new CaptureOption(CaptureMode.FULLSCREEN);

    // because nothing is private in js which typescript is transpiled to.
    const ctx = CaptureContext.create(option);
    const serialized = JSON.parse(JSON.stringify(ctx));
    expect(serialized).toHaveProperty('sessionId');
    expect(serialized).toHaveProperty('createdAt');

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const createdAt = new Date(serialized['createdAt']);
    expect(createdAt).toBeDefined();
    expect(createdAt).toBeInstanceOf(Date);

    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(serialized['sessionId']).toBeDefined();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(serialized['sessionId'].length).toEqual(10);
  });
});
