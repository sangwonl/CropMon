import { CaptureContext } from '../capture';

describe('Entities', () => {
  it('should still expose private fields when serialization', () => {
    // because nothing is private in js which typescript is transpiled to.
    const ctx = new CaptureContext();
    const serialized = JSON.parse(JSON.stringify(ctx));
    expect(serialized).toHaveProperty('startedAt');

    // eslint-disable-next-line @typescript-eslint/dot-notation
    const startedAt = new Date(serialized['startedAt']);
    expect(startedAt).toBeDefined();
    expect(startedAt).toBeInstanceOf(Date);
  });
});
