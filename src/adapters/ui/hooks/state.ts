import { ipcRenderer, IpcRendererEvent } from 'electron';
import { useState, useRef, useEffect, SetStateAction, Dispatch } from 'react';

import { UiState } from '@application/models/ui';

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

export const useRootUiState = (): UiState => {
  const [uiState, setUiState] = useState<UiState>(
    ipcRenderer.sendSync('getStates')
  );

  useEffect(() => {
    const handleSyncStates = (_event: IpcRendererEvent, newState: UiState) => {
      setUiState(newState);
    };
    ipcRenderer.on('syncStates', handleSyncStates);
    return () => {
      ipcRenderer.removeListener('syncStates', handleSyncStates);
    };
  }, []);

  return uiState;
};
