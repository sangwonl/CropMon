/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { useState, useRef, useEffect, SetStateAction, Dispatch } from 'react';

export const useStateWithGetter = <S>(
  initialState: S
): [S, () => S, Dispatch<SetStateAction<S>>] => {
  const [state, setState] = useState<S>(initialState);
  const stateRef = useRef<S>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, () => stateRef.current, setState];
};
