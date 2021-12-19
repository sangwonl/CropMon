/* eslint-disable react-hooks/exhaustive-deps */

import { DependencyList, useEffect } from 'react';

const useOnEscape = (handler: () => void, deps?: DependencyList): void => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === 'Escape') {
        handler();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handler, ...(deps ?? [])]);
};

export default useOnEscape;
