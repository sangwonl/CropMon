/* eslint-disable import/prefer-default-export */
import { useCallback, useRef, useState } from 'react';

export const useForceRenderer = (): [number, () => void] => {
  const count = useRef<number>(1);
  const [shouldRender, setShouldRender] = useState<number>(count.current);

  const forceToRender = useCallback(() => {
    count.current += 1;
    setShouldRender(count.current);
  }, []);

  return [shouldRender, forceToRender];
};
