/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useEffect, MutableRefObject } from 'react';

const useOnClickOutside = (
  handler?: (event: any) => void
): MutableRefObject<any | undefined> => {
  const ref = useRef<any>();
  useEffect(
    () => {
      const listener = (event: any) => {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        if (handler) {
          handler(event);
        }
      };
      document.addEventListener('click', listener);
      return () => {
        document.removeEventListener('click', listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  );
  return ref;
};

export default useOnClickOutside;
