import type { MouseEvent } from 'react';

export const withStopPropagation = (
  e: MouseEvent<HTMLElement>,
  handler?: () => void,
) => {
  e.stopPropagation();
  if (handler) {
    handler();
  }
  return false;
};
