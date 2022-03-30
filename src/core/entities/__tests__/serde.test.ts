/* eslint-disable @typescript-eslint/dot-notation */

import { CaptureMode } from '@core/entities/common';
import { ICaptureTarget } from '@core/entities/capture';

describe('Entities', () => {
  it('should still expose private fields when serialization', () => {
    const target: ICaptureTarget = {
      mode: CaptureMode.SCREEN,
      bounds: undefined,
    };

    // because nothing is private in js which typescript is transpiled to.
    const ctx = createCaptureContext(target, '/home/videos');
    const serialized = JSON.parse(JSON.stringify(ctx));
    expect(serialized).toHaveProperty('createdAt');

    const createdAt = new Date(serialized['createdAt']);
    expect(createdAt).toBeDefined();
    expect(createdAt).toBeInstanceOf(Date);
  });
});
