import { getIntersection } from '@utils/bounds';

import type { Bounds } from '@domain/models/screen';

describe('getIntersection', () => {
  it('should return zero-based bounds', () => {
    const selectedBounds = { x: 50, y: 25, width: 100, height: 50 };
    const screenBounds: Bounds[] = [
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 100, y: 50, width: 100, height: 100 },
    ];
    const expectedSlices = [
      { x: 50, y: 25, width: 50, height: 50 },
      { x: 100, y: 50, width: 50, height: 25 },
    ];

    expect(getIntersection(selectedBounds, screenBounds[0])).toEqual(
      expectedSlices[0],
    );
    expect(getIntersection(selectedBounds, screenBounds[1])).toEqual(
      expectedSlices[1],
    );
  });

  it('should return same slices for the right aligned primary too', () => {
    const selectedBounds = { x: -50, y: -25, width: 100, height: 50 };
    const screenBounds: Bounds[] = [
      { x: -100, y: -50, width: 100, height: 100 },
      { x: 0, y: 0, width: 100, height: 100 },
    ];
    const expectedSlices = [
      { x: -50, y: -25, width: 50, height: 50 },
      { x: 0, y: 0, width: 50, height: 25 },
    ];

    expect(getIntersection(selectedBounds, screenBounds[0])).toEqual(
      expectedSlices[0],
    );
    expect(getIntersection(selectedBounds, screenBounds[1])).toEqual(
      expectedSlices[1],
    );
  });
});
